export interface Member {
  id: string;
  trip_id: string;
  name: string;
  email: string | null;
  auth_user_id: string | null;
  created_at: string;
}

export interface AddMemberInput {
  name: string;
  email?: string;
  authUserId?: string;
}

export interface UpdateMemberInput {
  name: string;
  email?: string;
  authUserId?: string | null;
}

export interface MemberBalance {
  memberId: string;
  memberName: string;
  totalPaid: number;
  totalOwed: number;
  balance: number;
}
