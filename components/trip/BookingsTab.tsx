import { BookingsHub } from "@/components/trip/BookingsHub";
import { getBookingsByTrip } from "@/services/bookingService";

interface BookingsTabProps {
  tripId: string;
}

export async function BookingsTab({
  tripId,
}: BookingsTabProps) {
  const bookings = await getBookingsByTrip(tripId);
  const flightCount = bookings.filter((booking) =>
    ["flight", "bus", "transport"].includes(booking.type),
  ).length;
  const hotelCount = bookings.filter((booking) => booking.type === "hotel").length;
  const activityCount = bookings.filter((booking) => booking.type === "activity").length;

  return (
    <BookingsHub
      tripId={tripId}
      flightCount={flightCount}
      hotelCount={hotelCount}
      activityCount={activityCount}
    />
  );
}
