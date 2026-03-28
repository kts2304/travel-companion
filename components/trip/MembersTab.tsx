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

      <section className="rounded-[28px] border border-fuchsia-900/10 bg-white/72 p-5 shadow-[0_18px_32px_rgba(118,60,145,0.08)]">
        <h3 className="text-xl font-black tracking-[-0.03em] text-[#2f143f]">Current members</h3>
        <p className="mt-1 text-sm text-[#6a567b]">
          Keep the trip roster clean and update details here.
        </p>
        <ManageMembersList members={members} />
      </section>
    </div>
  );
}
