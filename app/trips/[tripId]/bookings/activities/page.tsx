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

        <section className="rounded-[24px] border border-violet-500/20 bg-violet-500/10 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
          <h2 className="text-lg font-semibold text-white">Planned Activities</h2>
          <div className="mt-4 space-y-3">
            {activitiesWithDocuments.length === 0 && (
              <p className="text-sm text-slate-300">No activities added yet.</p>
            )}
            {activitiesWithDocuments.map(({ booking, documents }) => (
              <div
                key={booking.id}
                className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
                      Activity
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-white">{booking.title}</h3>
                  </div>
                  <p className="text-sm text-slate-300">{formatDate(booking.start_date)}</p>
                </div>
                {booking.notes && (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-200">{booking.notes}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/trips/${tripId}/activities/${booking.id}`}
                    className="inline-flex items-center rounded-xl border border-violet-400/30 bg-violet-500/10 px-3 py-2 text-sm font-medium text-violet-100 transition hover:bg-violet-500/20"
                  >
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
