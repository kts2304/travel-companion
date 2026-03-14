import Link from "next/link";

import { CreateTripForm } from "@/components/forms/CreateTripForm";

export default function CreateTripPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 xl:px-8">
      <div className="mx-auto max-w-[1100px]">
        <div className="rounded-[32px] border border-slate-700/90 bg-[#020b16]/95 p-6 shadow-[0_30px_80px_rgba(1,6,17,0.55)] backdrop-blur sm:p-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
              New Trip Workspace
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Create Trip</h1>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              Set the trip basics once. We&apos;ll create the trip shell and add you as the first
              member automatically.
            </p>
          </div>

          <div className="mt-6">
            <CreateTripForm />
          </div>

          <Link
            href="/"
            className="mt-6 inline-block text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
