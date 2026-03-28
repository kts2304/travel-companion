import Link from "next/link";

import { AuthPanel } from "@/components/auth/AuthPanel";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 xl:px-8">
      <div className="mx-auto max-w-[1500px]">
        <section className="relative overflow-hidden rounded-[40px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(255,255,255,0.74))] px-6 py-6 shadow-[0_26px_60px_rgba(118,60,145,0.18)] backdrop-blur">
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
              <div className="inline-flex items-center gap-3 rounded-full border border-fuchsia-900/10 bg-white/70 px-4 py-2 shadow-[0_10px_24px_rgba(118,60,145,0.08)]">
                <span className="h-2.5 w-2.5 rounded-full bg-fuchsia-600 shadow-[0_0_18px_rgba(176,23,120,0.55)]" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-fuchsia-900/80">
                  Travel Companion Workspace
                </p>
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-[#35194f] sm:text-5xl xl:text-[3.4rem]">
                One trip hub for expenses,
                <span className="bg-[linear-gradient(90deg,#b01778_0%,#7c3aed_58%,#d946ef_100%)] bg-clip-text text-transparent">
                  {" "}members, bookings,
                </span>
                <br />
                and personal travel.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#5a4670]">
                Plan with your group, keep the settlement picture clear, and move from shared
                logistics to traveler-specific tickets without jumping across tools.
              </p>

              <div className="mt-6 rounded-full border border-fuchsia-900/10 bg-white/70 px-5 py-3 text-sm text-[#5a4670] shadow-[0_10px_24px_rgba(118,60,145,0.08)]">
                Shared planning + personal travel in one flow
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="travel-card-hover rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(72,21,104,0.92),rgba(95,23,120,0.92))] p-4 text-white shadow-[0_16px_28px_rgba(118,60,145,0.16)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">Flow</p>
                  <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">One workspace</p>
                </div>
                <div className="travel-card-hover rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,239,250,0.9))] p-4 text-[#35194f] shadow-[0_16px_28px_rgba(118,60,145,0.1)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-fuchsia-900/60">Clarity</p>
                  <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#35194f]">Day-wise nets</p>
                </div>
                <div className="travel-card-hover rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,239,250,0.9))] p-4 text-[#35194f] shadow-[0_16px_28px_rgba(118,60,145,0.1)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-fuchsia-900/60">Travel kit</p>
                  <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#35194f]">Personal tickets</p>
                </div>
              </div>
            </div>

            <div className="relative z-10 space-y-4">
              <section className="travel-card-hover rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,239,250,0.9))] p-4 shadow-[0_18px_34px_rgba(118,60,145,0.12)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-900/60">
                  Launch
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-[#35194f]">
                  Sign in and start your tour
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#6c567f]">
                  Open your workspace and start planning faster.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/trips/create"
                    className="rounded-full bg-[linear-gradient(135deg,#c21884,#8b1d8f)] px-7 py-3.5 font-semibold text-white shadow-[0_18px_40px_rgba(176,23,120,0.3)] hover:-translate-y-0.5 hover:shadow-[0_24px_48px_rgba(176,23,120,0.36)]"
                  >
                    Start a trip
                  </Link>
                  <Link
                    href="/trips/create"
                    className="rounded-full border border-fuchsia-900/10 bg-white px-6 py-3.5 text-sm font-semibold text-[#5a4670] shadow-[0_10px_24px_rgba(118,60,145,0.08)] hover:-translate-y-0.5"
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
