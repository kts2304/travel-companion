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
        <h3 className="text-lg font-semibold text-slate-900">Current members</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {members.length === 0 && <li className="text-slate-600">No members added yet.</li>}
          {members.map((member) => (
            <li key={member.id} className="rounded-xl border border-cyan-200 bg-cyan-50 p-3">
              <p className="font-medium text-slate-900">{member.name}</p>
              {member.email && <p className="text-slate-600">{member.email}</p>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
