import { supabase } from "@/lib/supabaseClient";
import type {
  Booking,
  BookingDocument,
  BookingDocumentKind,
  BookingScope,
  BookingType,
} from "@/types/booking";

interface CreateBookingInput {
  tripId: string;
  type: BookingType;
  scope: BookingScope;
  memberId?: string;
  title: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  hotelName?: string;
  roomNumber?: string;
  place?: string;
  onwardOrigin?: string;
  onwardDestination?: string;
  onwardFlightNumber?: string;
  onwardDepartureAt?: string;
  onwardSeatNumber?: string;
  onwardPnr?: string;
  returnOrigin?: string;
  returnDestination?: string;
  returnFlightNumber?: string;
  returnDepartureAt?: string;
  returnSeatNumber?: string;
  returnPnr?: string;
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  if (input.scope === "personal" && !input.memberId) {
    throw new Error("A traveler is required for personal tickets.");
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      trip_id: input.tripId,
      type: input.type,
      scope: input.scope,
      member_id: input.memberId ?? null,
      title: input.title,
      start_date: input.startDate,
      end_date: input.endDate || null,
      notes: input.notes?.trim() || null,
      hotel_name: input.hotelName?.trim() || null,
      room_number: input.roomNumber?.trim() || null,
      place: input.place?.trim() || null,
      onward_origin: input.onwardOrigin?.trim() || null,
      onward_destination: input.onwardDestination?.trim() || null,
      onward_flight_number: input.onwardFlightNumber?.trim() || null,
      onward_departure_at: input.onwardDepartureAt || null,
      onward_seat_number: input.onwardSeatNumber?.trim() || null,
      onward_pnr: input.onwardPnr?.trim() || null,
      return_origin: input.returnOrigin?.trim() || null,
      return_destination: input.returnDestination?.trim() || null,
      return_flight_number: input.returnFlightNumber?.trim() || null,
      return_departure_at: input.returnDepartureAt || null,
      return_seat_number: input.returnSeatNumber?.trim() || null,
      return_pnr: input.returnPnr?.trim() || null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: String(data.id),
    trip_id: String(data.trip_id),
    type: data.type as BookingType,
    scope: data.scope as BookingScope,
    member_id: data.member_id ? String(data.member_id) : null,
    title: String(data.title),
    start_date: String(data.start_date),
    end_date: data.end_date ? String(data.end_date) : null,
    notes: data.notes ? String(data.notes) : null,
    hotel_name: data.hotel_name ? String(data.hotel_name) : null,
    room_number: data.room_number ? String(data.room_number) : null,
    place: data.place ? String(data.place) : null,
    onward_origin: data.onward_origin ? String(data.onward_origin) : null,
    onward_destination: data.onward_destination ? String(data.onward_destination) : null,
    onward_flight_number: data.onward_flight_number ? String(data.onward_flight_number) : null,
    onward_departure_at: data.onward_departure_at ? String(data.onward_departure_at) : null,
    onward_seat_number: data.onward_seat_number ? String(data.onward_seat_number) : null,
    onward_pnr: data.onward_pnr ? String(data.onward_pnr) : null,
    return_origin: data.return_origin ? String(data.return_origin) : null,
    return_destination: data.return_destination ? String(data.return_destination) : null,
    return_flight_number: data.return_flight_number ? String(data.return_flight_number) : null,
    return_departure_at: data.return_departure_at ? String(data.return_departure_at) : null,
    return_seat_number: data.return_seat_number ? String(data.return_seat_number) : null,
    return_pnr: data.return_pnr ? String(data.return_pnr) : null,
    created_at: String(data.created_at),
  };
}

