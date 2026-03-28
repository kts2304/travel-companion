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
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddExpenseFormValues>({
    resolver: zodResolver(addExpenseSchema),
    defaultValues: {
      totalAmount: 0,
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
        totalAmount: 0,
        expenseDate: today,
        paidByMemberId: "",
        splitMemberIds: defaultSplitMemberIds,
      });
      router.refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to add expense");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="off"
      className="space-y-4 rounded-[28px] border border-fuchsia-900/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,239,250,0.92))] p-5 shadow-[0_20px_36px_rgba(118,60,145,0.12)]"
    >
      <div className="space-y-1">
        <label htmlFor="expense-description" className="block text-sm font-bold text-[#35194f]">
          Description
        </label>
        <input
          id="expense-description"
          {...register("description")}
          autoComplete="off"
          className="w-full rounded-[22px] border border-fuchsia-900/12 bg-white p-3 text-[#35194f] outline-none ring-amber-300 focus:ring-2"
        />
        {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="expense-total" className="block text-sm font-bold text-[#35194f]">
          Total amount
        </label>
        <input
          id="expense-total"
          type="number"
          min="0"
          step="0.01"
          {...register("totalAmount", { valueAsNumber: true })}
          autoComplete="off"
          className="w-full rounded-[22px] border border-fuchsia-900/12 bg-white p-3 text-[#35194f] outline-none ring-amber-300 focus:ring-2"
        />
        {errors.totalAmount && <p className="text-sm text-red-600">{errors.totalAmount.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="expense-date" className="block text-sm font-bold text-[#35194f]">
          Expense date
        </label>
        <input
          id="expense-date"
          type="date"
          {...register("expenseDate")}
          autoComplete="off"
          className="w-full rounded-[22px] border border-fuchsia-900/12 bg-white p-3 text-[#35194f] outline-none ring-amber-300 focus:ring-2"
        />
        {errors.expenseDate && <p className="text-sm text-red-600">{errors.expenseDate.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="expense-paid-by" className="block text-sm font-bold text-[#35194f]">
          Paid by
        </label>
        <select
          id="expense-paid-by"
          {...register("paidByMemberId")}
          autoComplete="off"
          className="w-full rounded-[22px] border border-fuchsia-900/12 bg-white p-3 text-[#35194f] outline-none ring-amber-300 focus:ring-2"
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
        <legend className="text-sm font-bold text-[#35194f]">Split among</legend>
        <p className="text-xs text-[#6a567b]">
          Payer is excluded automatically. Leave all unchecked for personal expense.
        </p>
        <div className="space-y-1">
          {members.map((member) => (
            <label
              key={member.id}
              className="flex items-center gap-2 rounded-[18px] border border-amber-400/25 bg-[linear-gradient(180deg,rgba(255,248,232,0.96),rgba(255,241,206,0.88))] px-3 py-2 text-sm font-medium text-[#6d4a14]"
            >
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
        className="rounded-full bg-[linear-gradient(135deg,#f2a93b,#dd7c18)] px-5 py-3 font-semibold text-[#351f08] shadow-[0_18px_34px_rgba(221,124,24,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_42px_rgba(221,124,24,0.26)] disabled:opacity-60"
      >
        {isSubmitting ? "Adding..." : "Add expense"}
      </button>
    </form>
  );
}
