import fs from "fs";
import path from "path";
import { parsePolicy } from "./lib/schema";
import { normalizePolicy } from "./lib/normalize";
import type { NormalizedCopayEntry, QuickRefStat } from "./types/policy";

const samples = [
  "data/sample-corporate-health.json",
  "data/sample-family-custom.json",
  "data/sample-sme-global.json",
  "data/sample-individual-travel.json",
];

let allPassed = true;

for (const sample of samples) {
  const filePath = path.resolve(sample);
  const rawText = fs.readFileSync(filePath, "utf-8");
  const parseResult = parsePolicy(rawText);

  if (!parseResult.success || !parseResult.data) {
    console.error(`❌ Validation failed for ${sample}:`, parseResult.errors);
    allPassed = false;
    continue;
  }

  const normalized = normalizePolicy(parseResult.data);
  console.log(`\n========================================`);
  console.log(`✓ Sample: ${sample}`);
  console.log(`  Policy Number:   ${normalized.policyNumber}`);
  console.log(`  Policyholder:    ${normalized.holderName} (${normalized.holderType})`);
  console.log(`  Industry:        ${normalized.holderIndustry ?? "[Omitted / N/A]"}`);
  console.log(`  Plan:            ${normalized.planName} (${normalized.planTier})`);
  console.log(`  Currency:        ${normalized.currency} (${normalized.currencySymbol})`);
  console.log(`  Waiting Periods: ${normalized.waitingPeriods.map((w: { label: string; days: number }) => `${w.label} (${w.days}d)`).join(", ") || "None"}`);
  console.log(`  Exclusions Count:${normalized.exclusions.length}`);
  console.log(`  Benefits Count:  ${normalized.benefits.length}`);
  console.log(`  Benefits detail: ${normalized.benefits.map((b) => `${b.label} (${b.subBenefits.length} sub-benefits, ${b.limitLabel})`).join(" | ")}`);
  console.log(`  Copay Schedule:  ${normalized.copay.map((c: NormalizedCopayEntry) => `${c.label} (${c.percentage}%)`).join(", ") || "None"}`);
  console.log(`  Network Countries:${normalized.network?.countries.length ?? 0} (${normalized.network?.countries.slice(0, 4).join(", ")}...)`);
}

if (!allPassed) {
  process.exit(1);
} else {
  console.log(`\n🎉 All 4 samples parsed and normalized with 100% success!`);
}
