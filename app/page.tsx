import Link from "next/link";

import { AuthPanel } from "@/components/auth/AuthPanel";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 xl:px-8">
      <div className="mx-auto max-w-[1500px]">
        <section className="rounded-[32px] border border-slate-700/90 bg-[#020b16]/95 px-6 py-7 shadow-[0_30px_80px_rgba(1,6,17,0.55)] backdrop-blur">
          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                Travel Companion Workspace
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                One trip hub for expenses, members, bookings, and personal travel.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">
                Plan with your group, keep the settlement picture clear, and move from shared
                logistics to traveler-specific tickets without jumping across tools.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/trips/create"
                  className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 shadow-[0_0_40px_rgba(54,211,255,0.22)] hover:bg-cyan-300"
                >
                  Start a trip
                </Link>
                <div className="rounded-xl border border-slate-700 bg-slate-900/85 px-4 py-3 text-sm text-slate-200">
                  Shared planning + personal travel in one flow
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <AuthPanel />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                    Expenses
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-100">
                    Split shared costs, keep day-wise visibility, and settle clearly at the end.
                  </p>
                </div>
                <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-200">
                    Bookings
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-100">
                    Keep hotels and activities group-wide while flights and bus tickets stay personal.
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">
                    Members
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-100">
                    Build the trip roster once and let every shared action stay anchored to it.
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
                    Workspace
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-100">
                    A single trip container that feels consistent from the homepage to the trip dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
