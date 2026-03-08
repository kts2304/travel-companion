import Link from "next/link";
import { notFound } from "next/navigation";

import { AddExpenseForm } from "@/components/forms/AddExpenseForm";
import { ManageExpensesList } from "@/components/forms/ManageExpensesList";
import { getExpenseSplitsByTrip, getExpensesByTrip } from "@/services/expenseService";
import { getMembersByTrip } from "@/services/memberService";
import { getTripById } from "@/services/tripService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface TripExpensesPageProps {
  params: Promise<{ tripId: string }>;
}

export default async function TripExpensesPage({ params }: TripExpensesPageProps) {
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

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="rounded-3xl border border-white/70 bg-white/90 p-7 shadow-xl">
        <h1 className="text-3xl font-bold text-slate-900">{trip.name} - Expenses</h1>

        {members.length === 0 ? (
          <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            Add members before creating expenses.
          </p>
        ) : (
          <div className="mt-6">
            <AddExpenseForm tripId={tripId} members={members} />
          </div>
        )}

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">Expense history</h2>
          <ManageExpensesList expenses={expenses} members={members} expenseSplits={expenseSplits} />
        </section>

        <Link
          href={`/trips/${tripId}`}
          className="mt-6 inline-block text-sm font-medium text-sky-700 hover:underline"
        >
          Back to trip
        </Link>
      </div>
    </main>
  );
}
