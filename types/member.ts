export interface Member {
  id: string;
  trip_id: string;
  name: string;
  email: string | null;
  created_at: string;
}

export interface AddMemberInput {
  name: string;
  email?: string;
}

export interface MemberBalance {
  memberId: string;
  memberName: string;
  totalPaid: number;
  totalOwed: number;
  balance: number;
}
