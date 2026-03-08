import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-16">
      <div className="rounded-3xl border border-white/70 bg-white/85 p-8 shadow-xl backdrop-blur-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Trip finance made simple</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">Travel Companion</h1>
        <p className="mt-3 text-slate-600">
        Track trip expenses, split costs equally, and see who owes whom.
        </p>
        <Link
          href="/trips/create"
          className="mt-8 inline-block rounded-xl bg-sky-600 px-5 py-2.5 font-semibold text-white shadow-md transition hover:bg-sky-700"
        >
          Create a trip
        </Link>
      </div>
    </main>
  );
}
