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

        <section className="rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
          <h2 className="text-lg font-semibold text-white">Hotel Stays</h2>
          <div className="mt-4 space-y-3">
            {hotelsWithDocuments.length === 0 && (
              <p className="text-sm text-slate-300">No hotel bookings added yet.</p>
            )}
            {hotelsWithDocuments.map(({ booking, documents }) => (
              <div
                key={booking.id}
                className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
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
                  <p className="text-sm text-slate-300">
                    {formatDate(booking.start_date)}
                    {booking.end_date ? ` to ${formatDate(booking.end_date)}` : ""}
                  </p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/8 bg-slate-900/80 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Place
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">{booking.place ?? "Not detected"}</p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-slate-900/80 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Room Details
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">{booking.room_number ?? "Not detected"}</p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-slate-900/80 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Trip Dates
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">
                      {formatDate(booking.start_date)}
                      {booking.end_date ? ` to ${formatDate(booking.end_date)}` : ""}
                    </p>
                  </div>
                </div>
                {getHotelStayGroups(booking.notes).length > 0 && (
                  <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
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
