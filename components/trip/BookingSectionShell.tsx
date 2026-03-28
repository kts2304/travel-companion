import Link from "next/link";
import { SectionBackdropArt } from "@/components/trip/SectionBackdropArt";

interface BookingSectionShellProps {
  tripId: string;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  artVariant?: "bookings" | "flights" | "hotels" | "activities";
}

export function BookingSectionShell({
  tripId,
  eyebrow,
  title,
  description,
  children,
  artVariant = "bookings",
}: BookingSectionShellProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.44),transparent_22%),radial-gradient(circle_at_top_right,rgba(248,172,224,0.28),transparent_18%),linear-gradient(180deg,#e5bee7_0%,#e8c5ea_100%)] px-4 py-6 text-[#35194f] sm:px-6 xl:px-8">
      <div className="mx-auto max-w-[1320px] space-y-6">
        <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(180deg,rgba(72,21,104,0.94),rgba(95,23,120,0.94))] px-6 py-5 shadow-[0_24px_48px_rgba(118,60,145,0.16)] backdrop-blur">
          <SectionBackdropArt variant={artVariant} />
          <div className="relative z-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                {eyebrow}
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">{description}</p>
            </div>
            <Link
              href={`/trips/${tripId}`}
              className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/16"
            >
              Back to bookings hub
            </Link>
          </div>
          </div>
        </section>

        {children}
      </div>
    </main>
  );
}
