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
    <section className="theme-shell overflow-hidden rounded-[34px] border shadow-[0_24px_40px_rgba(118,60,145,0.12)] backdrop-blur">
      <div className="border-b border-fuchsia-900/8 px-5 py-4">
        <p className="theme-muted text-xs font-semibold uppercase tracking-[0.24em]">
          Trip Container
        </p>
      </div>

      <div className="grid min-h-[720px] lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="theme-tab-rail border-b border-fuchsia-900/8 p-4 lg:border-r lg:border-b-0">
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex w-full items-center justify-between rounded-[22px] px-4 py-3.5 text-left text-sm font-semibold transition ${
                  activeTab === tab.key
                    ? "theme-tab-active shadow-[0_18px_34px_rgba(39,4,58,0.16)]"
                    : "theme-tab-idle hover:bg-white/12 hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`rounded-full px-2 py-1 text-[11px] ${
                  activeTab === tab.key ? "bg-white/16 text-current" : "bg-white/10 text-current/80"
                }`}>
                  {tab.key === "members" ? members.length : tab.key === "expenses" ? expenses.length : "new"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="theme-card relative overflow-hidden p-5">
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
