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
    <aside className="rounded-[28px] border border-slate-700/90 bg-[#020b16]/95 p-5 shadow-[0_30px_80px_rgba(1,6,17,0.55)] backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
          Workspace
        </p>
        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[11px] font-medium text-cyan-200">
          V2
        </span>
      </div>

      <div className="mt-5 min-w-0">
        <h1 className="break-words text-2xl font-semibold leading-tight text-white">
          {trip.name}
        </h1>
        <p className="mt-2 text-sm text-slate-200">
          {trip.destination || "Destination not set"}
        </p>
        <p className="mt-1 break-words text-xs leading-5 text-slate-300">
          {getTripRangeLabel(trip)}
        </p>
      </div>

      <div className="mt-6 grid gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Members</p>
          <p className="mt-2 text-2xl font-semibold text-white">{memberCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Expenses</p>
          <p className="mt-2 text-2xl font-semibold text-white">{expenseCount}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-violet-300">Flow</p>
        <p className="mt-2 text-sm leading-6 text-slate-200">
          Add members, log expenses, attach bookings, and keep the whole trip in one workspace.
        </p>
      </div>

      <Link
        href="/"
        className="mt-6 inline-flex rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
      >
        Back home
      </Link>
    </aside>
  );
}
