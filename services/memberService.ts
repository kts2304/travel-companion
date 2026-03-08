import { supabase } from "@/lib/supabaseClient";
import type { AddMemberInput, Member } from "@/types/member";

export async function addMember(tripId: string, input: AddMemberInput): Promise<Member> {
  const { data, error } = await supabase
    .from("members")
    .insert({
      trip_id: tripId,
      name: input.name,
      email: input.email?.trim() || null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Member;
}

export async function getMembersByTrip(tripId: string): Promise<Member[]> {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Member[];
}
