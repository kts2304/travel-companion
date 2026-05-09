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
    <aside className="theme-shell overflow-hidden rounded-[34px] border p-5 shadow-[0_24px_40px_rgba(118,60,145,0.12)] backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="theme-muted text-xs font-semibold uppercase tracking-[0.24em]">
          Workspace
        </p>
        <span className="theme-button-secondary rounded-full border px-3 py-1 text-[11px] font-medium tracking-[0.18em]">
          V2
        </span>
      </div>

      <div className="mt-5 min-w-0">
        <h1 className="theme-heading break-words text-[2rem] font-semibold leading-tight tracking-[-0.04em]">
          {trip.name}
        </h1>
        <p className="theme-muted mt-2 text-sm">
          {trip.destination || "Destination not set"}
        </p>
        <p className="theme-muted mt-1 break-words text-xs leading-5">
          {getTripRangeLabel(trip)}
        </p>
      </div>

      <div className="mt-6 grid gap-3">
        <div className="rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(72,21,104,0.92),rgba(95,23,120,0.92))] p-4 text-white shadow-[0_16px_30px_rgba(118,60,145,0.16)]">
          <p className="text-xs uppercase tracking-[0.18em] text-white/70">Members</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">{memberCount}</p>
          <p className="mt-1 text-xs text-white/76">People currently on this workspace</p>
        </div>
        <div className="theme-card rounded-[28px] border p-4 shadow-[0_16px_30px_rgba(118,60,145,0.12)]">
          <p className="theme-muted text-xs uppercase tracking-[0.18em]">Expenses</p>
          <p className="theme-heading mt-3 text-3xl font-semibold tracking-[-0.04em]">{expenseCount}</p>
          <p className="theme-muted mt-1 text-xs">Money movements logged so far</p>
        </div>
      </div>

      <div className="theme-card mt-6 rounded-[28px] border p-4 shadow-[0_16px_30px_rgba(118,60,145,0.12)]">
        <p className="theme-muted text-xs uppercase tracking-[0.18em]">Flow</p>
        <p className="theme-muted mt-2 text-sm leading-6">
          Add members, log expenses, attach bookings, and keep the whole trip in one workspace.
        </p>
      </div>

      <Link
        href="/"
        className="theme-button-secondary mt-6 inline-flex rounded-full border px-5 py-2.5 text-sm font-medium transition hover:bg-white/80"
      >
        Back home
      </Link>
    </aside>
  );
}
