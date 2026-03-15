import Link from "next/link";
import { notFound } from "next/navigation";

import { BookingDocumentsPanel } from "@/components/trip/BookingDocumentsPanel";
import { getBookingById, getDocumentsForBooking } from "@/services/bookingService";
import { getTripById } from "@/services/tripService";

interface ActivityDetailsPageProps {
  params: Promise<{
    tripId: string;
    bookingId: string;
  }>;
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

export default async function ActivityDetailsPage({ params }: ActivityDetailsPageProps) {
  const { tripId, bookingId } = await params;
  const [trip, booking, documents] = await Promise.all([
    getTripById(tripId),
    getBookingById(bookingId),
    getDocumentsForBooking(bookingId),
  ]);

  if (!trip || !booking || booking.trip_id !== tripId || booking.type !== "activity") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_28%),linear-gradient(180deg,#04111d_0%,#020814_100%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-[28px] border border-slate-700/90 bg-[#020b16]/95 px-6 py-5 shadow-[0_30px_80px_rgba(1,6,17,0.55)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-200">
                Activity Details
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white">{booking.title}</h1>
              <p className="mt-2 text-sm text-slate-300">
                {trip.name} {trip.destination ? `• ${trip.destination}` : ""}
              </p>
            </div>
            <Link
              href={`/trips/${tripId}`}
              className="inline-flex items-center rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
            >
              Back to workspace
            </Link>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[24px] border border-violet-500/20 bg-violet-500/10 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
            <h2 className="text-lg font-semibold text-white">Overview</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-slate-950/60 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Start
                </p>
                <p className="mt-2 text-sm font-medium text-white">{formatDate(booking.start_date)}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-slate-950/60 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  End
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  {booking.end_date ? formatDate(booking.end_date) : "Not set"}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/8 bg-slate-950/60 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Notes
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-200">
                {booking.notes?.trim() || "No extra activity notes captured yet."}
              </p>
            </div>
          </div>

          <div className="rounded-[24px] border border-cyan-500/20 bg-cyan-500/10 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
            <h2 className="text-lg font-semibold text-white">Documents</h2>
            <p className="mt-1 text-sm text-slate-300">
              Keep vouchers, confirmations, and any activity-specific attachments here.
            </p>
            <div className="mt-4">
              <BookingDocumentsPanel bookingId={booking.id} documents={documents} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
