"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { parsePolicy } from "@/src/lib/schema";
import { normalizePolicy } from "@/src/lib/normalize";
import PolicySummary from "@/src/components/PolicySummary";
import type { NormalizedPolicy } from "@/src/types/policy";

export default function SummaryPage() {
  const router = useRouter();
  const [policy, setPolicy] = useState<NormalizedPolicy | null>(null);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("policy_json");
    if (!raw) {
      router.replace("/");
      return;
    }
    const parsed = parsePolicy(raw);
    if (!parsed.success || !parsed.data) {
      setError("Invalid policy data. Please go back and fix the errors.");
      return;
    }
    setPolicy(normalizePolicy(parsed.data));
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
        <div className="max-w-md text-center space-y-4">
          <p className="text-4xl">⛔</p>
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="h-8 w-8 rounded-full border-4 border-brand-300 border-t-brand-700 animate-spin" />
          <p className="text-sm">Loading policy…</p>
        </div>
      </div>
    );
  }

  return <PolicySummary policy={policy} />;
}
