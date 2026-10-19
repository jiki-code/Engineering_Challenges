"use client";

import { useRouter } from "next/navigation";
import type { NormalizedPolicy } from "@/src/types/policy";
import SummaryHeader     from "@/src/components/SummaryHeader";
import ActionToolbar     from "@/src/components/ActionToolbar";
import QuickReferenceCard from "@/src/components/QuickReferenceCard";
import PolicyOverview    from "@/src/components/PolicyOverview";
import MembersBreakdown  from "@/src/components/MembersBreakdown";
import BenefitsTable     from "@/src/components/BenefitsTable";
import CopayTable        from "@/src/components/CopayTable";
import WaitingPeriods    from "@/src/components/WaitingPeriods";
import ExclusionsList    from "@/src/components/ExclusionsList";
import NetworkInfo       from "@/src/components/NetworkInfo";

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`break-inside-avoid print:break-inside-avoid ${className ?? ""}`}>
      {children}
    </div>
  );
}

// ─── Main layout ─────────────────────────────────────────────────────────────

export default function PolicySummary({ policy }: { policy: NormalizedPolicy }) {
  const router = useRouter();
  const handleNew = () => router.push("/");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* ── Sticky header + toolbar (hidden in print) ─────────── */}
      <SummaryHeader policy={policy} />
      <ActionToolbar policyNumber={policy.policyNumber} onNew={handleNew} />

      {/* ── Content ───────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-3.5 sm:px-6 py-6 sm:py-8 space-y-6 print:px-0 print:py-2 print:space-y-3">

        {/* 1. Quick Reference Card — always first, most prominent */}
        <Section>
          <QuickReferenceCard policy={policy} />
        </Section>

        {/* 2. Policy overview + Members (side by side on wide screens, stacked on mobile) */}
        <Section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <PolicyOverview policy={policy} />
            {policy.hasMembers && <MembersBreakdown members={policy.members!} />}
          </div>
        </Section>

        {/* 3. Benefits table — detailed schedule */}
        <div className="space-y-4">
          <BenefitsTable
            benefits={policy.benefits}
            currency={policy.currency}
          />
        </div>

        {/* 4. Copay + Waiting periods (side by side when both present) */}
        <Section>
          <div className={[
            "grid gap-4 sm:gap-6",
            policy.hasCopay && policy.waitingPeriods.length > 0
              ? "grid-cols-1 lg:grid-cols-2"
              : "grid-cols-1",
          ].join(" ")}>
            {policy.hasCopay && (
              <CopayTable copay={policy.copay} currency={policy.currency} />
            )}
            {policy.waitingPeriods.length > 0 && (
              <WaitingPeriods periods={policy.waitingPeriods} />
            )}
          </div>
        </Section>

        {/* 5. Exclusions */}
        <Section>
          <ExclusionsList exclusions={policy.exclusions} />
        </Section>

        {/* 6. Network */}
        {policy.hasNetwork && (
          <Section>
            <NetworkInfo network={policy.network!} />
          </Section>
        )}

        {/* Print document footer */}
        <footer className="hidden print:block text-center text-[10px] text-slate-500 border-t border-slate-300 pt-3 mt-6">
          <div className="flex justify-between items-center text-slate-500 font-mono text-[9px]">
            <span>Policy: {policy.policyNumber}</span>
            <span>PolicySummary Executive Report</span>
            <span>Generated on {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
