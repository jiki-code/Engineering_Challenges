"use client";
import type { NormalizedBenefit } from "@/src/types/policy";
import { formatCurrency, formatDays } from "@/src/lib/format";

// ─── Limit label renderer ─────────────────────────────────────────────────────

function LimitBadge({ type, amount, percentage, qualifier, covered, notes, currency }: {
  type: string; amount?: number; percentage?: number;
  qualifier?: string; covered?: boolean; notes?: string; currency: string;
}) {
  const humanType = type
    .replace(/^limit_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  if (typeof amount === "number") {
    return (
      <div className="flex flex-col items-end">
        <span className="money text-xs sm:text-sm font-semibold">{formatCurrency(amount, currency)}</span>
        <span className="text-[10px] sm:text-xs text-slate-500 font-medium">
          {humanType}{qualifier ? ` (${qualifier})` : ""}
        </span>
      </div>
    );
  }
  if (typeof percentage === "number") {
    return <span className="text-xs sm:text-sm font-semibold text-slate-900">{percentage}% Coverage</span>;
  }
  if (covered) {
    return <span className="badge-success text-[11px]">Covered</span>;
  }
  if (notes) {
    return <span className="text-xs text-slate-500 italic">{notes}</span>;
  }
  return null;
}

// ─── Waiting period tag ───────────────────────────────────────────────────────

function WaitingChip({ days }: { days: number }) {
  return (
    <span className="badge-waiting text-[10px] sm:text-[11px] py-0.5 whitespace-nowrap flex items-center gap-1">
      <svg className="w-3 h-3 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span>{formatDays(days)} waiting period</span>
    </span>
  );
}

// ─── One Benefit Category Card ────────────────────────────────────────────────

function BenefitBlock({ benefit, currency }: { benefit: NormalizedBenefit; currency: string }) {
  const overallLimit = benefit.lifetimeLimit ?? benefit.annualLimit;
  const isLifetime = typeof benefit.lifetimeLimit === "number";

  return (
    <div className="section-card break-inside-avoid print:break-inside-avoid">
      {/* Category header */}
      <div className="section-header py-3 px-4 sm:px-5">
        <div className="flex items-center gap-2.5">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
            {benefit.label}
          </h3>
          {benefit.waitingPeriodDays > 0 && (
            <WaitingChip days={benefit.waitingPeriodDays} />
          )}
        </div>

        {typeof overallLimit === "number" && (
          <div className="text-right shrink-0 ml-3">
            <span className="money text-sm sm:text-base font-bold text-slate-900">
              {formatCurrency(overallLimit, currency)}
            </span>
            <span className="text-[10px] text-slate-500 block uppercase font-medium tracking-tight">
              {isLifetime ? "Lifetime Maximum" : "Annual Maximum"}
            </span>
          </div>
        )}
      </div>

      {/* Sub-benefits table or direct coverage notice */}
      {benefit.subBenefits.length === 0 ? (
        <div className="px-4 sm:px-5 py-3.5 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100">
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Full blanket coverage applies up to the category maximum (no sub-benefit restrictions).
          </p>
          <span className="badge-success text-[11px] shrink-0 self-start sm:self-auto">
            Direct Blanket Coverage
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="data-th">Benefit Item / Service</th>
                <th className="data-th text-right">Applicable Limit & Conditions</th>
              </tr>
            </thead>
            <tbody>
              {benefit.subBenefits.map((sb) => (
                <tr key={sb.name} className="break-inside-avoid print:break-inside-avoid hover:bg-slate-50/50 transition-colors">
                  <td className="data-td font-medium text-slate-800">
                    {sb.name}
                  </td>
                  <td className="data-td text-right">
                    <div className="flex flex-col items-end gap-1">
                      {sb.limits.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">—</span>
                      ) : (
                        sb.limits.map((lim, i) => (
                          <LimitBadge key={i} {...lim} currency={currency} />
                        ))
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BenefitsTable({
  benefits,
  currency,
}: {
  benefits: NormalizedBenefit[];
  currency: string;
}) {
  if (benefits.length === 0) {
    return (
      <div className="section-card p-6 text-center text-slate-500 text-sm">
        No benefit categories configured for this policy.
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          Schedule of Benefits & Coverage Limits
        </h2>
        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
          {benefits.length} categories detailed
        </span>
      </div>

      <div className="space-y-3">
        {benefits.map((b) => (
          <BenefitBlock key={b.type} benefit={b} currency={currency} />
        ))}
      </div>
    </div>
  );
}
