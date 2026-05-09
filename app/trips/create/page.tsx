import Link from "next/link";

import { CreateTripForm } from "@/components/forms/CreateTripForm";

export default function CreateTripPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 xl:px-8">
      <div className="mx-auto max-w-[1100px]">
        <div className="theme-shell relative overflow-hidden rounded-[36px] border p-6 shadow-[0_30px_60px_rgba(118,60,145,0.16)] backdrop-blur sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden text-fuchsia-700/10"
          >
            <div className="travel-float absolute -right-8 top-6 h-36 w-36 rounded-full bg-current blur-3xl" />
            <svg
              viewBox="0 0 420 240"
              className="travel-float absolute -right-2 top-8 h-56 w-[28rem]"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            >
              <path d="M28 154c88-58 160-78 230-78 48 0 94 10 136 28" />
              <path d="M48 182c102-20 196-18 330 4" />
              <path d="M218 30l22 46 76 14-58 18-12 42-22-34-74 8 52-22-14-34z" />
              <rect x="40" y="42" width="108" height="64" rx="18" />
              <path d="M64 66h58M64 86h42" />
            </svg>
          </div>
          <div className="relative z-10 max-w-2xl">
            <p className="theme-muted text-xs font-semibold uppercase tracking-[0.28em]">
              New Trip Workspace
            </p>
            <h1 className="theme-heading mt-4 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              Create Trip
            </h1>
            <p className="theme-muted mt-2 text-sm leading-6">
              Set the trip basics once. We&apos;ll create the trip shell and add you as the first
              member automatically.
            </p>
          </div>

          <div className="relative z-10 mt-6">
            <CreateTripForm />
          </div>

          <Link
            href="/"
            className="theme-button-secondary relative z-10 mt-6 inline-flex items-center rounded-full border px-5 py-2.5 text-sm font-medium shadow-[0_10px_24px_rgba(118,60,145,0.08)] transition hover:-translate-y-0.5"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
