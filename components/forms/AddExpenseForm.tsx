"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { addExpense } from "@/services/expenseService";
import type { Member } from "@/types/member";

const addExpenseSchema = z.object({
  description: z.string().trim().min(1, "Description is required"),
  totalAmount: z.number().positive("Total amount must be greater than 0"),
  expenseDate: z.string().trim().min(1, "Expense date is required"),
  paidByMemberId: z.string().trim().min(1, "Select who paid"),
  splitMemberIds: z.array(z.string()),
});

type AddExpenseFormValues = z.infer<typeof addExpenseSchema>;

interface AddExpenseFormProps {
  tripId: string;
  members: Member[];
}

export function AddExpenseForm({ tripId, members }: AddExpenseFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultSplitMemberIds = useMemo(() => members.map((member) => member.id), [members]);
  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    reset,
    resetField,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddExpenseFormValues>({
    resolver: zodResolver(addExpenseSchema),
    defaultValues: {
      expenseDate: today,
      splitMemberIds: defaultSplitMemberIds,
    },
  });

  const paidByMemberId = watch("paidByMemberId");
  const splitMemberIds = watch("splitMemberIds");

  useEffect(() => {
    if (!paidByMemberId) {
      return;
    }

    const currentSplitMembers = splitMemberIds ?? defaultSplitMemberIds;
    const splitExcludingPayer = currentSplitMembers.filter((memberId) => memberId !== paidByMemberId);

    if (splitExcludingPayer.length !== currentSplitMembers.length) {
      setValue("splitMemberIds", splitExcludingPayer, { shouldValidate: true });
    }
  }, [defaultSplitMemberIds, paidByMemberId, setValue, splitMemberIds]);

  const onSubmit = async (values: AddExpenseFormValues) => {
    setSubmitError(null);
    const normalizedSplitMemberIds = Array.from(
      new Set(values.splitMemberIds.filter((memberId) => memberId !== values.paidByMemberId)),
    );

    try {
      await addExpense({
        tripId,
        paidByMemberId: values.paidByMemberId,
        description: values.description,
        totalAmount: values.totalAmount,
        expenseDate: values.expenseDate,
        splitMemberIds: normalizedSplitMemberIds,
      });

      reset({
        description: "",
        expenseDate: today,
        paidByMemberId: "",
        splitMemberIds: defaultSplitMemberIds,
      });
      resetField("totalAmount");
      router.refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to add expense");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="space-y-1">
        <label htmlFor="expense-description" className="block text-sm font-medium">
          Description
        </label>
        <input
          id="expense-description"
          {...register("description")}
          className="w-full rounded-xl border border-slate-300 p-2.5 outline-none ring-amber-300 focus:ring-2"
        />
        {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="expense-total" className="block text-sm font-medium">
          Total amount
        </label>
        <input
          id="expense-total"
          type="number"
          min="0"
          step="0.01"
          {...register("totalAmount", { valueAsNumber: true })}
          className="w-full rounded-xl border border-slate-300 p-2.5 outline-none ring-amber-300 focus:ring-2"
        />
        {errors.totalAmount && <p className="text-sm text-red-600">{errors.totalAmount.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="expense-date" className="block text-sm font-medium">
          Expense date
        </label>
        <input
          id="expense-date"
          type="date"
          {...register("expenseDate")}
          className="w-full rounded-xl border border-slate-300 p-2.5 outline-none ring-amber-300 focus:ring-2"
        />
        {errors.expenseDate && <p className="text-sm text-red-600">{errors.expenseDate.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="expense-paid-by" className="block text-sm font-medium">
          Paid by
        </label>
        <select
          id="expense-paid-by"
          {...register("paidByMemberId")}
          className="w-full rounded-xl border border-slate-300 p-2.5 outline-none ring-amber-300 focus:ring-2"
          defaultValue=""
        >
          <option value="" disabled>
            Select member
          </option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
        {errors.paidByMemberId && <p className="text-sm text-red-600">{errors.paidByMemberId.message}</p>}
      </div>

      <fieldset className="space-y-1">
        <legend className="text-sm font-medium">Split among</legend>
        <p className="text-xs text-slate-600">
          Payer is excluded automatically. Leave all unchecked for personal expense.
        </p>
        <div className="space-y-1">
          {members.map((member) => (
            <label key={member.id} className="flex items-center gap-2 rounded-lg bg-amber-50 px-2 py-1 text-sm">
              <input
                type="checkbox"
                value={member.id}
                {...register("splitMemberIds")}
                className="accent-amber-600"
                disabled={member.id === paidByMemberId}
              />
              {member.name}
            </label>
          ))}
        </div>
      </fieldset>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <button
        type="submit"
        disabled={isSubmitting || members.length === 0}
        className="rounded-xl bg-amber-500 px-4 py-2.5 font-semibold text-slate-900 shadow-md transition hover:bg-amber-400 disabled:opacity-60"
      >
        {isSubmitting ? "Adding..." : "Add expense"}
      </button>
    </form>
  );
}
