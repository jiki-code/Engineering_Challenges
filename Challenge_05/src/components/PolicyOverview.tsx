"use client";
import type { NormalizedPolicy } from "@/src/types/policy";

export default function PolicyOverview({ policy }: { policy: NormalizedPolicy }) {
  const rows: [string, React.ReactNode][] = [
    ["Policy Number", <span key="p" className="font-mono font-semibold text-slate-900">{policy.policyNumber}</span>],
    ["Policyholder", <span key="h" className="font-semibold text-slate-900">{policy.holderName}</span>],
    ["Holder Classification", <span key="t" className="badge-neutral">{policy.holderType}</span>],
    ...(policy.holderIndustry ? [["Industry / Sector", <span key="i" className="text-slate-700 font-medium">{policy.holderIndustry}</span>] as [string, React.ReactNode]] : []),
    ...(policy.employeeCount   ? [["Staff Census", <span key="e" className="font-semibold text-slate-900">{policy.employeeCount.toLocaleString()} employees</span>] as [string, React.ReactNode]] : []),
    ["Plan Name", <span key="pl" className="font-semibold text-slate-900">{policy.planName}</span>],
    ["Benefit Tier", <span key="tr" className="badge-neutral font-medium">{policy.planTier}</span>],
    ["Effective Date", <span key="ef" className="font-medium text-slate-700">{policy.effectiveDate}</span>],
    ["Expiry Date", <span key="ex" className={`font-medium ${policy.isExpired ? "text-rose-700 font-bold" : "text-slate-700"}`}>{policy.expiryDate}</span>],
    ["Denominated Currency", <span key="c" className="font-mono font-bold text-slate-900">{policy.currency} ({policy.currencySymbol})</span>],
  ];

  return (
    <div className="section-card break-inside-avoid print:break-inside-avoid">
      <div className="section-header">
        <h2 className="section-title">
          <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Policy & Account Overview
        </h2>
      </div>
      <div className="section-body p-0">
        <dl className="divide-y divide-slate-100">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 px-5 py-2.5 text-xs sm:text-sm hover:bg-slate-50/50 transition-colors">
              <dt className="text-slate-500 font-medium shrink-0">{label}</dt>
              <dd className="text-right text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
