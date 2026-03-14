export type BookingType = "flight" | "bus" | "hotel" | "transport" | "activity";

export type BookingScope = "shared" | "personal";

export interface Booking {
  id: string;
  trip_id: string;
  type: BookingType;
  scope: BookingScope;
  member_id: string | null;
  title: string;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface BookingDocument {
  id: string;
  booking_id: string;
  file_url: string;
  created_at: string;
}