export async function getBookingsByTrip(tripId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("trip_id", tripId)
    .order("start_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((booking) => ({
    id: String(booking.id),
    trip_id: String(booking.trip_id),
    type: booking.type as BookingType,
    scope: booking.scope as BookingScope,
    member_id: booking.member_id ? String(booking.member_id) : null,
    title: String(booking.title),
    start_date: String(booking.start_date),
    end_date: booking.end_date ? String(booking.end_date) : null,
    notes: booking.notes ? String(booking.notes) : null,
    hotel_name: booking.hotel_name ? String(booking.hotel_name) : null,
    room_number: booking.room_number ? String(booking.room_number) : null,
    place: booking.place ? String(booking.place) : null,
    onward_origin: booking.onward_origin ? String(booking.onward_origin) : null,
    onward_destination: booking.onward_destination ? String(booking.onward_destination) : null,
    onward_flight_number: booking.onward_flight_number ? String(booking.onward_flight_number) : null,
    onward_departure_at: booking.onward_departure_at ? String(booking.onward_departure_at) : null,
    onward_seat_number: booking.onward_seat_number ? String(booking.onward_seat_number) : null,
    onward_pnr: booking.onward_pnr ? String(booking.onward_pnr) : null,
    return_origin: booking.return_origin ? String(booking.return_origin) : null,
    return_destination: booking.return_destination ? String(booking.return_destination) : null,
    return_flight_number: booking.return_flight_number ? String(booking.return_flight_number) : null,
    return_departure_at: booking.return_departure_at ? String(booking.return_departure_at) : null,
    return_seat_number: booking.return_seat_number ? String(booking.return_seat_number) : null,
    return_pnr: booking.return_pnr ? String(booking.return_pnr) : null,
    created_at: String(booking.created_at),
  }));
}

export async function deleteBooking(bookingId: string): Promise<void> {
  const { error } = await supabase.from("bookings").delete().eq("id", bookingId);

  if (error) {
    throw new Error(error.message);
  }
}

function getStoragePathFromPublicUrl(fileUrl: string): string | null {
  try {
    const url = new URL(fileUrl);
    const marker = "/storage/v1/object/public/booking-documents/";
    const pathIndex = url.pathname.indexOf(marker);

    if (pathIndex === -1) {
      return null;
    }

    return decodeURIComponent(url.pathname.slice(pathIndex + marker.length));
  } catch {
    return null;
  }
}

export async function deleteBookingEntry(
  bookingId: string,
  documents: BookingDocument[],
): Promise<void> {
  const filePaths = documents
    .map((document) => getStoragePathFromPublicUrl(document.file_url))
    .filter((filePath): filePath is string => Boolean(filePath));

  if (filePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("booking-documents")
      .remove(filePaths);

    if (storageError) {
      throw new Error(storageError.message);
    }
  }

  await deleteBooking(bookingId);
}

function validateBookingDocument(file: File) {
  const isPdf = file.type === "application/pdf";
  const isImage = file.type.startsWith("image/");

  if (!isPdf && !isImage) {
    throw new Error("Only PDF and image documents are supported.");
  }
}

function getSafeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadBookingDocument(
  bookingId: string,
  file: File,
  documentKind: BookingDocumentKind = "booking",
): Promise<BookingDocument> {
  validateBookingDocument(file);

  const filePath = `${bookingId}/${Date.now()}-${getSafeFileName(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from("booking-documents")
    .upload(filePath, file, {
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from("booking-documents")
    .getPublicUrl(filePath);

  const { data, error } = await supabase
    .from("booking_documents")
    .insert({
      booking_id: bookingId,
      file_url: publicUrlData.publicUrl,
      document_kind: documentKind,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: String(data.id),
    booking_id: String(data.booking_id),
    file_url: String(data.file_url),
    document_kind: data.document_kind as BookingDocumentKind,
    created_at: String(data.created_at),
  };
}

export async function getDocumentsForBooking(
  bookingId: string,
): Promise<BookingDocument[]> {
  const { data, error } = await supabase
    .from("booking_documents")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((document) => ({
    id: String(document.id),
    booking_id: String(document.booking_id),
    file_url: String(document.file_url),
    document_kind: document.document_kind as BookingDocumentKind,
    created_at: String(document.created_at),
  }));
}
