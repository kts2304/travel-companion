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
    accent: "border-white/75 bg-[linear-gradient(180deg,rgba(72,21,104,0.94),rgba(95,23,120,0.94))] text-white",
    label: "Personal",
  },
  {
    key: "hotels",
    title: "Hotels",
    description: "Stay details, room information, vouchers, and hotel references.",
    accent: "border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,239,250,0.9))] text-[#35194f]",
    label: "Shared",
  },
  {
    key: "activities",
    title: "Activities & Itinerary",
    description: "Planned events, time slots, notes, and supporting activity documents.",
    accent: "border-white/75 bg-[linear-gradient(180deg,rgba(72,21,104,0.94),rgba(95,23,120,0.94))] text-white",
    label: "Plan",
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
      <section className="theme-card rounded-[30px] border p-5 shadow-[0_18px_34px_rgba(118,60,145,0.12)]">
        <h3 className="theme-heading text-xl font-black tracking-[-0.03em]">Bookings Hub</h3>
        <p className="theme-muted mt-2 text-sm leading-6">
          Keep the overview clean here, then open the booking area you want to work on.
        </p>
      </section>

      <section className="space-y-4">
        {hubCards.map((card) => (
          <Link
            key={card.key}
            href={`/trips/${tripId}/bookings/${card.key}`}
            className={`block rounded-[30px] border p-5 shadow-[0_18px_34px_rgba(118,60,145,0.14)] transition hover:-translate-y-1 hover:shadow-[0_24px_44px_rgba(118,60,145,0.18)] ${card.accent}`}
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-current/70">
                  {card.label}
                </p>
                <h4 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-current">{card.title}</h4>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-current/82">{card.description}</p>
              </div>
              <div className="flex items-center justify-between gap-4 md:w-auto md:flex-col md:items-end">
                <span className="rounded-full border border-current/10 bg-white/25 px-3 py-1 text-xs font-medium text-current shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                  {countByKey[card.key]}
                </span>
                <span className="rounded-full border border-current/12 bg-white/20 px-4 py-2 text-sm font-semibold text-current">
                  Open section
                </span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
