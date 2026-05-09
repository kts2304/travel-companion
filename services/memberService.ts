import { supabase } from "@/lib/supabaseClient";
import type { AddMemberInput, Member, UpdateMemberInput } from "@/types/member";

export async function addMember(tripId: string, input: AddMemberInput): Promise<Member> {
  const normalizedName = input.name.trim();
  const { data, error } = await supabase
    .from("members")
    .insert({
      trip_id: tripId,
      name: normalizedName,
      email: input.email?.trim() || null,
      auth_user_id: input.authUserId ?? null,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("This member already exists in the trip.");
    }
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

export async function updateMember(memberId: string, input: UpdateMemberInput): Promise<Member> {
  const normalizedName = input.name.trim();
  const { data, error } = await supabase
    .from("members")
    .update({
      name: normalizedName,
      email: input.email?.trim() || null,
      auth_user_id: input.authUserId ?? undefined,
    })
    .eq("id", memberId)
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("This member already exists in the trip.");
    }
    throw new Error(error.message);
  }

  return data as Member;
}

export async function deleteMember(memberId: string): Promise<void> {
  const { error } = await supabase.from("members").delete().eq("id", memberId);

  if (error) {
    if (error.code === "23503") {
      throw new Error("This member cannot be removed because they are linked to existing expenses.");
    }
    throw new Error(error.message);
  }
}

export async function linkMemberToAuthUser(memberId: string, authUserId: string): Promise<Member> {
  const { data, error } = await supabase
    .from("members")
    .update({
      auth_user_id: authUserId,
    })
    .eq("id", memberId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Member;
}
