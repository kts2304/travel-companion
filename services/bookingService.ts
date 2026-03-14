import { supabase } from "@/lib/supabaseClient";
import type { Booking, BookingDocument, BookingScope, BookingType } from "@/types/booking";

interface CreateBookingInput {
  tripId: string;
  type: BookingType;
  scope: BookingScope;
  memberId?: string;
  title: string;
  startDate: string;
  endDate?: string;
  notes?: string;
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
    created_at: String(booking.created_at),
  }));
}

export async function deleteBooking(bookingId: string): Promise<void> {
  const { error } = await supabase.from("bookings").delete().eq("id", bookingId);

  if (error) {
    throw new Error(error.message);
  }
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
    created_at: String(document.created_at),
  }));
}
