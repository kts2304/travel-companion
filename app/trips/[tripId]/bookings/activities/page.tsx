import Link from "next/link";
import { notFound } from "next/navigation";

import { AddBookingForm } from "@/components/forms/AddBookingForm";
import { BookingSectionShell } from "@/components/trip/BookingSectionShell";
import { DeleteBookingButton } from "@/components/trip/DeleteBookingButton";
import { getBookingsByTrip, getDocumentsForBooking } from "@/services/bookingService";
import { getMembersByTrip } from "@/services/memberService";
import { getTripById } from "@/services/tripService";

interface ActivitiesPageProps {
  params: Promise<{ tripId: string }>;
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export default async function ActivitiesPage({ params }: ActivitiesPageProps) {
  const { tripId } = await params;
  const trip = await getTripById(tripId);

  if (!trip) {
    notFound();
  }

  const [members, bookings] = await Promise.all([
    getMembersByTrip(tripId),
    getBookingsByTrip(tripId),
  ]);
  const activityBookings = bookings.filter((booking) => booking.type === "activity");
  const activitiesWithDocuments = await Promise.all(
    activityBookings.map(async (booking) => ({
      booking,
      documents: await getDocumentsForBooking(booking.id),
    })),
  );

  return (
    <BookingSectionShell
      tripId={tripId}
      eyebrow="Bookings / Activities"
      title="Activities & Itinerary"
      description="Keep planned activities in a lighter list here and open each one for fuller context, notes, and attachments."
      artVariant="activities"
    >
      <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <AddBookingForm
          tripId={tripId}
          members={members}
          tripStartDate={trip.start_date}
          tripEndDate={trip.end_date}
          allowedTypes={["activity"]}
          heading="Import activity or itinerary"
          description="Upload activity confirmations or add itinerary placeholders that can be expanded on their own page."
        />

        <section className="travel-card-hover rounded-[28px] border border-violet-500/18 bg-[linear-gradient(180deg,rgba(65,33,110,0.92),rgba(24,16,44,0.96))] p-5 shadow-[0_22px_60px_rgba(47,22,85,0.22)]">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-100/16 bg-white/8 text-violet-50">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M5 20h14M7 20V8h10v12M9 4h6v4H9zM9 12h6M9 15h4" />
              </svg>
            </span>
            <h2 className="text-lg font-semibold text-white">Planned Activities</h2>
          </div>
          <div className="mt-4 space-y-3">
            {activitiesWithDocuments.length === 0 && (
              <p className="text-sm text-violet-50/78">No activities added yet.</p>
            )}
            {activitiesWithDocuments.map(({ booking, documents }) => (
              <div
                key={booking.id}
                className="travel-card-hover rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,35,0.92),rgba(6,12,24,0.98))] p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
                      Activity
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-white">{booking.title}</h3>
                  </div>
                  <p className="text-sm text-violet-50/70">{formatDate(booking.start_date)}</p>
                </div>
                {booking.notes && (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-violet-50/84">{booking.notes}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/trips/${tripId}/activities/${booking.id}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/10 px-3 py-2 text-sm font-medium text-violet-100 transition hover:bg-violet-500/20"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                    Open activity details
                  </Link>
                  <DeleteBookingButton
                    bookingId={booking.id}
                    bookingLabel={booking.title}
                    documents={documents}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </BookingSectionShell>
  );
}
