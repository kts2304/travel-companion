import { splitExpenseAmounts } from "@/lib/calculations/splitExpense";
import { supabase } from "@/lib/supabaseClient";
import type { AddExpenseInput, Expense, ExpenseSplit, UpdateExpenseInput } from "@/types/expense";

function getNormalizedSplitMemberIds(splitMemberIds: string[], paidByMemberId: string): string[] {
  return Array.from(new Set(splitMemberIds.filter((memberId) => memberId !== paidByMemberId)));
}

function buildSplitRowsExcludingPayerShare(
  totalAmount: number,
  paidByMemberId: string,
  nonPayerMemberIds: string[],
  expenseId: string,
) {
  const orderedMembers = [paidByMemberId, ...nonPayerMemberIds];
  const allShares = splitExpenseAmounts(totalAmount, orderedMembers.length);

  return nonPayerMemberIds.map((memberId) => {
    const memberIndex = orderedMembers.indexOf(memberId);
    return {
      expense_id: expenseId,
      member_id: memberId,
      owed_amount: allShares[memberIndex],
    };
  });
}

export async function addExpense(input: AddExpenseInput): Promise<Expense> {
  const splitMemberIds = getNormalizedSplitMemberIds(input.splitMemberIds, input.paidByMemberId);

  const { data: expense, error: expenseError } = await supabase
    .from("expenses")
    .insert({
      trip_id: input.tripId,
      paid_by_member_id: input.paidByMemberId,
      description: input.description,
      total_amount: input.totalAmount,
      expense_date: input.expenseDate,
    })
    .select("*")
    .single();

  if (expenseError) {
    throw new Error(expenseError.message);
  }

  const splitsToInsert = buildSplitRowsExcludingPayerShare(
    input.totalAmount,
    input.paidByMemberId,
    splitMemberIds,
    String(expense.id),
  );

  const { error: splitsError } = await supabase.from("expense_splits").insert(splitsToInsert);

  if (splitsError) {
    throw new Error(splitsError.message);
  }

  return expense as Expense;
}

export async function getExpensesByTrip(tripId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("trip_id", tripId)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    trip_id: String(row.trip_id),
    paid_by_member_id: String(row.paid_by_member_id),
    description: String(row.description),
    total_amount: Number(row.total_amount),
    expense_date: String(row.expense_date),
    created_at: String(row.created_at),
  }));
}

export async function getExpenseSplitsByTrip(tripId: string): Promise<ExpenseSplit[]> {
  const { data, error } = await supabase
    .from("expense_splits")
    .select("*, expenses!inner(trip_id)")
    .eq("expenses.trip_id", tripId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    expense_id: String(row.expense_id),
    member_id: String(row.member_id),
    owed_amount: Number(row.owed_amount),
    created_at: String(row.created_at),
  }));
}

export async function updateExpense(expenseId: string, input: UpdateExpenseInput): Promise<Expense> {
  const splitMemberIds = getNormalizedSplitMemberIds(input.splitMemberIds, input.paidByMemberId);

  const { data: updatedExpense, error: updateError } = await supabase
    .from("expenses")
    .update({
      paid_by_member_id: input.paidByMemberId,
      description: input.description,
      total_amount: input.totalAmount,
      expense_date: input.expenseDate,
    })
    .eq("id", expenseId)
    .select("*")
    .single();

  if (updateError) {
    throw new Error(updateError.message);
  }

  const { error: deleteSplitsError } = await supabase.from("expense_splits").delete().eq("expense_id", expenseId);
  if (deleteSplitsError) {
    throw new Error(deleteSplitsError.message);
  }

  const splitsToInsert = buildSplitRowsExcludingPayerShare(
    input.totalAmount,
    input.paidByMemberId,
    splitMemberIds,
    expenseId,
  );
  const { error: insertSplitsError } = await supabase.from("expense_splits").insert(splitsToInsert);

  if (insertSplitsError) {
    throw new Error(insertSplitsError.message);
  }

  return {
    id: String(updatedExpense.id),
    trip_id: String(updatedExpense.trip_id),
    paid_by_member_id: String(updatedExpense.paid_by_member_id),
    description: String(updatedExpense.description),
    total_amount: Number(updatedExpense.total_amount),
    expense_date: String(updatedExpense.expense_date),
    created_at: String(updatedExpense.created_at),
  };
}

export async function deleteExpense(expenseId: string): Promise<void> {
  const { error } = await supabase.from("expenses").delete().eq("id", expenseId);

  if (error) {
    throw new Error(error.message);
  }
}
