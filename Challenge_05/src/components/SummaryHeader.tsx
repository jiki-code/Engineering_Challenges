"use client";

import type { NormalizedPolicy } from "@/src/types/policy";

// ─── Status pill indicator ───────────────────────────────────────────────────

function PolicyStatusBadge({ policy }: { policy: NormalizedPolicy }) {
  if (policy.isExpired) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <span className="h-2 w-2 rounded-full bg-rose-500" />
        Expired on {policy.expiryDate}
      </span>
    );
  }
  if (policy.daysUntilExpiry <= 30) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        Expires in {policy.daysUntilExpiry} days
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      Active Coverage
    </span>
  );
}

// ─── Header Component ─────────────────────────────────────────────────────────

export default function SummaryHeader({ policy }: { policy: NormalizedPolicy }) {
  return (
    <>
      {/* ── Screen Header (Hidden on Print) ─────────────────────────── */}
      <header className="bg-white border-b border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] no-print">
        {/* Top utility bar */}
        <div className="bg-slate-900 text-slate-300 px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white tracking-tight flex items-center gap-1.5">
              <svg className="w-4 h-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              PolicySummary
            </span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400 font-mono text-[11px]">
              {policy.policyNumber}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              Currency: <strong className="text-slate-200">{policy.currency}</strong> ({policy.currencySymbol})
            </span>
          </div>
        </div>

        {/* Identity & Metadata row */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            {/* Left: Policyholder & Plan Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {policy.holderName}
                </h1>
                <PolicyStatusBadge policy={policy} />
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{policy.planName}</span>
                <span className="text-slate-300">•</span>
                <span className="badge-neutral font-medium">{policy.planTier} Tier</span>
                <span className="badge-neutral font-medium">{policy.holderType}</span>
                {policy.holderIndustry && (
                  <span className="badge-neutral text-slate-600">{policy.holderIndustry}</span>
                )}
              </div>
            </div>

            {/* Right: Coverage Period Block */}
            <div className="flex flex-row md:flex-col items-start md:items-end justify-between md:justify-start gap-1 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Coverage Term
              </span>
              <p className="text-xs sm:text-sm font-semibold text-slate-800">
                {policy.effectiveDate} <span className="text-slate-400 font-normal">to</span> {policy.expiryDate}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                {policy.policyNumber}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Official Print Header (Only visible on paper / PDF export) ── */}
      <div className="hidden print:block border-b-2 border-slate-800 pb-3 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 uppercase">
              Insurance Policy Summary & Schedule of Benefits
            </h1>
            <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
              Certificate of Coverage · {policy.planName} ({policy.planTier} Tier)
            </p>
          </div>
          <div className="text-right text-[11px] font-mono">
            <p className="font-bold text-slate-900">REF: {policy.policyNumber}</p>
            <p className="text-slate-500 text-[10px]">
              Issue Date: {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Policyholder</p>
            <p className="font-semibold text-slate-900">{policy.holderName}</p>
            <p className="text-slate-600 text-[11px]">{policy.holderType} {policy.holderIndustry ? `· ${policy.holderIndustry}` : ""}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Term & Currency</p>
            <p className="font-medium text-slate-900">
              {policy.effectiveDate} — {policy.expiryDate}
              {policy.isExpired && <span className="text-rose-700 font-bold ml-1">(EXPIRED)</span>}
            </p>
            <p className="text-slate-600 text-[11px]">Denominated in {policy.currency} ({policy.currencySymbol})</p>
          </div>
        </div>
      </div>
    </>
  );
}
