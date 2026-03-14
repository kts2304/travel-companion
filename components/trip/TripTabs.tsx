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
    <section className="rounded-[28px] border border-slate-700/90 bg-[#020b16]/95 shadow-[0_30px_80px_rgba(1,6,17,0.55)] backdrop-blur">
      <div className="border-b border-slate-800 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
          Trip Container
        </p>
      </div>

      <div className="grid min-h-[720px] lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="border-b border-slate-800 p-4 lg:border-r lg:border-b-0">
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  activeTab === tab.key
                    ? "bg-cyan-500/15 text-cyan-200 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.25)]"
                    : "bg-slate-900/70 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-xs text-slate-500">
                  {tab.key === "members" ? members.length : tab.key === "expenses" ? expenses.length : "new"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
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
      </div>
    </section>
  );
}
