import Link from "next/link";
import { notFound } from "next/navigation";

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

function getNetText(balance: number): string {
  if (balance > 0) {
    return `Gets back Rs ${balance.toFixed(2)}`;
  }
  if (balance < 0) {
    return `Owes Rs ${Math.abs(balance).toFixed(2)}`;
  }
  return "Settled up";
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
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="rounded-3xl border border-white/70 bg-white/90 p-7 shadow-xl">
        <h1 className="text-4xl font-bold text-slate-900">{trip.name}</h1>
        {trip.destination && <p className="mt-1 text-slate-600">{trip.destination}</p>}

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link
            href={`/trips/${tripId}/members`}
            className="rounded-xl bg-cyan-600 px-4 py-2 font-semibold text-white shadow-md transition hover:bg-cyan-700"
          >
            Manage members
          </Link>
          <Link
            href={`/trips/${tripId}/expenses`}
            className="rounded-xl bg-amber-500 px-4 py-2 font-semibold text-slate-900 shadow-md transition hover:bg-amber-400"
          >
            Manage expenses
          </Link>
        </div>

        <section className="mt-8 rounded-2xl border border-sky-200 bg-sky-50/80 p-4">
          <h2 className="text-xl font-semibold text-slate-900">Overall summary (Splitwise style)</h2>
          <p className="mt-1 text-xs text-slate-600">Paid | Share | Net (Net = Paid - Share)</p>
          <div className="mt-3 space-y-2">
            {memberBalances.length === 0 && <p className="text-sm text-slate-600">No members yet.</p>}
            {memberBalances.map((memberBalance) => (
              <p key={memberBalance.memberId} className="text-sm text-slate-700">
                {memberBalance.memberName}: Paid Rs {memberBalance.totalPaid.toFixed(2)} | Share Rs{" "}
                {memberBalance.totalOwed.toFixed(2)} | Net Rs {memberBalance.balance.toFixed(2)} |{" "}
                {getNetText(memberBalance.balance)}
              </p>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-cyan-200 bg-cyan-50/80 p-4">
          <h2 className="text-xl font-semibold text-slate-900">Overall settlements</h2>
          <div className="mt-3 space-y-2">
            {settlements.length === 0 && (
              <p className="text-sm text-slate-600">No outstanding balances.</p>
            )}
            {settlements.map((settlement, index) => (
              <p key={`${settlement.fromMemberId}-${settlement.toMemberId}-${index}`} className="text-sm text-slate-700">
                {memberLabelById.get(settlement.fromMemberId) ?? settlement.fromMemberName} owes{" "}
                {memberLabelById.get(settlement.toMemberId) ?? settlement.toMemberName} Rs{" "}
                {settlement.amount.toFixed(2)}
              </p>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900">Day-wise summary</h2>
          {dayWiseSummaries.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No expenses added yet.</p>
          ) : (
            <div className="mt-4 space-y-5">
              {dayWiseSummaries.map((summary) => (
                <div key={summary.date} className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
                  <h3 className="text-lg font-semibold text-slate-900">{summary.date}</h3>
                  <p className="mt-1 text-xs text-slate-600">Paid | Share | Net</p>
                  <div className="mt-2 space-y-1">
                    {summary.memberBalances.map((memberBalance) => (
                      <p key={`${summary.date}-${memberBalance.memberId}`} className="text-sm text-slate-700">
                        {memberBalance.memberName}: Paid Rs {memberBalance.totalPaid.toFixed(2)} | Share Rs{" "}
                        {memberBalance.totalOwed.toFixed(2)} | Net Rs {memberBalance.balance.toFixed(2)} |{" "}
                        {getNetText(memberBalance.balance)}
                      </p>
                    ))}
                  </div>
                  <div className="mt-3 space-y-1">
                    {summary.settlements.length === 0 ? (
                      <p className="text-sm text-slate-600">No settlement needed for this day.</p>
                    ) : (
                      summary.settlements.map((settlement, index) => (
                      <p
                          key={`${summary.date}-${settlement.fromMemberId}-${settlement.toMemberId}-${index}`}
                          className="text-sm text-slate-700"
                        >
                          {memberLabelById.get(settlement.fromMemberId) ?? settlement.fromMemberName} owes{" "}
                          {memberLabelById.get(settlement.toMemberId) ?? settlement.toMemberName} Rs{" "}
                          {settlement.amount.toFixed(2)}
                        </p>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
