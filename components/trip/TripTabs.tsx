"use client";

import { useState } from "react";

import { ExpensesTab } from "@/components/trip/ExpensesTab";
import { MembersTab } from "@/components/trip/MembersTab";
import { SectionBackdropArt } from "@/components/trip/SectionBackdropArt";
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
    <section className="overflow-hidden rounded-[34px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(251,244,252,0.9))] shadow-[0_24px_40px_rgba(118,60,145,0.12)] backdrop-blur">
      <div className="border-b border-fuchsia-900/8 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-900/70">
          Trip Container
        </p>
      </div>

      <div className="grid min-h-[720px] lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="border-b border-fuchsia-900/8 bg-[linear-gradient(180deg,rgba(72,21,104,0.94),rgba(93,23,118,0.94))] p-4 lg:border-r lg:border-b-0">
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex w-full items-center justify-between rounded-[22px] px-4 py-3.5 text-left text-sm font-semibold transition ${
                  activeTab === tab.key
                    ? "bg-white text-fuchsia-900 shadow-[0_18px_34px_rgba(39,4,58,0.16)]"
                    : "bg-white/10 text-white/80 hover:bg-white/14 hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`rounded-full px-2 py-1 text-[11px] ${
                  activeTab === tab.key ? "bg-fuchsia-100 text-fuchsia-900" : "bg-white/10 text-white/70"
                }`}>
                  {tab.key === "members" ? members.length : tab.key === "expenses" ? expenses.length : "new"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.44),rgba(255,255,255,0.22))] p-5">
          <SectionBackdropArt variant={activeTab} />
          <div className="relative z-10">
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
      </div>
    </section>
  );
}
