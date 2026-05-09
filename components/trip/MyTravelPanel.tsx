"use client";

import { useEffect, useMemo, useState } from "react";

import {
  findTripMemberForAuthUser,
  shouldLinkTripMemberOwnership,
} from "@/lib/auth/resolveTripMember";
import { BookingDocumentsPanel } from "@/components/trip/BookingDocumentsPanel";
import { DeleteBookingButton } from "@/components/trip/DeleteBookingButton";
import { getCurrentAuthUser } from "@/services/authService";
import { linkMemberToAuthUser } from "@/services/memberService";
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
    <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(50,16,79,0.34),rgba(13,16,31,0.94))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-100/70">
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
  const isReturn = title.toLowerCase().includes("return");

  return (
    <div className="travel-card-hover relative overflow-hidden rounded-[28px] border border-fuchsia-400/18 bg-[linear-gradient(180deg,rgba(60,17,94,0.92),rgba(29,10,47,0.94)_42%,rgba(9,12,24,0.98)_100%)] shadow-[0_22px_60px_rgba(0,0,0,0.3)]">
      <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#08131f]" />
      <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#08131f]" />
      <div className="absolute inset-x-10 top-[74px] border-t border-dashed border-white/20" />
      <div className="absolute right-4 top-4 rounded-full border border-white/12 bg-white/6 p-2 text-fuchsia-100/70">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          {isReturn ? (
            <path d="M20 16v4h-4M4 8V4h4M19 20c-1.7-3.4-5.2-6-9-6H4M5 4c1.7 3.4 5.2 6 9 6h6" />
          ) : (
            <path d="M3 12h12M11 6l6 6-6 6M21 6v12" />
          )}
        </svg>
      </div>
      <div className="border-b border-white/8 px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-fuchsia-100/90">
            {title}
          </p>
          <p className="mt-2 text-base font-semibold tracking-[-0.02em] text-white">
            {route}
          </p>
          <p className="mt-1 text-sm text-violet-100/85">
            {formattedDate}
          </p>
        </div>
      </div>
      <div className="grid gap-3 p-5 sm:grid-cols-3">
        <JourneyField label="Flight Number" value={formatJourneyValue(flightNumber)} />
        <JourneyField label="Seat Number" value={formatJourneyValue(seatNumber)} />
        <JourneyField label="Booking / PNR" value={formatJourneyValue(pnr)} />
      </div>
    </div>
  );
}

export function MyTravelPanel({ members, personalBookings }: MyTravelPanelProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      const user = await getCurrentAuthUser();
      if (!isMounted) {
        return;
      }

      setCurrentUserId(user?.id ?? null);
      setCurrentEmail(user?.email ?? null);
      setIsLoadingUser(false);
    }

    void loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentMember = useMemo(() => {
    if (!currentUserId && !currentEmail) {
      return null;
    }

    return findTripMemberForAuthUser(members, {
      id: currentUserId ?? "",
      email: currentEmail,
    });
  }, [currentEmail, currentUserId, members]);

  useEffect(() => {
    let isMounted = true;

    async function linkOwnershipIfNeeded() {
      const resolvedMember = currentMember;

      if (
        !currentUserId ||
        !currentEmail ||
        !resolvedMember ||
        !shouldLinkTripMemberOwnership(resolvedMember, {
          id: currentUserId,
          email: currentEmail,
        })
      ) {
        return;
      }

      try {
        await linkMemberToAuthUser(resolvedMember.id, currentUserId);
      } catch {
        // Keep the email fallback working even if ownership linking fails.
      }
    }

    void linkOwnershipIfNeeded();

    return () => {
      isMounted = false;
    };
  }, [currentEmail, currentMember, currentUserId]);

  const myBookings = useMemo(() => {
    if (!currentMember) {
      return [];
    }

    return personalBookings.filter((entry) => entry.booking.member_id === currentMember.id);
  }, [currentMember, personalBookings]);

  return (
    <section className="rounded-[30px] border border-fuchsia-400/16 bg-[linear-gradient(180deg,rgba(71,20,109,0.14),rgba(5,11,22,0.96))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold tracking-[-0.03em] text-white">My Travel</h3>
          <p className="text-sm leading-6 text-slate-300">
            Flight and bus tickets stay personal and resolve from the signed-in traveler.
          </p>
        </div>
        {currentMember && (
          <p className="rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-100">
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
          <div key={booking.id} className="travel-card-hover rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,20,38,0.96),rgba(6,12,24,0.98))] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.26)]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/16 bg-fuchsia-400/8 px-3 py-1.5 text-fuchsia-100/85">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  {booking.type === "flight" ? (
                    <path d="M2 16l20-8-8 20-2-8-8-4zM12 20l-2-8" />
                  ) : (
                    <>
                      <rect x="4" y="6" width="16" height="11" rx="2" />
                      <path d="M7 17v2M17 17v2M8 10h8" />
                    </>
                  )}
                </svg>
                <p className="text-xs font-semibold uppercase tracking-[0.24em]">
                  {formatBookingType(booking.type)}
                </p>
              </div>
              <h4 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
                {currentMember?.name ?? "Traveler ticket"}
              </h4>
            </div>
            {booking.type === "flight" && (
              <div className="mt-5 space-y-4">
                <JourneyCard
                  title="Onward Journey"
                  route={
                    booking.onward_origin && booking.onward_destination
                      ? `${booking.onward_origin}-${booking.onward_destination}`
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
                      ? `${booking.return_origin}-${booking.return_destination}`
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
