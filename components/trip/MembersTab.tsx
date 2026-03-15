import { AddMemberForm } from "@/components/forms/AddMemberForm";
import { ManageMembersList } from "@/components/trip/ManageMembersList";
import type { Member } from "@/types/member";

interface MembersTabProps {
  tripId: string;
  members: Member[];
}

export function MembersTab({ tripId, members }: MembersTabProps) {
  return (
    <div className="space-y-6">
      <AddMemberForm tripId={tripId} />

      <section>
        <h3 className="text-lg font-semibold text-white">Current members</h3>
        <ManageMembersList members={members} />
      </section>
    </div>
  );
}
