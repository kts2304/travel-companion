import { supabase } from "@/lib/supabaseClient";
import type { CreateTripInput, Trip } from "@/types/trip";

export async function createTrip(input: CreateTripInput): Promise<Trip> {
  const { data, error } = await supabase
    .from("trips")
    .insert({
      name: input.name,
      destination: input.destination?.trim() || null,
      start_date: input.startDate || null,
      end_date: input.endDate || null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Trip;
}

export async function getTrips(): Promise<Trip[]> {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Trip[];
}

export async function getTripById(tripId: string): Promise<Trip | null> {
  const { data, error } = await supabase.from("trips").select("*").eq("id", tripId).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as Trip | null) ?? null;
}
