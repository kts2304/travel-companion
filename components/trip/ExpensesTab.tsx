import { AddExpenseForm } from "@/components/forms/AddExpenseForm";
import { ManageExpensesList } from "@/components/forms/ManageExpensesList";
import type { Expense, ExpenseSplit } from "@/types/expense";
import type { Member } from "@/types/member";

interface ExpensesTabProps {
  tripId: string;
  members: Member[];
  expenses: Expense[];
  expenseSplits: ExpenseSplit[];
}

export function ExpensesTab({ tripId, members, expenses, expenseSplits }: ExpensesTabProps) {
  return (
    <div className="space-y-6">
      {members.length === 0 ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
          Add members before creating expenses.
        </p>
      ) : (
        <AddExpenseForm tripId={tripId} members={members} />
      )}

      <section>
        <h3 className="text-lg font-semibold text-white">Expense history</h3>
        <ManageExpensesList expenses={expenses} members={members} expenseSplits={expenseSplits} />
      </section>
    </div>
  );
}
