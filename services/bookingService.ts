import { supabase } from "@/lib/supabaseClient";
import type { Booking, BookingType } from "@/types/booking";

interface CreateBookingInput {
  tripId: string;
  type: BookingType;
  title: string;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      trip_id: input.tripId,
      type: input.type,
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
