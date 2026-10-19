"use client";
import type { NormalizedMembers } from "@/src/types/policy";

export default function MembersBreakdown({ members }: { members: NormalizedMembers }) {
  const categories = [
    { label: "Primary Employees",   value: members.employee },
    { label: "Dependent Spouses",   value: members.dependentSpouse },
    { label: "Dependent Children",  value: members.dependentChild },
    { label: "Dependent Parents",   value: members.dependentParent },
    { label: "Other Dependents",    value: members.other },
  ].filter((r) => r.value > 0);

  return (
    <div className="section-card break-inside-avoid print:break-inside-avoid flex flex-col justify-between">
      <div>
        <div className="section-header">
          <h2 className="section-title">
            <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
            Covered Members Census
          </h2>
          <span className="badge-neutral font-mono font-bold text-[11px]">
            {members.total.toLocaleString()} Total Insured
          </span>
        </div>

        {/* Census Metrics */}
        <div className="p-5 space-y-3">
          <div className="rounded-lg bg-slate-900 text-white p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Enrolled Lives</p>
              <p className="text-2xl font-bold tracking-tight tabular-nums mt-0.5">{members.total.toLocaleString()}</p>
            </div>
            <div className="text-right text-xs text-slate-300">
              <span>Includes employees & dependants</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {categories.map(({ label, value }) => (
              <div key={label} className="border border-slate-200/90 rounded-lg p-3 bg-slate-50/50">
                <p className="text-lg font-bold text-slate-900 tabular-nums">{value.toLocaleString()}</p>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
