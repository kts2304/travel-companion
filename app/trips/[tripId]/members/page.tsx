import Link from "next/link";
import { notFound } from "next/navigation";

import { AddMemberForm } from "@/components/forms/AddMemberForm";
import { getMembersByTrip } from "@/services/memberService";
import { getTripById } from "@/services/tripService";

interface TripMembersPageProps {
  params: Promise<{ tripId: string }>;
}

export default async function TripMembersPage({ params }: TripMembersPageProps) {
  const { tripId } = await params;
  const trip = await getTripById(tripId);

  if (!trip) {
    notFound();
  }

  const members = await getMembersByTrip(tripId);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="rounded-3xl border border-white/70 bg-white/90 p-7 shadow-xl">
        <h1 className="text-3xl font-bold text-slate-900">{trip.name} - Members</h1>

        <div className="mt-6">
          <AddMemberForm tripId={tripId} />
        </div>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">Current members</h2>
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

        <Link
          href={`/trips/${tripId}`}
          className="mt-6 inline-block text-sm font-medium text-sky-700 hover:underline"
        >
          Back to trip
        </Link>
      </div>
    </main>
  );
}
