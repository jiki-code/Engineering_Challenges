"use client";

export default function ExclusionsList({ exclusions }: { exclusions: string[] }) {
  return (
    <div className="section-card border-rose-200/90 break-inside-avoid print:break-inside-avoid">
      <div className="section-header bg-rose-50/40 border-rose-200/70">
        <h2 className="section-title text-rose-950 font-bold">
          <svg className="w-4 h-4 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
          </svg>
          General Policy Exclusions & Limitations
        </h2>
        <span className="badge-exclusion ml-auto font-mono text-[11px]">
          {exclusions.length} Items
        </span>
      </div>

      <div className="p-4 sm:p-5 space-y-3">
        <p className="text-xs text-rose-900/80">
          The following medical conditions, treatments, and events are strictly excluded from coverage under the terms of this contract:
        </p>

        {exclusions.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">
            No standard exclusions recorded on this policy certificate.
          </p>
        ) : (
          <div className="space-y-2">
            {exclusions.map((excl, i) => (
              <div key={i} className="alert-exclusion">
                <svg className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div className="text-xs sm:text-sm text-rose-950 font-medium leading-relaxed">
                  <strong className="text-rose-900 mr-1.5">{i + 1}.</strong>
                  {excl}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
