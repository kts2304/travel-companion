import type { Settlement } from "@/types/expense";
import type { MemberBalance } from "@/types/member";

interface DayWiseSummary {
  date: string;
  memberBalances: MemberBalance[];
  settlements: Settlement[];
}

interface TripInsightsPanelProps {
  memberBalances: MemberBalance[];
  settlements: Settlement[];
  dayWiseSummaries: DayWiseSummary[];
  memberLabelById: Map<string, string>;
}

function getNetText(balance: number): string {
  if (balance > 0) {
    return `Gets back Rs ${balance.toFixed(2)}`;
  }
  if (balance < 0) {
    return `Owes Rs ${Math.abs(balance).toFixed(2)}`;
  }
  return "Settled up";
}

export function TripInsightsPanel({
  memberBalances,
  settlements,
  dayWiseSummaries,
  memberLabelById,
}: TripInsightsPanelProps) {
  return (
    <aside className="space-y-4">
      <section className="travel-card-hover theme-strong-surface relative overflow-hidden rounded-[32px] border p-5 shadow-[0_24px_40px_rgba(118,60,145,0.14)]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden text-white/10">
          <div className="absolute -right-6 top-2 h-24 w-24 rounded-full bg-current blur-3xl" />
          <svg viewBox="0 0 240 120" className="absolute right-4 top-8 h-24 w-44" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 88h180" />
            <path d="M36 88V56h24v32M84 88V40h24v48M132 88V24h24v64" />
          </svg>
        </div>
        <div className="relative z-10">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/12 bg-white/8 text-white/90">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 18h16M7 18V11h3v7M11 18V7h3v11M15 18V4h3v14" />
            </svg>
          </span>
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-white">Overall Summary</h2>
        </div>
        <p className="mt-1 text-xs text-white/70">Paid | Share | Net</p>
        <div className="mt-4 space-y-3">
          {memberBalances.length === 0 && (
            <p className="text-sm text-slate-300">No members yet.</p>
          )}
          {memberBalances.map((memberBalance) => (
            <div
              key={memberBalance.memberId}
              className="travel-card-hover rounded-[26px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,239,250,0.9))] p-4"
            >
              <p className="text-sm font-medium text-[#35194f]">{memberBalance.memberName}</p>
              <p className="mt-2 text-xs leading-6 text-[#6c567f]">
                Paid Rs {memberBalance.totalPaid.toFixed(2)} | Share Rs{" "}
                {memberBalance.totalOwed.toFixed(2)} | Net Rs {memberBalance.balance.toFixed(2)}
              </p>
              <p className="mt-1 text-xs font-medium text-fuchsia-700">
                {getNetText(memberBalance.balance)}
              </p>
            </div>
          ))}
        </div>
        </div>
      </section>

      <section className="travel-card-hover theme-card relative overflow-hidden rounded-[32px] border p-5 shadow-[0_24px_40px_rgba(118,60,145,0.12)]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden text-[color:var(--accent-text-soft)]/10">
          <svg viewBox="0 0 220 120" className="absolute right-2 top-4 h-24 w-40" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M28 80c18-18 34-24 52-24 20 0 34 8 50 22 18 16 34 24 58 24" />
            <circle cx="28" cy="80" r="6" />
            <circle cx="130" cy="78" r="6" />
          </svg>
        </div>
        <div className="relative z-10">
        <div className="flex items-center gap-3">
          <span className="theme-button-secondary inline-flex h-10 w-10 items-center justify-center rounded-2xl border">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 12h16M14 6l6 6-6 6" />
            </svg>
          </span>
          <h2 className="theme-heading text-lg font-semibold tracking-[-0.02em]">Overall Settlements</h2>
        </div>
        <div className="mt-4 space-y-2">
          {settlements.length === 0 && (
            <p className="theme-muted text-sm">No outstanding balances.</p>
          )}
          {settlements.map((settlement, index) => (
            <p
              key={`${settlement.fromMemberId}-${settlement.toMemberId}-${index}`}
              className="theme-button-secondary rounded-2xl border px-3 py-2.5 text-sm"
            >
              {memberLabelById.get(settlement.fromMemberId) ?? settlement.fromMemberName} owes{" "}
              {memberLabelById.get(settlement.toMemberId) ?? settlement.toMemberName} Rs{" "}
              {settlement.amount.toFixed(2)}
            </p>
          ))}
        </div>
        </div>
      </section>

      <section className="travel-card-hover theme-card relative overflow-hidden rounded-[32px] border p-5 shadow-[0_24px_40px_rgba(118,60,145,0.12)]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden text-amber-500/8">
          <svg viewBox="0 0 240 140" className="absolute right-0 top-2 h-28 w-48" fill="none" stroke="currentColor" strokeWidth="3">
            <rect x="46" y="26" width="126" height="94" rx="18" />
            <path d="M72 50h74M72 72h100M72 94h58" />
          </svg>
        </div>
        <div className="relative z-10">
        <div className="flex items-center gap-3">
          <span className="theme-button-secondary inline-flex h-10 w-10 items-center justify-center rounded-2xl border">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="4" y="5" width="16" height="15" rx="2" />
              <path d="M8 3v4M16 3v4M4 9h16" />
            </svg>
          </span>
          <h2 className="theme-heading text-lg font-semibold tracking-[-0.02em]">Day-wise</h2>
        </div>
        <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
          {dayWiseSummaries.length === 0 && (
            <p className="theme-muted text-sm">No expenses added yet.</p>
          )}
          {dayWiseSummaries.map((summary) => (
            <div
              key={summary.date}
              className="theme-button-secondary rounded-[26px] border p-4"
            >
              <p className="theme-heading text-sm font-semibold">{summary.date}</p>
              <div className="mt-2 space-y-2">
                {summary.memberBalances.map((memberBalance) => (
                  <p
                    key={`${summary.date}-${memberBalance.memberId}`}
                    className="theme-muted text-xs leading-5"
                  >
                    {memberBalance.memberName}: Net Rs {memberBalance.balance.toFixed(2)}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>
    </aside>
  );
}
