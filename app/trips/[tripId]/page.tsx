import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthStatus } from "@/components/auth/AuthStatus";
import { BookingsTab } from "@/components/trip/BookingsTab";
import { TripInsightsPanel } from "@/components/trip/TripInsightsPanel";
import { TripTabs } from "@/components/trip/TripTabs";
import { TripWorkspaceSidebar } from "@/components/trip/TripWorkspaceSidebar";
import { calculateMemberBalances, calculateSettlements } from "@/lib/calculations/splitExpense";
import { getExpenseSplitsByTrip, getExpensesByTrip } from "@/services/expenseService";
import { getMembersByTrip } from "@/services/memberService";
import { getTripById } from "@/services/tripService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface TripDetailsPageProps {
  params: Promise<{ tripId: string }>;
}

interface DayWiseSummary {
  date: string;
  memberBalances: ReturnType<typeof calculateMemberBalances>;
  settlements: ReturnType<typeof calculateSettlements>;
}

export default async function TripDetailsPage({ params }: TripDetailsPageProps) {
  const { tripId } = await params;
  const trip = await getTripById(tripId);

  if (!trip) {
    notFound();
  }

  const [members, expenses, expenseSplits] = await Promise.all([
    getMembersByTrip(tripId),
    getExpensesByTrip(tripId),
    getExpenseSplitsByTrip(tripId),
  ]);

  const memberBalances = calculateMemberBalances(members, expenses, expenseSplits);
  const settlements = calculateSettlements(memberBalances);
  const nameCounts = new Map<string, number>();
  for (const member of members) {
    nameCounts.set(member.name, (nameCounts.get(member.name) ?? 0) + 1);
  }
  const nameSeenCounts = new Map<string, number>();
  const memberLabelById = new Map(
    members.map((member) => {
      const totalWithSameName = nameCounts.get(member.name) ?? 0;
      if (totalWithSameName <= 1) {
        return [member.id, member.name] as const;
      }

      const currentIndex = (nameSeenCounts.get(member.name) ?? 0) + 1;
      nameSeenCounts.set(member.name, currentIndex);
      return [member.id, `${member.name} (${currentIndex})`] as const;
    }),
  );

  const expenseIdToDate = new Map(expenses.map((expense) => [expense.id, expense.expense_date]));
  const uniqueDates = Array.from(new Set(expenses.map((expense) => expense.expense_date))).sort((a, b) =>
    b.localeCompare(a),
  );

  const dayWiseSummaries: DayWiseSummary[] = uniqueDates.map((date) => {
    const dayExpenses = expenses.filter((expense) => expense.expense_date === date);
    const dayExpenseIds = new Set(dayExpenses.map((expense) => expense.id));
    const daySplits = expenseSplits.filter((split) => {
      const splitDate = expenseIdToDate.get(split.expense_id);
      return Boolean(splitDate) && dayExpenseIds.has(split.expense_id);
    });

    const dayMemberBalances = calculateMemberBalances(members, dayExpenses, daySplits);
    const daySettlements = calculateSettlements(dayMemberBalances);

    return {
      date,
      memberBalances: dayMemberBalances,
      settlements: daySettlements,
    };
  });

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 xl:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="relative mb-5 overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(180deg,rgba(78,24,109,0.95),rgba(58,19,87,0.96))] px-5 py-5 shadow-[0_24px_48px_rgba(118,60,145,0.18)] backdrop-blur">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden text-fuchsia-100/10"
          >
            <div className="travel-float absolute -right-8 top-4 h-28 w-28 rounded-full bg-current blur-3xl" />
            <svg
              viewBox="0 0 360 140"
              className="travel-float-delayed absolute right-20 top-0 h-32 w-72"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
            >
              <path d="M20 96c52-40 110-58 182-58 54 0 96 10 138 26" />
              <path d="M154 18l18 30 50 10-40 12-10 30-18-24-52 6 36-16-10-24z" />
            </svg>
          </div>
          <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
              Travel Companion
            </p>
            <p className="mt-2 text-sm text-white/80">
              Trip workspace for members, expenses, bookings, and settlement visibility
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <AuthStatus />
            <Link
              href="/"
              className="rounded-full border border-white/16 bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-white/16"
            >
              Exit workspace
            </Link>
          </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_370px]">
          <TripWorkspaceSidebar
            trip={trip}
            memberCount={members.length}
            expenseCount={expenses.length}
          />

          <TripTabs
            tripId={tripId}
            members={members}
            expenses={expenses}
            expenseSplits={expenseSplits}
            bookingsContent={
              <BookingsTab
                tripId={tripId}
              />
            }
          />

          <TripInsightsPanel
            memberBalances={memberBalances}
            settlements={settlements}
            dayWiseSummaries={dayWiseSummaries}
            memberLabelById={memberLabelById}
          />
        </div>
      </div>
    </main>
  );
}
