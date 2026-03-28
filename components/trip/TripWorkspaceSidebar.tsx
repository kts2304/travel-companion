import Link from "next/link";

import type { Trip } from "@/types/trip";

interface TripWorkspaceSidebarProps {
  trip: Trip;
  memberCount: number;
  expenseCount: number;
}

function getTripRangeLabel(trip: Trip): string {
  if (!trip.start_date && !trip.end_date) {
    return "Dates not set";
  }

  if (trip.start_date && trip.end_date) {
    return `${trip.start_date} to ${trip.end_date}`;
  }

  return trip.start_date ?? trip.end_date ?? "Dates not set";
}

export function TripWorkspaceSidebar({
  trip,
  memberCount,
  expenseCount,
}: TripWorkspaceSidebarProps) {
  return (
    <aside className="overflow-hidden rounded-[34px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(251,244,252,0.9))] p-5 shadow-[0_24px_40px_rgba(118,60,145,0.12)] backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-900/70">
          Workspace
        </p>
        <span className="rounded-full border border-fuchsia-900/10 bg-white/80 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-fuchsia-800">
          V2
        </span>
      </div>

      <div className="mt-5 min-w-0">
        <h1 className="break-words text-[2rem] font-semibold leading-tight tracking-[-0.04em] text-[#35194f]">
          {trip.name}
        </h1>
        <p className="mt-2 text-sm text-[#5f4a75]">
          {trip.destination || "Destination not set"}
        </p>
        <p className="mt-1 break-words text-xs leading-5 text-[#7c6790]">
          {getTripRangeLabel(trip)}
        </p>
      </div>

      <div className="mt-6 grid gap-3">
        <div className="rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(72,21,104,0.92),rgba(95,23,120,0.92))] p-4 text-white shadow-[0_16px_30px_rgba(118,60,145,0.16)]">
          <p className="text-xs uppercase tracking-[0.18em] text-white/70">Members</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">{memberCount}</p>
          <p className="mt-1 text-xs text-white/76">People currently on this workspace</p>
        </div>
        <div className="rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,239,250,0.9))] p-4 shadow-[0_16px_30px_rgba(118,60,145,0.12)]">
          <p className="text-xs uppercase tracking-[0.18em] text-fuchsia-900/60">Expenses</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#35194f]">{expenseCount}</p>
          <p className="mt-1 text-xs text-[#7c6790]">Money movements logged so far</p>
        </div>
      </div>

      <div className="mt-6 rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,239,250,0.9))] p-4 shadow-[0_16px_30px_rgba(118,60,145,0.12)]">
        <p className="text-xs uppercase tracking-[0.18em] text-fuchsia-900/60">Flow</p>
        <p className="mt-2 text-sm leading-6 text-[#5a4670]">
          Add members, log expenses, attach bookings, and keep the whole trip in one workspace.
        </p>
      </div>

      <Link
        href="/"
        className="mt-6 inline-flex rounded-full border border-fuchsia-900/10 bg-white/80 px-5 py-2.5 text-sm font-medium text-fuchsia-900/80 transition hover:bg-white"
      >
        Back home
      </Link>
    </aside>
  );
}
