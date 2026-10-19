"use client";

type Props = {
  policyNumber: string;
  onNew: () => void;
};

export default function ActionToolbar({ policyNumber, onNew }: Props) {
  const handlePrint = () => window.print();

  return (
    <div className="no-print sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-2.5">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-medium text-slate-700">Policy Summary View</span>
          <span className="text-slate-300">•</span>
          <span className="font-mono text-slate-500">{policyNumber}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onNew}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300
                       bg-white px-3 py-1.5 text-xs font-semibold text-slate-700
                       hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Change Policy
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-md
                       bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white
                       hover:bg-slate-800 transition-colors shadow-sm"
          >
            <svg className="w-3.5 h-3.5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
              <path d="M6 14h12v8H6z" />
            </svg>
            Print / Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}
