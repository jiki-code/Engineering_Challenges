"use client";
import { formatDays } from "@/src/lib/format";

export default function WaitingPeriods({
  periods,
}: {
  periods: Array<{ label: string; days: number }>;
}) {
  if (periods.length === 0) return null;

  return (
    <div className="section-card border-amber-200/90 break-inside-avoid print:break-inside-avoid">
      <div className="section-header bg-amber-50/50 border-amber-200/80">
        <h2 className="section-title text-amber-900 font-bold">
          <svg className="w-4 h-4 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Waiting Period Disclosures
        </h2>
        <span className="badge-waiting ml-auto font-mono text-[11px]">
          {periods.length} {periods.length === 1 ? "Clause" : "Clauses"}
        </span>
      </div>
      <div className="p-4 sm:p-5 space-y-3">
        <p className="text-xs text-amber-900/80">
          Claims for the following benefit categories are subject to the waiting periods listed below from the inception date:
        </p>

        <div className="space-y-2.5">
          {periods.map(({ label, days }) => (
            <div key={label} className="alert-waiting">
              <svg className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-bold text-amber-950 text-xs sm:text-sm">{label}</span>
                  <span className="badge-waiting text-[10px] py-0.5 font-bold">
                    {formatDays(days)} waiting
                  </span>
                </div>
                <p className="text-xs text-amber-900/80 mt-0.5">
                  Treatment incurred within the first {formatDays(days)} of effective date is not eligible for reimbursement.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
