import { describe, expect, it } from "vitest";

import { calculateMemberBalances, splitExpense, splitExpenseAmounts } from "../lib/calculations/splitExpense";

describe("splitExpense", () => {
  it("returns correct equal split for valid inputs", () => {
    expect(splitExpense(1500, 3)).toBe(500);
  });

  it("handles different group sizes", () => {
    expect(splitExpense(1000, 4)).toBe(250);
    expect(splitExpense(999, 3)).toBe(333);
    expect(splitExpense(1000, 6)).toBe(166.67);
  });

  it("throws for invalid inputs", () => {
    expect(() => splitExpense(0, 3)).toThrow("totalAmount must be a positive number");
    expect(() => splitExpense(-500, 3)).toThrow("totalAmount must be a positive number");
    expect(() => splitExpense(Number.NaN, 3)).toThrow("totalAmount must be a positive number");
    expect(() => splitExpense(500, 0)).toThrow("memberCount must be a positive integer");
    expect(() => splitExpense(500, -1)).toThrow("memberCount must be a positive integer");
    expect(() => splitExpense(500, 2.5)).toThrow("memberCount must be a positive integer");
  });
});

describe("splitExpenseAmounts", () => {
  it("returns per-member amounts that sum exactly to total amount", () => {
    const splits = splitExpenseAmounts(2999.99, 5);
    const total = Number(splits.reduce((sum, value) => sum + value, 0).toFixed(2));
    expect(total).toBe(2999.99);
  });

  it("distributes remainder paise fairly", () => {
    expect(splitExpenseAmounts(10, 3)).toEqual([3.34, 3.33, 3.33]);
  });
});

describe("calculateMemberBalances", () => {
  it("includes implicit payer share when payer is excluded from split rows", () => {
    const members = [
      { id: "m1", trip_id: "t1", name: "Tejas", email: null, created_at: "2026-01-01" },
      { id: "m2", trip_id: "t1", name: "Sruthi", email: null, created_at: "2026-01-01" },
      { id: "m3", trip_id: "t1", name: "Mithra", email: null, created_at: "2026-01-01" },
      { id: "m4", trip_id: "t1", name: "Harsha", email: null, created_at: "2026-01-01" },
    ];
    const expenses = [
      {
        id: "e1",
        trip_id: "t1",
        paid_by_member_id: "m1",
        description: "Transport",
        total_amount: 24000,
        expense_date: "2026-03-01",
        created_at: "2026-03-01",
      },
    ];
    const splits = [
      { id: "s1", expense_id: "e1", member_id: "m2", owed_amount: 6000, created_at: "2026-03-01" },
      { id: "s2", expense_id: "e1", member_id: "m3", owed_amount: 6000, created_at: "2026-03-01" },
      { id: "s3", expense_id: "e1", member_id: "m4", owed_amount: 6000, created_at: "2026-03-01" },
    ];

    const balances = calculateMemberBalances(members, expenses, splits);
    const tejas = balances.find((member) => member.memberId === "m1");
    expect(tejas?.totalPaid).toBe(24000);
    expect(tejas?.totalOwed).toBe(6000);
    expect(tejas?.balance).toBe(18000);
  });
});
