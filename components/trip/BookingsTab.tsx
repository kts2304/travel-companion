import { BookingDocumentsPanel } from "@/components/trip/BookingDocumentsPanel";
import { AddBookingForm } from "@/components/forms/AddBookingForm";
import { MyTravelPanel } from "@/components/trip/MyTravelPanel";
import {
  getBookingsByTrip,
  getDocumentsForBooking,
} from "@/services/bookingService";
import type { Member } from "@/types/member";

interface BookingsTabProps {
  tripId: string;
  members: Member[];
}

function formatBookingDate(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function formatBookingType(type: string): string {
  return `${type.charAt(0).toUpperCase()}${type.slice(1)}`;
}

export async function BookingsTab({ tripId, members }: BookingsTabProps) {
  const bookings = await getBookingsByTrip(tripId);
  const bookingsWithDocuments = (
    (
      await Promise.all(
        bookings.map(async (booking) => ({
          booking,
          documents: await getDocumentsForBooking(booking.id),
        })),
      )
    ) ?? []
  ).sort(
    (left, right) =>
      new Date(left.booking.start_date).getTime() - new Date(right.booking.start_date).getTime(),
  );
  const sharedBookings = bookingsWithDocuments.filter(({ booking }) => booking.scope === "shared");
  const personalBookings = bookingsWithDocuments.filter(({ booking }) => booking.scope === "personal");

  return (
    <div className="space-y-6">
      <AddBookingForm tripId={tripId} members={members} />

      <MyTravelPanel members={members} personalBookings={personalBookings} />

      <section>
        <h3 className="text-lg font-semibold text-slate-900">Shared trip timeline</h3>
        <p className="mt-1 text-sm text-slate-600">
          Hotels, group transport, and activities stay visible to the whole trip.
        </p>
        <div className="mt-4 space-y-3">
          {sharedBookings.length === 0 && (
            <p className="text-sm text-slate-600">No shared bookings added yet.</p>
          )}
          {sharedBookings.map(({ booking, documents }) => (
            <div key={booking.id} className="rounded-2xl border border-violet-200 bg-violet-50/80 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-violet-700">
                    {formatBookingType(booking.type)}
                  </p>
                  <h4 className="text-base font-semibold text-slate-900">{booking.title}</h4>
                </div>
                <p className="text-sm font-medium text-slate-700">
                  {formatBookingDate(booking.start_date)}
                </p>
              </div>
              {booking.end_date && (
                <p className="mt-2 text-sm text-slate-600">
                  Ends {formatBookingDate(booking.end_date)}
                </p>
              )}
              {booking.notes && <p className="mt-2 text-sm text-slate-700">{booking.notes}</p>}
              <BookingDocumentsPanel bookingId={booking.id} documents={documents} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
