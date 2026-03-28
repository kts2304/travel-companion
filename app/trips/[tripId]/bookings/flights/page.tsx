import { notFound } from "next/navigation";

import { AddBookingForm } from "@/components/forms/AddBookingForm";
import { BookingDocumentsPanel } from "@/components/trip/BookingDocumentsPanel";
import { BookingSectionShell } from "@/components/trip/BookingSectionShell";
import { DeleteBookingButton } from "@/components/trip/DeleteBookingButton";
import { MyTravelPanel } from "@/components/trip/MyTravelPanel";
import { getBookingsByTrip, getDocumentsForBooking } from "@/services/bookingService";
import { getMembersByTrip } from "@/services/memberService";
import { getTripById } from "@/services/tripService";

interface FlightsTransportPageProps {
  params: Promise<{ tripId: string }>;
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export default async function FlightsTransportPage({ params }: FlightsTransportPageProps) {
  const { tripId } = await params;
  const trip = await getTripById(tripId);

  if (!trip) {
    notFound();
  }

  const [members, bookings] = await Promise.all([
    getMembersByTrip(tripId),
    getBookingsByTrip(tripId),
  ]);

  const relevantBookings = bookings.filter((booking) =>
    ["flight", "bus", "transport"].includes(booking.type),
  );
  const bookingsWithDocuments = await Promise.all(
    relevantBookings.map(async (booking) => ({
      booking,
      documents: await getDocumentsForBooking(booking.id),
    })),
  );
  const personalBookings = bookingsWithDocuments.filter(({ booking }) =>
    ["flight", "bus"].includes(booking.type),
  );
  const sharedTransportBookings = bookingsWithDocuments.filter(
    ({ booking }) => booking.type === "transport",
  );

  return (
    <BookingSectionShell
      tripId={tripId}
      eyebrow="Bookings / Flights & Transport"
      title="Flights & Transport"
      description="Use this page for personal flight and bus tickets plus shared transport details, while keeping the bookings hub clean."
      artVariant="flights"
    >
      <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <AddBookingForm
          tripId={tripId}
          members={members}
          tripStartDate={trip.start_date}
          tripEndDate={trip.end_date}
          allowedTypes={["flight", "bus", "transport"]}
          heading="Import travel ticket"
          description="Upload flight, bus, or transport PDFs/images here. Personal tickets stay with the traveler and shared transport stays visible to the trip."
        />

        <div className="space-y-6">
          <MyTravelPanel members={members} personalBookings={personalBookings} />

          <section className="travel-card-hover rounded-[28px] border border-fuchsia-400/18 bg-[linear-gradient(180deg,rgba(65,24,95,0.92),rgba(20,14,40,0.96))] p-5 shadow-[0_22px_60px_rgba(61,18,89,0.22)]">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-fuchsia-200/16 bg-white/8 text-fuchsia-100">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 15h16M6 15V9h12v6M8 19v-4M16 19v-4M7 11h2m6 0h2" />
                </svg>
              </span>
              <h2 className="text-lg font-semibold text-white">Shared Transport</h2>
            </div>
            <p className="mt-2 text-sm text-fuchsia-100/78">
              Cabs, airport pickups, and local transport details that belong to the whole trip.
            </p>
            <div className="mt-4 space-y-3">
              {sharedTransportBookings.length === 0 && (
                <p className="text-sm text-fuchsia-100/72">No shared transport bookings added yet.</p>
              )}
              {sharedTransportBookings.map(({ booking, documents }) => (
                <div
                  key={booking.id}
                  className="travel-card-hover rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,35,0.92),rgba(6,12,24,0.98))] p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-100/78">
                        Transport
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-white">{booking.title}</h3>
                    </div>
                    <p className="text-sm text-fuchsia-100/70">{formatDate(booking.start_date)}</p>
                  </div>
                  {booking.notes && <p className="mt-3 text-sm leading-6 text-fuchsia-50/88">{booking.notes}</p>}
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
        </div>
      </section>
    </BookingSectionShell>
  );
}
