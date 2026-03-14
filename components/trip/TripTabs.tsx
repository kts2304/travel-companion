"use client";

import { useState } from "react";

import { ExpensesTab } from "@/components/trip/ExpensesTab";
import { MembersTab } from "@/components/trip/MembersTab";
import type { Expense, ExpenseSplit } from "@/types/expense";
import type { Member } from "@/types/member";

type TabKey = "members" | "expenses" | "bookings";

interface TripTabsProps {
  tripId: string;
  members: Member[];
  expenses: Expense[];
  expenseSplits: ExpenseSplit[];
  bookingsContent: React.ReactNode;
}

const tabs: { key: TabKey; label: string }[] = [
  { key: "members", label: "Members" },
  { key: "expenses", label: "Expenses" },
  { key: "bookings", label: "Bookings" },
];

export function TripTabs({
  tripId,
  members,
  expenses,
  expenseSplits,
  bookingsContent,
}: TripTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("members");

  return (
    <section className="mt-8 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl">
      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.key
                ? "bg-slate-900 text-white shadow-md"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === "members" && <MembersTab tripId={tripId} members={members} />}
        {activeTab === "expenses" && (
          <ExpensesTab
            tripId={tripId}
            members={members}
            expenses={expenses}
            expenseSplits={expenseSplits}
          />
        )}
        {activeTab === "bookings" && bookingsContent}
      </div>
    </section>
  );
}
