import Link from "next/link";

import { CreateTripForm } from "@/components/forms/CreateTripForm";

export default function CreateTripPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="rounded-3xl border border-white/70 bg-white/90 p-7 shadow-xl">
        <h1 className="text-3xl font-bold text-slate-900">Create Trip</h1>
        <p className="mt-2 text-sm text-slate-600">Start by creating a trip for your group.</p>

        <div className="mt-6">
          <CreateTripForm />
        </div>

        <Link href="/" className="mt-6 inline-block text-sm font-medium text-sky-700 hover:underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
