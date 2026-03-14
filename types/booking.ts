export type BookingType = "flight" | "hotel" | "transport" | "activity";

export interface Booking {
  id: string;
  trip_id: string;
  type: BookingType;
  title: string;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  created_at: string;
}
