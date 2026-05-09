import Link from "next/link";

import { AuthPanel } from "@/components/auth/AuthPanel";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 xl:px-8">
      <div className="mx-auto max-w-[1500px]">
        <section className="theme-shell relative overflow-hidden rounded-[40px] border px-6 py-6 shadow-[0_26px_60px_rgba(118,60,145,0.18)] backdrop-blur">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden text-fuchsia-700/10"
          >
            <div className="travel-float absolute -right-8 top-10 h-40 w-40 rounded-full bg-current blur-3xl" />
            <div className="travel-float-delayed absolute left-[44%] top-12 h-24 w-24 rounded-full border border-current/70" />
            <svg
              viewBox="0 0 420 280"
              className="travel-float absolute -right-4 bottom-2 h-64 w-[24rem]"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            >
              <path d="M34 176c88-56 156-76 224-76 54 0 100 12 136 30" />
              <path d="M54 202c98-24 194-20 318 6" />
              <path d="M212 54l24 52 86 14-68 20-14 48-28-42-86 10 60-26-16-40z" />
              <circle cx="48" cy="178" r="12" />
              <circle cx="384" cy="130" r="12" />
            </svg>
            <svg
              viewBox="0 0 240 160"
              className="travel-float-delayed absolute left-4 bottom-6 h-40 w-56"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            >
              <rect x="26" y="30" width="188" height="110" rx="20" />
              <path d="M56 62h122M56 88h146M56 114h74" />
            </svg>
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr] xl:items-start">
            <div className="relative z-10">
              <div className="theme-button-secondary inline-flex items-center gap-3 rounded-full border px-4 py-2 shadow-[0_10px_24px_rgba(118,60,145,0.08)]">
                <span className="theme-accent-dot h-2.5 w-2.5 rounded-full" />
                <p className="theme-heading text-[11px] font-semibold uppercase tracking-[0.32em]">
                  Travel Companion Workspace
                </p>
              </div>
              <h1 className="theme-heading mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl xl:text-[3.4rem]">
                One trip hub for expenses,
                <span className="theme-gradient-text">
                  {" "}members, bookings,
                </span>
                <br />
                and personal travel.
              </h1>
              <p className="theme-muted mt-4 max-w-2xl text-base leading-7">
                Plan with your group, keep the settlement picture clear, and move from shared
                logistics to traveler-specific tickets without jumping across tools.
              </p>

              <div className="theme-button-secondary mt-6 rounded-full border px-5 py-3 text-sm shadow-[0_10px_24px_rgba(118,60,145,0.08)]">
                Shared planning + personal travel in one flow
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="travel-card-hover theme-strong-surface rounded-[28px] border p-4 shadow-[0_16px_28px_rgba(118,60,145,0.16)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">Flow</p>
                  <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">One workspace</p>
                </div>
                <div className="travel-card-hover theme-card rounded-[28px] border p-4 text-[var(--heading-color)] shadow-[0_16px_28px_rgba(118,60,145,0.1)]">
                  <p className="theme-accent-soft-text text-[11px] font-semibold uppercase tracking-[0.22em]">Clarity</p>
                  <p className="theme-heading mt-2 text-xl font-semibold tracking-[-0.03em]">Day-wise nets</p>
                </div>
                <div className="travel-card-hover theme-card rounded-[28px] border p-4 text-[var(--heading-color)] shadow-[0_16px_28px_rgba(118,60,145,0.1)]">
                  <p className="theme-accent-soft-text text-[11px] font-semibold uppercase tracking-[0.22em]">Travel kit</p>
                  <p className="theme-heading mt-2 text-xl font-semibold tracking-[-0.03em]">Personal tickets</p>
                </div>
              </div>
            </div>

            <div className="relative z-10 space-y-4">
              <section className="travel-card-hover theme-card rounded-[32px] border p-4 shadow-[0_18px_34px_rgba(118,60,145,0.12)]">
                <p className="theme-muted text-xs font-semibold uppercase tracking-[0.24em]">
                  Launch
                </p>
                <h2 className="theme-heading mt-2 text-2xl font-black tracking-[-0.03em]">
                  Sign in and start your tour
                </h2>
                <p className="theme-muted mt-2 text-sm leading-6">
                  Open your workspace and start planning faster.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/trips/create"
                    className="theme-brand-button rounded-full px-7 py-3.5 font-semibold transition hover:-translate-y-0.5"
                  >
                    Start a trip
                  </Link>
                  <Link
                    href="/trips/create"
                    className="theme-button-secondary rounded-full border px-6 py-3.5 text-sm font-semibold shadow-[0_10px_24px_rgba(118,60,145,0.08)] hover:-translate-y-0.5"
                  >
                    Start tour
                  </Link>
                </div>
              </section>

              <AuthPanel />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
