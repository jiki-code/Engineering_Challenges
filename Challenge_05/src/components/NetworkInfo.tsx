"use client";

type NetworkProps = {
  type: string;
  hospitalCount?: number;
  clinicCount?: number;
  countries: string[];
  notes?: string;
};

export default function NetworkInfo({ network }: { network: NetworkProps }) {
  return (
    <div className="section-card break-inside-avoid print:break-inside-avoid">
      <div className="section-header">
        <h2 className="section-title">
          <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
          </svg>
          Medical Provider Network & Territorial Scope
        </h2>
        <span className="badge-neutral text-[11px] font-mono">
          {network.type}
        </span>
      </div>

      <div className="section-body space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="rounded-lg bg-slate-50/70 border border-slate-200/80 p-3.5">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Network Structure</p>
            <p className="font-semibold text-slate-900 text-xs sm:text-sm">{network.type}</p>
          </div>

          {(network.hospitalCount != null || network.clinicCount != null) && (
            <div className="rounded-lg bg-slate-50/70 border border-slate-200/80 p-3.5">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Accredited Facilities</p>
              <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                {[
                  network.hospitalCount != null && `${network.hospitalCount.toLocaleString()} Hospitals`,
                  network.clinicCount    != null && `${network.clinicCount.toLocaleString()} Clinics`,
                ].filter(Boolean).join(" · ")}
              </p>
            </div>
          )}

          {network.countries.length > 0 && (
            <div className="rounded-lg bg-slate-50/70 border border-slate-200/80 p-3.5 sm:col-span-2">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                Territorial Scope of Coverage ({network.countries.length} {network.countries.length === 1 ? "Jurisdiction" : "Jurisdictions"})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {network.countries.map((c) => (
                  <span key={c} className="badge-neutral text-[11px] font-medium">{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {network.notes && (
          <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200/90 rounded-lg p-3.5 flex items-start gap-2">
            <svg className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span className="leading-relaxed">{network.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
}
