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
        <p className="rounded-[24px] border border-amber-400/30 bg-[linear-gradient(180deg,rgba(255,247,217,0.95),rgba(255,239,186,0.9))] p-4 text-sm font-medium text-[#7a4c14] shadow-[0_14px_24px_rgba(214,142,26,0.12)]">
          Add members before creating expenses.
        </p>
      ) : (
        <AddExpenseForm tripId={tripId} members={members} />
      )}

      <section className="rounded-[28px] border border-fuchsia-900/10 bg-white/72 p-5 shadow-[0_18px_32px_rgba(118,60,145,0.08)]">
        <h3 className="text-xl font-black tracking-[-0.03em] text-[#2f143f]">Expense history</h3>
        <p className="mt-1 text-sm text-[#6a567b]">
          Review every entry, adjust mistakes, and keep the split timeline tidy.
        </p>
        <ManageExpensesList expenses={expenses} members={members} expenseSplits={expenseSplits} />
      </section>
    </div>
  );
}
