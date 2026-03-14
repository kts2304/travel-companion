"use client";

import { useEffect, useMemo, useState } from "react";

import { BookingDocumentsPanel } from "@/components/trip/BookingDocumentsPanel";
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
  return value?.trim() ? value : "-";
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
          <div key={booking.id} className="rounded-2xl border border-cyan-500/20 bg-slate-900/85 p-4 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-cyan-200">
                  {formatBookingType(booking.type)}
                </p>
                <h4 className="text-base font-semibold text-white">
                  {currentMember?.name ?? "Traveler ticket"}
                </h4>
              </div>
              <p className="text-sm font-medium text-slate-200">
                {formatBookingDate(booking.start_date)}
              </p>
            </div>
            {booking.end_date && (
              <p className="mt-2 text-sm text-slate-300">Ends {formatBookingDate(booking.end_date)}</p>
            )}
            {booking.type === "flight" && (
              <div className="mt-4 space-y-3 rounded-2xl border border-slate-700 bg-[#06111d] p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                    Onward journey
                  </p>
                  <p className="mt-2 text-sm text-slate-200">
                    Flight number: {formatJourneyValue(booking.onward_flight_number)} | Date & time:{" "}
                    {booking.onward_departure_at
                      ? formatBookingDate(booking.onward_departure_at)
                      : "-"}{" "}
                    | Seat number: {formatJourneyValue(booking.onward_seat_number)} | Booking number/PNR:{" "}
                    {formatJourneyValue(booking.onward_pnr)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                    Return journey
                  </p>
                  <p className="mt-2 text-sm text-slate-200">
                    Flight number: {formatJourneyValue(booking.return_flight_number)} | Date & time:{" "}
                    {booking.return_departure_at
                      ? formatBookingDate(booking.return_departure_at)
                      : "-"}{" "}
                    | Seat number: {formatJourneyValue(booking.return_seat_number)} | Booking number/PNR:{" "}
                    {formatJourneyValue(booking.return_pnr)}
                  </p>
                </div>
              </div>
            )}
            <BookingDocumentsPanel bookingId={booking.id} documents={documents} />
          </div>
        ))}
      </div>
    </section>
  );
}
