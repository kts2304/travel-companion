import { BookingDocumentsPanel } from "@/components/trip/BookingDocumentsPanel";
import { DeleteBookingButton } from "@/components/trip/DeleteBookingButton";
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
  tripStartDate?: string | null;
  tripEndDate?: string | null;
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

export async function BookingsTab({
  tripId,
  members,
  tripStartDate,
  tripEndDate,
}: BookingsTabProps) {
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
      <AddBookingForm
        tripId={tripId}
        members={members}
        tripStartDate={tripStartDate}
        tripEndDate={tripEndDate}
      />

      <MyTravelPanel members={members} personalBookings={personalBookings} />

      <section>
        <h3 className="text-lg font-semibold text-white">Shared trip timeline</h3>
        <p className="mt-1 text-sm text-slate-300">
          Hotels, group transport, and activities stay visible to the whole trip.
        </p>
        <div className="mt-4 space-y-3">
          {sharedBookings.length === 0 && (
            <p className="text-sm text-slate-300">No shared bookings added yet.</p>
          )}
          {sharedBookings.map(({ booking, documents }) => (
            <div
              key={booking.id}
              className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-violet-200">
                    {formatBookingType(booking.type)}
                  </p>
                  <h4 className="text-base font-semibold text-white">{booking.title}</h4>
                </div>
                <p className="text-sm font-medium text-slate-200">
                  {formatBookingDate(booking.start_date)}
                </p>
              </div>
              {booking.type === "hotel" ? (
                <div className="mt-3 rounded-xl border border-emerald-500/20 bg-[#06111d] p-3 text-sm text-slate-200">
                  <p>
                    Date: {formatBookingDate(booking.start_date)}
                    {booking.end_date ? ` to ${formatBookingDate(booking.end_date)}` : ""}
                  </p>
                  <p className="mt-1">Hotel name: {booking.hotel_name ?? booking.title}</p>
                  <p className="mt-1">Room no: {booking.room_number ?? "-"}</p>
                  <p className="mt-1">Place: {booking.place ?? "-"}</p>
                </div>
              ) : null}
              {booking.end_date && (
                <p className="mt-2 text-sm text-slate-300">
                  Ends {formatBookingDate(booking.end_date)}
                </p>
              )}
              {booking.notes && booking.type !== "hotel" && (
                <p className="mt-2 text-sm text-slate-200">{booking.notes}</p>
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
    </div>
  );
}
