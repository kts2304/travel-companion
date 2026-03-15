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
        <div className="mb-5 flex items-center justify-between gap-4 rounded-[28px] border border-slate-700/90 bg-[#020b16]/95 px-5 py-4 shadow-[0_30px_80px_rgba(1,6,17,0.55)] backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              Travel Companion
            </p>
            <p className="mt-1 text-sm text-slate-300">
              Trip workspace for members, expenses, bookings, and settlement visibility
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <AuthStatus />
            <Link
              href="/"
              className="rounded-xl border border-slate-600 bg-slate-900/90 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-400/60 hover:text-white"
            >
              Exit workspace
            </Link>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)_360px]">
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
