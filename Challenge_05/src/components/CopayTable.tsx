"use client";
import type { NormalizedCopayEntry } from "@/src/types/policy";
import { formatCurrency, formatPercent } from "@/src/lib/format";

export default function CopayTable({
  copay,
  currency,
}: {
  copay: NormalizedCopayEntry[];
  currency: string;
}) {
  return (
    <div className="section-card break-inside-avoid print:break-inside-avoid">
      <div className="section-header">
        <h2 className="section-title">
          <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
          Cost Sharing & Copay Schedule
        </h2>
        <span className="badge-neutral text-[11px] font-mono">
          {copay.length} Rules
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="data-th">Benefit Category</th>
              <th className="data-th text-right">Insured Share</th>
              <th className="data-th text-right">Out-of-Pocket Cap</th>
            </tr>
          </thead>
          <tbody>
            {copay.map((c) => (
              <tr key={c.benefitType} className="break-inside-avoid print:break-inside-avoid hover:bg-slate-50/50 transition-colors">
                <td className="data-td font-medium text-slate-900">
                  {c.label}
                </td>
                <td className="data-td text-right">
                  {c.flatFee != null ? (
                    <span className="font-semibold text-slate-900">{formatCurrency(c.flatFee, currency)} fixed fee</span>
                  ) : (
                    <span className={`font-semibold ${c.percentage === 0 ? "text-emerald-700" : "text-slate-900"}`}>
                      {c.percentage === 0 ? "0% (Full Coverage)" : formatPercent(c.percentage)}
                    </span>
                  )}
                </td>
                <td className="data-td text-right text-slate-600 text-xs sm:text-sm">
                  {c.maxPerVisit != null
                    ? `${formatCurrency(c.maxPerVisit, currency)} / visit`
                    : c.maxPerYear != null
                    ? `${formatCurrency(c.maxPerYear, currency)} / year`
                    : <span className="text-slate-300 font-mono">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
