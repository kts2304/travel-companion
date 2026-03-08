import type { Expense, ExpenseSplit, Settlement } from "@/types/expense";
import type { Member, MemberBalance } from "@/types/member";

function toPaise(amount: number): number {
  return Math.round(amount * 100);
}

function fromPaise(paise: number): number {
  return Number((paise / 100).toFixed(2));
}

export function splitExpense(totalAmount: number, memberCount: number): number {
  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    throw new Error("totalAmount must be a positive number");
  }

  if (!Number.isInteger(memberCount) || memberCount <= 0) {
    throw new Error("memberCount must be a positive integer");
  }

  return Number((totalAmount / memberCount).toFixed(2));
}

export function splitExpenseAmounts(totalAmount: number, memberCount: number): number[] {
  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    throw new Error("totalAmount must be a positive number");
  }

  if (!Number.isInteger(memberCount) || memberCount <= 0) {
    throw new Error("memberCount must be a positive integer");
  }

  const totalPaise = toPaise(totalAmount);
  const baseSharePaise = Math.floor(totalPaise / memberCount);
  const remainderPaise = totalPaise % memberCount;
  const splits = new Array<number>(memberCount).fill(baseSharePaise);

  for (let i = 0; i < remainderPaise; i += 1) {
    splits[i] += 1;
  }

  return splits.map(fromPaise);
}

export function calculateMemberBalances(
  members: Member[],
  expenses: Expense[],
  expenseSplits: ExpenseSplit[],
): MemberBalance[] {
  const balances = new Map<
    string,
    {
      memberId: string;
      memberName: string;
      totalPaidPaise: number;
      totalOwedPaise: number;
    }
  >();

  for (const member of members) {
    balances.set(member.id, {
      memberId: member.id,
      memberName: member.name,
      totalPaidPaise: 0,
      totalOwedPaise: 0,
    });
  }

  for (const expense of expenses) {
    const payer = balances.get(expense.paid_by_member_id);
    if (payer) {
      payer.totalPaidPaise += toPaise(Number(expense.total_amount));
    }
  }

  const owedPaiseByExpenseId = new Map<string, number>();
  for (const split of expenseSplits) {
    const memberBalance = balances.get(split.member_id);
    const splitPaise = toPaise(Number(split.owed_amount));
    if (memberBalance) {
      memberBalance.totalOwedPaise += splitPaise;
    }
    owedPaiseByExpenseId.set(
      split.expense_id,
      (owedPaiseByExpenseId.get(split.expense_id) ?? 0) + splitPaise,
    );
  }

  for (const expense of expenses) {
    const payer = balances.get(expense.paid_by_member_id);
    if (!payer) {
      continue;
    }

    // In payer-excluded split storage, payer's own share is implicit.
    // Recover it so total balances remain mathematically consistent.
    const totalPaise = toPaise(Number(expense.total_amount));
    const explicitOwedPaise = owedPaiseByExpenseId.get(expense.id) ?? 0;
    const payerImplicitSharePaise = totalPaise - explicitOwedPaise;

    if (payerImplicitSharePaise > 0) {
      payer.totalOwedPaise += payerImplicitSharePaise;
    }
  }

  return Array.from(balances.values()).map((memberBalance) => ({
    memberId: memberBalance.memberId,
    memberName: memberBalance.memberName,
    totalPaid: fromPaise(memberBalance.totalPaidPaise),
    totalOwed: fromPaise(memberBalance.totalOwedPaise),
    balance: fromPaise(memberBalance.totalPaidPaise - memberBalance.totalOwedPaise),
  }));
}

export function calculateSettlements(memberBalances: MemberBalance[]): Settlement[] {
  const debtors = memberBalances
    .filter((member) => member.balance < 0)
    .map((member) => ({ ...member, remainingPaise: Math.abs(toPaise(member.balance)) }));
  const creditors = memberBalances
    .filter((member) => member.balance > 0)
    .map((member) => ({ ...member, remainingPaise: toPaise(member.balance) }));

  const settlements: Settlement[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amountPaise = Math.min(debtor.remainingPaise, creditor.remainingPaise);
    const amount = fromPaise(amountPaise);

    if (amountPaise > 0) {
      settlements.push({
        fromMemberId: debtor.memberId,
        toMemberId: creditor.memberId,
        fromMemberName: debtor.memberName,
        toMemberName: creditor.memberName,
        amount,
      });
    }

    debtor.remainingPaise -= amountPaise;
    creditor.remainingPaise -= amountPaise;

    if (debtor.remainingPaise <= 0) {
      debtorIndex += 1;
    }
    if (creditor.remainingPaise <= 0) {
      creditorIndex += 1;
    }
  }

  return settlements;
}
