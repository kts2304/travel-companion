"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { deleteExpense, updateExpense } from "@/services/expenseService";
import type { Expense, ExpenseSplit } from "@/types/expense";
import type { Member } from "@/types/member";

const editExpenseSchema = z.object({
  description: z.string().trim().min(1, "Description is required"),
  totalAmount: z.number().positive("Total amount must be greater than 0"),
  expenseDate: z.string().trim().min(1, "Expense date is required"),
  paidByMemberId: z.string().trim().min(1, "Select who paid"),
  splitMemberIds: z.array(z.string()),
});

type EditExpenseValues = z.infer<typeof editExpenseSchema>;

interface ManageExpensesListProps {
  expenses: Expense[];
  members: Member[];
  expenseSplits: ExpenseSplit[];
}

interface ExpenseListItemProps {
  expense: Expense;
  members: Member[];
  splitMemberIds: string[];
}

function ExpenseListItem({ expense, members, splitMemberIds }: ExpenseListItemProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditExpenseValues>({
    resolver: zodResolver(editExpenseSchema),
    defaultValues: {
      description: expense.description,
      totalAmount: expense.total_amount,
      expenseDate: expense.expense_date,
      paidByMemberId: expense.paid_by_member_id,
      splitMemberIds,
    },
  });

  const paidByMemberId = watch("paidByMemberId");
  const splitMemberIdsFromForm = watch("splitMemberIds");

  useEffect(() => {
    if (!paidByMemberId) {
      return;
    }

    const currentSplitMembers = splitMemberIdsFromForm ?? splitMemberIds;
    const splitExcludingPayer = currentSplitMembers.filter((memberId) => memberId !== paidByMemberId);

    if (splitExcludingPayer.length !== currentSplitMembers.length) {
      setValue("splitMemberIds", splitExcludingPayer, {
        shouldValidate: true,
      });
    }
  }, [paidByMemberId, setValue, splitMemberIds, splitMemberIdsFromForm]);

  const onUpdate = async (values: EditExpenseValues) => {
    setSubmitError(null);
    const normalizedSplitMemberIds = Array.from(
      new Set(values.splitMemberIds.filter((memberId) => memberId !== values.paidByMemberId)),
    );
    try {
      await updateExpense(expense.id, {
        ...values,
        splitMemberIds: normalizedSplitMemberIds,
      });
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to update expense");
    }
  };

  const onDelete = async () => {
    if (!window.confirm("Delete this expense?")) {
      return;
    }

    setSubmitError(null);
    try {
      await deleteExpense(expense.id);
      router.refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to delete expense");
    }
  };

  const memberNameMap = new Map(members.map((member) => [member.id, member.name]));

  if (!isEditing) {
    return (
      <li className="rounded-xl border border-amber-200 bg-amber-50/80 p-3">
        <p className="font-medium text-slate-900">{expense.description}</p>
        <p className="text-slate-700">Date: {expense.expense_date}</p>
        <p className="text-slate-700">Amount: Rs {expense.total_amount.toFixed(2)}</p>
        <p className="text-slate-700">
          Paid by: {memberNameMap.get(expense.paid_by_member_id) ?? "Unknown member"}
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Delete
          </button>
        </div>
        {submitError && <p className="mt-2 text-sm text-red-600">{submitError}</p>}
      </li>
    );
  }

  return (
    <li className="rounded-xl border border-sky-200 bg-sky-50/80 p-3">
      <form onSubmit={handleSubmit(onUpdate)} className="space-y-3">
        <div className="space-y-1">
          <label htmlFor={`edit-description-${expense.id}`} className="block text-sm font-medium">
            Description
          </label>
          <input
            id={`edit-description-${expense.id}`}
            {...register("description")}
            className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none ring-sky-300 focus:ring-2"
          />
          {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor={`edit-total-${expense.id}`} className="block text-sm font-medium">
              Total amount
            </label>
            <input
              id={`edit-total-${expense.id}`}
              type="number"
              min="0"
              step="0.01"
              {...register("totalAmount", { valueAsNumber: true })}
              className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none ring-sky-300 focus:ring-2"
            />
            {errors.totalAmount && <p className="text-xs text-red-600">{errors.totalAmount.message}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor={`edit-date-${expense.id}`} className="block text-sm font-medium">
              Expense date
            </label>
            <input
              id={`edit-date-${expense.id}`}
              type="date"
              {...register("expenseDate")}
              className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none ring-sky-300 focus:ring-2"
            />
            {errors.expenseDate && <p className="text-xs text-red-600">{errors.expenseDate.message}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor={`edit-paid-by-${expense.id}`} className="block text-sm font-medium">
            Paid by
          </label>
          <select
            id={`edit-paid-by-${expense.id}`}
            {...register("paidByMemberId")}
            className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none ring-sky-300 focus:ring-2"
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
          {errors.paidByMemberId && <p className="text-xs text-red-600">{errors.paidByMemberId.message}</p>}
        </div>

        <fieldset className="space-y-1">
          <legend className="text-sm font-medium">Split among</legend>
          <p className="text-xs text-slate-600">
            Payer is excluded automatically. Leave all unchecked for personal expense.
          </p>
          <div className="grid gap-1 sm:grid-cols-2">
            {members.map((member) => (
              <label key={member.id} className="flex items-center gap-2 rounded-lg bg-white px-2 py-1 text-sm">
                <input
                  type="checkbox"
                  value={member.id}
                  {...register("splitMemberIds")}
                  className="accent-sky-600"
                  disabled={member.id === paidByMemberId}
                />
                {member.name}
              </label>
            ))}
          </div>
        </fieldset>

        {submitError && <p className="text-sm text-red-600">{submitError}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </li>
  );
}

export function ManageExpensesList({ expenses, members, expenseSplits }: ManageExpensesListProps) {
  const splitMemberIdsByExpense = useMemo(() => {
    const grouped = new Map<string, string[]>();
    for (const split of expenseSplits) {
      const existing = grouped.get(split.expense_id);
      if (existing) {
        existing.push(split.member_id);
      } else {
        grouped.set(split.expense_id, [split.member_id]);
      }
    }
    return grouped;
  }, [expenseSplits]);

  return (
    <ul className="mt-3 space-y-2 text-sm">
      {expenses.length === 0 && <li className="text-slate-600">No expenses added yet.</li>}
      {expenses.map((expense) => (
        <ExpenseListItem
          key={expense.id}
          expense={expense}
          members={members}
          splitMemberIds={splitMemberIdsByExpense.get(expense.id) ?? []}
        />
      ))}
    </ul>
  );
}
