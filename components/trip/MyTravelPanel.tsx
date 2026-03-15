"use client";

import { useEffect, useMemo, useState } from "react";

import { BookingDocumentsPanel } from "@/components/trip/BookingDocumentsPanel";
import { DeleteBookingButton } from "@/components/trip/DeleteBookingButton";
import { getCurrentAuthUser } from "@/services/authService";
import type { Booking, BookingDocument } from "@/types/booking";
import type { Member } from "@/types/member";

interface BookingWithDocuments {
  booking: Booking;
  documents: BookingDocument[];
}

interface MyTravelPanelProps {
  members: Member[];
  personalBookings: BookingWithDocuments[];
}

function formatBookingDate(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatBookingType(type: string): string {
  return `${type.charAt(0).toUpperCase()}${type.slice(1)}`;
}

function formatJourneyValue(value: string | null): string {
  return value?.trim() ? value : "Not detected";
}

function JourneyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const missing = value === "Not detected";

  return (
    <div className="rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(9,16,30,0.95),rgba(5,10,22,0.98))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>
      <p className={`mt-2 text-sm font-medium leading-6 ${missing ? "text-slate-500" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function JourneyCard({
  title,
  route,
  dateTime,
  flightNumber,
  seatNumber,
  pnr,
}: {
  title: string;
  route: string;
  dateTime: string | null;
  flightNumber: string | null;
  seatNumber: string | null;
  pnr: string | null;
}) {
  const formattedDate = dateTime ? formatBookingDate(dateTime) : "Not detected";

  return (
    <div className="overflow-hidden rounded-[22px] border border-cyan-400/15 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_32%),linear-gradient(180deg,rgba(10,22,38,0.98),rgba(4,10,20,0.98))] shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/6 px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-200">
            {title}
          </p>
          <p className="mt-1 text-sm font-medium text-white">
            {route}
            <span className="ml-2 text-slate-300">{formattedDate}</span>
          </p>
        </div>
        <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
          Ticket snapshot
        </div>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-3">
        <JourneyField label="Flight Number" value={formatJourneyValue(flightNumber)} />
        <JourneyField label="Seat Number" value={formatJourneyValue(seatNumber)} />
        <JourneyField label="Booking / PNR" value={formatJourneyValue(pnr)} />
      </div>
    </div>
  );
}

export function MyTravelPanel({ members, personalBookings }: MyTravelPanelProps) {
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      const user = await getCurrentAuthUser();
      if (!isMounted) {
        return;
      }

      setCurrentEmail(user?.email ?? null);
      setIsLoadingUser(false);
    }

    void loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentMember = useMemo(() => {
    if (!currentEmail) {
      return null;
    }

    return (
      members.find(
        (member) => member.email?.trim().toLowerCase() === currentEmail,
      ) ?? null
    );
  }, [currentEmail, members]);

  const myBookings = useMemo(() => {
    if (!currentMember) {
      return [];
    }

    return personalBookings.filter((entry) => entry.booking.member_id === currentMember.id);
  }, [currentMember, personalBookings]);

  return (
    <section className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">My Travel</h3>
          <p className="text-sm text-slate-300">
            Flight and bus tickets stay personal and resolve from the signed-in traveler.
          </p>
        </div>
        {currentMember && (
          <p className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-200">
            {currentMember.name}
          </p>
        )}
      </div>

      {isLoadingUser && <p className="mt-4 text-sm text-slate-300">Checking signed-in traveler...</p>}

      {!isLoadingUser && !currentEmail && (
        <p className="mt-4 text-sm text-slate-300">
          Sign in with the same email used on your trip member profile to see only your tickets here.
        </p>
      )}

      {!isLoadingUser && currentEmail && !currentMember && (
        <p className="mt-4 text-sm text-slate-300">
          No trip member matches the signed-in email <span className="font-medium">{currentEmail}</span>.
        </p>
      )}

      {!isLoadingUser && currentMember && myBookings.length === 0 && (
        <p className="mt-4 text-sm text-slate-300">
          No personal flight or bus tickets are assigned to you yet.
        </p>
      )}

      <div className="mt-4 space-y-3">
        {myBookings.map(({ booking, documents }) => (
          <div key={booking.id} className="rounded-[24px] border border-cyan-500/20 bg-[linear-gradient(180deg,rgba(10,18,34,0.96),rgba(6,12,24,0.98))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                {formatBookingType(booking.type)}
              </p>
              <h4 className="mt-1 text-lg font-semibold text-white">
                {currentMember?.name ?? "Traveler ticket"}
              </h4>
            </div>
            {booking.type === "flight" && (
              <div className="mt-5 space-y-4">
                <JourneyCard
                  title="Onward Journey"
                  route={
                    booking.onward_origin && booking.onward_destination
                      ? `${booking.onward_origin} -> ${booking.onward_destination}`
                      : "Route not detected"
                  }
                  dateTime={booking.onward_departure_at}
                  flightNumber={booking.onward_flight_number}
                  seatNumber={booking.onward_seat_number}
                  pnr={booking.onward_pnr}
                />
                <JourneyCard
                  title="Return Journey"
                  route={
                    booking.return_origin && booking.return_destination
                      ? `${booking.return_origin} -> ${booking.return_destination}`
                      : "Route not detected"
                  }
                  dateTime={booking.return_departure_at}
                  flightNumber={booking.return_flight_number}
                  seatNumber={booking.return_seat_number}
                  pnr={booking.return_pnr}
                />
              </div>
            )}
            <BookingDocumentsPanel bookingId={booking.id} documents={documents} />
            <DeleteBookingButton
              bookingId={booking.id}
              bookingLabel={booking.title}
              documents={documents}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
