import type { AuthUserSummary } from "@/services/authService";
import type { Member } from "@/types/member";

export function findTripMemberForAuthUser(
  members: Member[],
  user: AuthUserSummary | null,
): Member | null {
  if (!user) {
    return null;
  }

  const linkedMember =
    members.find((member) => member.auth_user_id === user.id) ?? null;

  if (linkedMember) {
    return linkedMember;
  }

  if (!user.email) {
    return null;
  }

  return (
    members.find((member) => member.email?.trim().toLowerCase() === user.email) ?? null
  );
}

export function shouldLinkTripMemberOwnership(
  member: Member | null,
  user: AuthUserSummary | null,
): boolean {
  if (!member || !user?.email) {
    return false;
  }

  return !member.auth_user_id && member.email?.trim().toLowerCase() === user.email;
}
