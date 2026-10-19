"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { parsePolicy } from "@/src/lib/schema";

const SAMPLES = [
  {
    id: "sample-corporate-health",
    title: "Corporate Health Plus",
    desc: "THB · Corporate · 4 Benefit Types (Inpatient, Outpatient, Dental, Maternity)",
    file: "sample-corporate-health.json",
  },
  {
    id: "sample-family-custom",
    title: "Family Plan (VND)",
    desc: "VND · Family · Vision & Wellness · Tiered Copay · No Waiting Period",
    file: "sample-family-custom.json",
  },
  {
    id: "sample-sme-global",
    title: "SME Global Executive",
    desc: "USD · Corporate · Lifetime Limits · Blanket Coverage · 10 Countries",
    file: "sample-sme-global.json",
  },
  {
    id: "sample-individual-travel",
    title: "Individual Travel Shield",
    desc: "USD · Individual · No Copay · Worldwide Emergency Coverage",
    file: "sample-individual-travel.json",
  },
];

export default function HomePage() {
  const [json, setJson]         = useState("");
  const [errors, setErrors]     = useState<string[]>([]);
  const [loading, setLoading]   = useState(false);
  const [dragging, setDragging] = useState(false);
  const [activeSample, setActiveSample] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router  = useRouter();

  // ── Load sample ────────────────────────────────────────────────────────────
  const loadSample = async (file: string, id: string) => {
    setLoading(true);
    setActiveSample(id);
    try {
      const res  = await fetch(`/samples/${file}`);
      const text = await res.text();
      setJson(text);
      setErrors([]);
    } catch {
      setErrors(["Failed to load sample policy file."]);
    } finally {
      setLoading(false);
    }
  };

  // ── File upload ────────────────────────────────────────────────────────────
  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setJson(e.target?.result as string ?? "");
      setErrors([]);
      setActiveSample(null);
    };
    reader.readAsText(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  // ── Generate ───────────────────────────────────────────────────────────────
  const generate = () => {
    if (!json.trim()) {
      setErrors(["Please enter or upload policy JSON data."]);
      return;
    }
    const result = parsePolicy(json);
    if (!result.success && result.errors) {
      setErrors(result.errors.map((e: { field: string; message: string }) => `${e.field}: ${e.message}`));
      return;
    }
    sessionStorage.setItem("policy_json", json);
    router.push("/summary");
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight">
            PS
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
              Policy Summary Generator
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Enterprise Benefits & Coverage Schedule Processor
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          JSON Engine Ready
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Card Title Banner */}
          <div className="border-b border-slate-200 px-6 py-4 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Import Policy Document
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select an automated sample policy or paste custom JSON schema data.
              </p>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Schema: ISO 4217 & RFC 8259 compliant
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Sample Selector Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Preset Test Policies
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SAMPLES.map((s) => {
                  const isSelected = activeSample === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => loadSample(s.file, s.id)}
                      disabled={loading}
                      type="button"
                      className={[
                        "text-left p-3 rounded-lg border transition-all text-xs",
                        isSelected
                          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50/80",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-xs">{s.title}</span>
                        {isSelected && (
                          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                            Loaded
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] mt-1 ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                        {s.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drag & Drop File Area */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={[
                "border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors",
                dragging
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-300 hover:border-slate-400 bg-slate-50/40",
              ].join(" ")}
            >
              <div className="flex flex-col items-center justify-center gap-1.5">
                <svg className="w-6 h-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                <p className="text-xs text-slate-700 font-medium">
                  Upload file or drag and drop <code className="bg-slate-200/70 text-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">.json</code>
                </p>
                <p className="text-[11px] text-slate-500">
                  Standard underwriting benefit schema accepted
                </p>
              </div>
              <input ref={fileRef} type="file" accept=".json,application/json"
                     className="hidden" onChange={onFileChange} />
            </div>

            {/* Textarea Code Box */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Raw Policy JSON Content
                </label>
                {json && (
                  <span className="text-[11px] text-slate-500 font-mono">
                    {json.length.toLocaleString()} characters
                  </span>
                )}
              </div>
              <textarea
                value={json}
                onChange={(e) => { setJson(e.target.value); setErrors([]); setActiveSample(null); }}
                placeholder='Paste raw JSON here: { "policy_number": "POL-...", "policyholder": { ... }, "plan": { ... }, ... }'
                rows={10}
                className="w-full rounded-lg border border-slate-300 bg-slate-50/50 p-3.5
                           font-mono text-xs text-slate-800 leading-relaxed
                           focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white
                           resize-y placeholder:text-slate-400"
              />
            </div>

            {/* Schema Validation Feedback */}
            {errors.length > 0 && (
              <div className="rounded-lg border border-rose-200 bg-rose-50/70 p-4 space-y-1.5">
                <p className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-rose-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Schema Validation Errors ({errors.length})
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-xs text-rose-800 font-mono">
                  {errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setJson(""); setErrors([]); setActiveSample(null); }}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                Clear input
              </button>

              <button
                onClick={generate}
                disabled={loading}
                className="rounded-lg bg-slate-900 px-6 py-2.5 font-bold text-white text-xs sm:text-sm
                           hover:bg-slate-800 active:bg-slate-950 transition-colors shadow-sm
                           disabled:opacity-50 flex items-center gap-2"
              >
                <span>Process & Render Summary</span>
                <svg className="w-4 h-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-4 border-t border-slate-200 bg-white">
        Policy Summary Generator · Automated Policy Schedule Processing
      </footer>
    </div>
  );
}
