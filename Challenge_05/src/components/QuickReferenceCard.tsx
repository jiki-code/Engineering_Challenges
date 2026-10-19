"use client";

import type { NormalizedPolicy, NormalizedBenefit } from "@/src/types/policy";
import { formatCurrency, formatPercent } from "@/src/lib/format";

// ─── Limit resolution: annual vs lifetime ────────────────────────────────────

interface LimitSummary {
  totalAnnual: number;
  annualCount: number;
  lifetimeItems: Array<{ label: string; amount: number }>;
  highest: { label: string; amount: number; limitType: "Annual" | "Lifetime" } | null;
}

function resolveLimitSummary(benefits: NormalizedBenefit[]): LimitSummary {
  let totalAnnual = 0;
  let annualCount = 0;
  const lifetimeItems: LimitSummary["lifetimeItems"] = [];
  let highest: LimitSummary["highest"] = null;

  for (const b of benefits) {
    if (typeof b.lifetimeLimit === "number") {
      lifetimeItems.push({ label: b.label, amount: b.lifetimeLimit });
      if (!highest || b.lifetimeLimit > highest.amount) {
        highest = { label: b.label, amount: b.lifetimeLimit, limitType: "Lifetime" };
      }
    } else if (typeof b.annualLimit === "number") {
      totalAnnual += b.annualLimit;
      annualCount++;
      if (!highest || b.annualLimit > highest.amount) {
        highest = { label: b.label, amount: b.annualLimit, limitType: "Annual" };
      }
    }
  }

  return { totalAnnual, annualCount, lifetimeItems, highest };
}

function resolveCopayLabel(policy: NormalizedPolicy): string {
  if (!policy.hasCopay) return "None (100% Covered)";
  const pcts = policy.copay.map((c) => c.percentage);
  const min = Math.min(...pcts);
  const max = Math.max(...pcts);
  if (min === max) return `${formatPercent(min)} Co-pay`;
  return `${formatPercent(min)} – ${formatPercent(max)} Co-pay`;
}

// ─── Metric Card (KPI Style) ──────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  tag,
  highlight,
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
  tag?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-all break-inside-avoid print:break-inside-avoid",
        highlight
          ? "bg-slate-900 text-white shadow-sm border border-slate-900 print:bg-slate-900 print:text-white"
          : "bg-white border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] print:border-slate-300",
      ].join(" ")}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className={`text-[11px] font-bold uppercase tracking-wider ${highlight ? "text-slate-300" : "text-slate-500"}`}>
            {label}
          </p>
          {tag && (
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${highlight ? "bg-slate-800 text-slate-300 border border-slate-700" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>
              {tag}
            </span>
          )}
        </div>
        <p className={`text-xl sm:text-2xl font-bold tracking-tight tabular-nums ${highlight ? "text-white" : "text-slate-900"}`}>
          {value}
        </p>
      </div>

      {sub && (
        <div className={`text-xs mt-3 pt-2.5 border-t ${highlight ? "border-slate-800 text-slate-300" : "border-slate-100 text-slate-500"}`}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function QuickReferenceCard({ policy }: { policy: NormalizedPolicy }) {
  const { totalAnnual, annualCount, lifetimeItems, highest } = resolveLimitSummary(policy.benefits);
  const copayLabel = resolveCopayLabel(policy);

  return (
    <section aria-label="Executive Quick Reference">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          Quick Reference Overview
        </h2>
      </div>

      {/* Metric Cards Grid */}
      <div className="quick-ref-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* ① Primary Limit */}
        <MetricCard
          label={annualCount > 0 ? "Total Annual Limit" : "Primary Lifetime Cap"}
          value={
            annualCount > 0
              ? formatCurrency(totalAnnual, policy.currency)
              : highest
              ? formatCurrency(highest.amount, policy.currency)
              : "No Limit Cap"
          }
          sub={
            highest ? (
              <span>
                Highest single: <strong>{highest.label}</strong> ({formatCurrency(highest.amount, policy.currency)})
              </span>
            ) : undefined
          }
          tag={annualCount > 0 ? `${annualCount} Benefits` : "Lifetime"}
          highlight
        />

        {/* ② Copayment */}
        <MetricCard
          label="Cost Sharing / Copay"
          value={copayLabel}
          sub={
            policy.hasCopay ? (
              <span className="truncate block">
                {policy.copay.map((c) => `${c.label}: ${formatPercent(c.percentage)}`).join(" · ")}
              </span>
            ) : (
              "100% direct insurance settlement"
            )
          }
          tag={policy.hasCopay ? `${policy.copay.length} Rules` : "Zero Copay"}
        />

        {/* ③ Benefit categories */}
        <MetricCard
          label="Benefit Categories"
          value={`${policy.benefits.length} Categories`}
          sub={
            <span className="truncate block">
              {policy.benefits.map((b) => b.label).join(", ")}
            </span>
          }
          tag="Covered"
        />

        {/* ④ Term */}
        <MetricCard
          label="Coverage Validity"
          value={policy.isExpired ? "Expired" : "Active"}
          sub={
            policy.isExpired ? (
              <span className="text-rose-600 font-semibold">Ended on {policy.expiryDate}</span>
            ) : (
              <span>Valid through {policy.expiryDate} ({policy.daysUntilExpiry}d left)</span>
            )
          }
          tag={policy.isExpired ? "Expired" : "Current"}
        />
      </div>

      {/* Key Disclosures Row (Clean tags for Waiting Periods, Exclusions, and Lifetime Limits) */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        {policy.waitingPeriods.length > 0 && (
          <div className="badge-waiting py-1 px-2.5 shadow-none text-xs flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-amber-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>
              <strong>Waiting Periods:</strong> {policy.waitingPeriods.map((w) => `${w.label} (${w.days}d)`).join(", ")}
            </span>
          </div>
        )}

        {policy.exclusions.length > 0 && (
          <div className="badge-exclusion py-1 px-2.5 shadow-none text-xs flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-rose-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
            </svg>
            <span>
              <strong>{policy.exclusions.length} Exclusions</strong> apply to this policy
            </span>
          </div>
        )}

        {lifetimeItems.length > 0 && (
          <div className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold bg-purple-50 text-purple-900 border border-purple-200">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />
            <span>
              <strong>Lifetime limits:</strong> {lifetimeItems.map((item) => `${item.label} (${formatCurrency(item.amount, policy.currency)})`).join(", ")}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
