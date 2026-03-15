import Link from "next/link";

interface BookingsHubProps {
  tripId: string;
  flightCount: number;
  hotelCount: number;
  activityCount: number;
}

const hubCards = [
  {
    key: "flights",
    title: "Flights & Transport",
    description: "Personal flight tickets, bus travel, and shared transport bookings.",
    accent: "border-cyan-500/20 bg-cyan-500/10",
  },
  {
    key: "hotels",
    title: "Hotels",
    description: "Stay details, room information, vouchers, and hotel references.",
    accent: "border-emerald-500/20 bg-emerald-500/10",
  },
  {
    key: "activities",
    title: "Activities & Itinerary",
    description: "Planned events, time slots, notes, and supporting activity documents.",
    accent: "border-violet-500/20 bg-violet-500/10",
  },
] as const;

export function BookingsHub({
  tripId,
  flightCount,
  hotelCount,
  activityCount,
}: BookingsHubProps) {
  const countByKey = {
    flights: flightCount,
    hotels: hotelCount,
    activities: activityCount,
  } satisfies Record<(typeof hubCards)[number]["key"], number>;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-700 bg-slate-900/90 p-5 shadow-[0_20px_60px_rgba(1,6,17,0.28)]">
        <h3 className="text-lg font-semibold text-white">Bookings Hub</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Keep the overview clean here, then open the booking area you want to work on.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {hubCards.map((card) => (
          <Link
            key={card.key}
            href={`/trips/${tripId}/bookings/${card.key}`}
            className={`rounded-[24px] border p-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5 hover:border-white/20 ${card.accent}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-200">
                  Bookings
                </p>
                <h4 className="mt-3 text-xl font-semibold text-white">{card.title}</h4>
              </div>
              <span className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs font-medium text-slate-200">
                {countByKey[card.key]}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-200">{card.description}</p>
            <p className="mt-5 text-sm font-medium text-white">Open section</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
