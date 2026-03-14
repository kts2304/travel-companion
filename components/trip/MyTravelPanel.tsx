"use client";

import { useEffect, useMemo, useState } from "react";

import { BookingDocumentsPanel } from "@/components/trip/BookingDocumentsPanel";
import { supabase } from "@/lib/supabaseClient";
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

export function MyTravelPanel({ members, personalBookings }: MyTravelPanelProps) {
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      const { data } = await supabase.auth.getUser();
      if (!isMounted) {
        return;
      }

      setCurrentEmail(data.user?.email?.trim().toLowerCase() ?? null);
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
    <section className="rounded-2xl border border-cyan-200 bg-cyan-50/80 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">My Travel</h3>
          <p className="text-sm text-slate-600">
            Flight and bus tickets stay personal and resolve from the signed-in traveler.
          </p>
        </div>
        {currentMember && (
          <p className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
            {currentMember.name}
          </p>
        )}
      </div>

      {isLoadingUser && <p className="mt-4 text-sm text-slate-600">Checking signed-in traveler...</p>}

      {!isLoadingUser && !currentEmail && (
        <p className="mt-4 text-sm text-slate-600">
          Sign in with the same email used on your trip member profile to see only your tickets here.
        </p>
      )}

      {!isLoadingUser && currentEmail && !currentMember && (
        <p className="mt-4 text-sm text-slate-600">
          No trip member matches the signed-in email <span className="font-medium">{currentEmail}</span>.
        </p>
      )}

      {!isLoadingUser && currentMember && myBookings.length === 0 && (
        <p className="mt-4 text-sm text-slate-600">
          No personal flight or bus tickets are assigned to you yet.
        </p>
      )}

      <div className="mt-4 space-y-3">
        {myBookings.map(({ booking, documents }) => (
          <div key={booking.id} className="rounded-2xl border border-cyan-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
                  {formatBookingType(booking.type)}
                </p>
                <h4 className="text-base font-semibold text-slate-900">{booking.title}</h4>
              </div>
              <p className="text-sm font-medium text-slate-700">
                {formatBookingDate(booking.start_date)}
              </p>
            </div>
            {booking.end_date && (
              <p className="mt-2 text-sm text-slate-600">Ends {formatBookingDate(booking.end_date)}</p>
            )}
            {booking.notes && <p className="mt-2 text-sm text-slate-700">{booking.notes}</p>}
            <BookingDocumentsPanel bookingId={booking.id} documents={documents} />
          </div>
        ))}
      </div>
    </section>
  );
}
