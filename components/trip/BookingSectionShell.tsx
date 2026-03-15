import Link from "next/link";

interface BookingSectionShellProps {
  tripId: string;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function BookingSectionShell({
  tripId,
  eyebrow,
  title,
  description,
  children,
}: BookingSectionShellProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_28%),linear-gradient(180deg,#04111d_0%,#020814_100%)] px-4 py-6 text-slate-100 sm:px-6 xl:px-8">
      <div className="mx-auto max-w-[1320px] space-y-6">
        <section className="rounded-[28px] border border-slate-700/90 bg-[#020b16]/95 px-6 py-5 shadow-[0_30px_80px_rgba(1,6,17,0.55)] backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                {eyebrow}
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{description}</p>
            </div>
            <Link
              href={`/trips/${tripId}`}
              className="inline-flex items-center rounded-xl border border-slate-600 bg-slate-900/90 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-400/60 hover:text-white"
            >
              Back to bookings hub
            </Link>
          </div>
        </section>

        {children}
      </div>
    </main>
  );
}
