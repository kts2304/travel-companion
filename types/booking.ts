export type BookingType = "flight" | "bus" | "hotel" | "transport" | "activity";

export type BookingScope = "shared" | "personal";
export type BookingDocumentKind = "booking" | "checkin";

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
  hotel_name: string | null;
  room_number: string | null;
  place: string | null;
  onward_flight_number: string | null;
  onward_departure_at: string | null;
  onward_seat_number: string | null;
  onward_pnr: string | null;
  return_flight_number: string | null;
  return_departure_at: string | null;
  return_seat_number: string | null;
  return_pnr: string | null;
  created_at: string;
}

export interface BookingDocument {
  id: string;
  booking_id: string;
  file_url: string;
  document_kind: BookingDocumentKind;
  created_at: string;
}
