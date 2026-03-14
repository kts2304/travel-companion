import { AddMemberForm } from "@/components/forms/AddMemberForm";
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
        <ul className="mt-3 space-y-2 text-sm">
          {members.length === 0 && <li className="text-slate-300">No members added yet.</li>}
          {members.map((member) => (
            <li
              key={member.id}
              className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3"
            >
              <p className="font-medium text-white">{member.name}</p>
              {member.email && <p className="text-slate-300">{member.email}</p>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
