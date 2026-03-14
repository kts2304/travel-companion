import { AddBookingForm } from "@/components/forms/AddBookingForm";
import { getBookingsByTrip } from "@/services/bookingService";

interface BookingsTabProps {
  tripId: string;
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

export async function BookingsTab({ tripId }: BookingsTabProps) {
  const bookings = await getBookingsByTrip(tripId);

  return (
    <div className="space-y-6">
      <AddBookingForm tripId={tripId} />

      <section>
        <h3 className="text-lg font-semibold text-slate-900">Trip timeline</h3>
        <div className="mt-4 space-y-3">
          {bookings.length === 0 && <p className="text-sm text-slate-600">No bookings added yet.</p>}
          {bookings.map((booking) => (
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
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
