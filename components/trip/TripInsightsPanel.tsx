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
      <section className="rounded-[28px] border border-cyan-500/20 bg-[#020b16]/95 p-5 shadow-[0_30px_80px_rgba(1,6,17,0.55)] backdrop-blur">
        <h2 className="text-lg font-semibold text-white">Overall Summary</h2>
        <p className="mt-1 text-xs text-slate-300">Paid | Share | Net</p>
        <div className="mt-4 space-y-3">
          {memberBalances.length === 0 && (
            <p className="text-sm text-slate-300">No members yet.</p>
          )}
          {memberBalances.map((memberBalance) => (
            <div
              key={memberBalance.memberId}
              className="rounded-2xl border border-slate-800 bg-slate-900/75 p-3"
            >
              <p className="text-sm font-medium text-white">{memberBalance.memberName}</p>
              <p className="mt-2 text-xs leading-6 text-slate-300">
                Paid Rs {memberBalance.totalPaid.toFixed(2)} | Share Rs{" "}
                {memberBalance.totalOwed.toFixed(2)} | Net Rs {memberBalance.balance.toFixed(2)}
              </p>
              <p className="mt-1 text-xs font-medium text-cyan-300">
                {getNetText(memberBalance.balance)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-emerald-500/20 bg-[#020b16]/95 p-5 shadow-[0_30px_80px_rgba(1,6,17,0.55)] backdrop-blur">
        <h2 className="text-lg font-semibold text-white">Overall Settlements</h2>
        <div className="mt-4 space-y-2">
          {settlements.length === 0 && (
            <p className="text-sm text-slate-300">No outstanding balances.</p>
          )}
          {settlements.map((settlement, index) => (
            <p
              key={`${settlement.fromMemberId}-${settlement.toMemberId}-${index}`}
              className="rounded-xl border border-slate-800 bg-slate-900/75 px-3 py-2 text-sm text-slate-200"
            >
              {memberLabelById.get(settlement.fromMemberId) ?? settlement.fromMemberName} owes{" "}
              {memberLabelById.get(settlement.toMemberId) ?? settlement.toMemberName} Rs{" "}
              {settlement.amount.toFixed(2)}
            </p>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-amber-500/20 bg-[#020b16]/95 p-5 shadow-[0_30px_80px_rgba(1,6,17,0.55)] backdrop-blur">
        <h2 className="text-lg font-semibold text-white">Day-wise</h2>
        <div className="mt-4 space-y-3">
          {dayWiseSummaries.length === 0 && (
            <p className="text-sm text-slate-300">No expenses added yet.</p>
          )}
          {dayWiseSummaries.map((summary) => (
            <div
              key={summary.date}
              className="rounded-2xl border border-slate-800 bg-slate-900/75 p-3"
            >
              <p className="text-sm font-semibold text-white">{summary.date}</p>
              <div className="mt-2 space-y-2">
                {summary.memberBalances.map((memberBalance) => (
                  <p
                    key={`${summary.date}-${memberBalance.memberId}`}
                    className="text-xs leading-5 text-slate-300"
                  >
                    {memberBalance.memberName}: Net Rs {memberBalance.balance.toFixed(2)}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
