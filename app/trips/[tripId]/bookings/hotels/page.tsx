import { notFound } from "next/navigation";

import { AddBookingForm } from "@/components/forms/AddBookingForm";
import { BookingDocumentsPanel } from "@/components/trip/BookingDocumentsPanel";
import { BookingSectionShell } from "@/components/trip/BookingSectionShell";
import { DeleteBookingButton } from "@/components/trip/DeleteBookingButton";
import { getBookingsByTrip, getDocumentsForBooking } from "@/services/bookingService";
import { getMembersByTrip } from "@/services/memberService";
import { getTripById } from "@/services/tripService";

interface HotelsPageProps {
  params: Promise<{ tripId: string }>;
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function getHotelStayLines(notes: string | null): string[] {
  if (!notes) {
    return [];
  }

  return notes
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

interface HotelStayGroup {
  roomLabel: string;
  lines: string[];
}

function getHotelStayGroups(notes: string | null): HotelStayGroup[] {
  const grouped = new Map<string, string[]>();

  for (const line of getHotelStayLines(notes)) {
    const roomMatch = line.match(/\|\s*Room\s+([^|]+?)(?:\s*\||$)/i);
    const roomLabel = roomMatch?.[1]?.trim() || "Unassigned";
    const existing = grouped.get(roomLabel) ?? [];
    existing.push(line);
    grouped.set(roomLabel, existing);
  }

  return Array.from(grouped.entries()).map(([roomLabel, lines]) => ({
    roomLabel,
    lines,
  }));
}

export default async function HotelsPage({ params }: HotelsPageProps) {
  const { tripId } = await params;
  const trip = await getTripById(tripId);

  if (!trip) {
    notFound();
  }

  const [members, bookings] = await Promise.all([
    getMembersByTrip(tripId),
    getBookingsByTrip(tripId),
  ]);
  const hotelBookings = bookings.filter((booking) => booking.type === "hotel");
  const hotelsWithDocuments = await Promise.all(
    hotelBookings.map(async (booking) => ({
      booking,
      documents: await getDocumentsForBooking(booking.id),
    })),
  );

  return (
    <BookingSectionShell
      tripId={tripId}
      eyebrow="Bookings / Hotels"
      title="Hotels"
      description="Keep hotel stays structured here with room details, place, trip dates, and uploaded hotel vouchers."
      artVariant="hotels"
    >
      <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <AddBookingForm
          tripId={tripId}
          members={members}
          tripStartDate={trip.start_date}
          tripEndDate={trip.end_date}
          allowedTypes={["hotel"]}
          heading="Import hotel booking"
          description="Upload hotel confirmations here. Trip dates are used as the default hotel stay window."
        />

        <section className="travel-card-hover rounded-[28px] border border-emerald-500/18 bg-[linear-gradient(180deg,rgba(20,88,73,0.92),rgba(13,31,30,0.96))] p-5 shadow-[0_22px_60px_rgba(17,71,60,0.2)]">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-100/16 bg-white/8 text-emerald-50">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M5 20V7l7-3 7 3v13M9 20v-4h6v4M9 9h1M14 9h1M9 12h1M14 12h1" />
              </svg>
            </span>
            <h2 className="text-lg font-semibold text-white">Hotel Stays</h2>
          </div>
          <div className="mt-4 space-y-3">
            {hotelsWithDocuments.length === 0 && (
              <p className="text-sm text-emerald-50/78">No hotel bookings added yet.</p>
            )}
            {hotelsWithDocuments.map(({ booking, documents }) => (
              <div
                key={booking.id}
                className="travel-card-hover rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,35,0.92),rgba(6,12,24,0.98))] p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                      Hotel
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-white">
                      {booking.hotel_name ?? booking.title}
                    </h3>
                  </div>
                    <p className="text-sm text-emerald-50/70">
                      {formatDate(booking.start_date)}
                      {booking.end_date ? ` to ${formatDate(booking.end_date)}` : ""}
                    </p>
                  </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/8 bg-white/8 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-50/56">
                      Place
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">{booking.place ?? "Not detected"}</p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/8 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-50/56">
                      Room Details
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">{booking.room_number ?? "Not detected"}</p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/8 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-50/56">
                      Trip Dates
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">
                      {formatDate(booking.start_date)}
                      {booking.end_date ? ` to ${formatDate(booking.end_date)}` : ""}
                    </p>
                  </div>
                </div>
                {getHotelStayGroups(booking.notes).length > 0 && (
                  <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
                      Room-wise Stay Breakdown
                    </p>
                    <div className="mt-3 space-y-2">
                      {getHotelStayGroups(booking.notes).map((group) => (
                        <div
                          key={`${booking.id}-${group.roomLabel}`}
                          className="rounded-xl border border-white/8 bg-slate-900/70 p-3"
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
                            Room {group.roomLabel}
                          </p>
                          <div className="mt-2 space-y-2">
                            {group.lines.map((line) => (
                              <div
                                key={`${booking.id}-${group.roomLabel}-${line}`}
                                className="rounded-lg border border-white/8 bg-slate-950/70 px-3 py-2 text-sm text-slate-100"
                              >
                                {line}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <BookingDocumentsPanel bookingId={booking.id} documents={documents} />
                <DeleteBookingButton
                  bookingId={booking.id}
                  bookingLabel={booking.title}
                  documents={documents}
                />
              </div>
            ))}
          </div>
        </section>
      </section>
    </BookingSectionShell>
  );
}
