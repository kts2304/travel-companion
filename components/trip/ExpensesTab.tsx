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
        <p className="theme-card rounded-[24px] border p-4 text-sm font-medium theme-heading shadow-[0_14px_24px_rgba(214,142,26,0.12)]">
          Add members before creating expenses.
        </p>
      ) : (
        <AddExpenseForm tripId={tripId} members={members} />
      )}

      <section className="theme-card rounded-[28px] border p-5 shadow-[0_18px_32px_rgba(118,60,145,0.08)]">
        <h3 className="theme-heading text-xl font-black tracking-[-0.03em]">Expense history</h3>
        <p className="theme-muted mt-1 text-sm">
          Review every entry, adjust mistakes, and keep the split timeline tidy.
        </p>
        <ManageExpensesList expenses={expenses} members={members} expenseSplits={expenseSplits} />
      </section>
    </div>
  );
}
