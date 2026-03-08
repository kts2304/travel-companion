export interface Expense {
  id: string;
  trip_id: string;
  paid_by_member_id: string;
  description: string;
  total_amount: number;
  expense_date: string;
  created_at: string;
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  member_id: string;
  owed_amount: number;
  created_at: string;
}

export interface AddExpenseInput {
  tripId: string;
  paidByMemberId: string;
  description: string;
  totalAmount: number;
  expenseDate: string;
  splitMemberIds: string[];
}

export interface UpdateExpenseInput {
  paidByMemberId: string;
  description: string;
  totalAmount: number;
  expenseDate: string;
  splitMemberIds: string[];
}

export interface Settlement {
  fromMemberId: string;
  toMemberId: string;
  fromMemberName: string;
  toMemberName: string;
  amount: number;
}
