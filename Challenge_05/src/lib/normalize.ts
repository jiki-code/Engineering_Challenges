import type {
  RawPolicy,
  RawBenefit,
  RawSubBenefit,
  RawCopayEntry,
  NormalizedPolicy,
  NormalizedBenefit,
  NormalizedSubBenefit,
  NormalizedLimit,
  NormalizedCopayEntry,
  NormalizedMembers,
  QuickRefStat,
} from "../types/policy";
import {
  formatCurrency,
  formatDate,
  formatPercent,
  getBenefitMeta,
  getCurrencySymbol,
  getNetworkTypeLabel,
  isDateExpired,
  daysUntilExpiry,
  parseLimitKeys,
  type ParsedLimit,
} from "./format";

// ─── Sub-benefit: chuyển ParsedLimit → NormalizedLimit ──────────────────────

function toNormalizedLimit(pl: ParsedLimit): NormalizedLimit {
  return {
    type: pl.rawKey as NormalizedLimit["type"],
    amount: pl.amount,
    qualifier: pl.qualifier,
  };
}

/**
 * Chuẩn hóa một sub-benefit.
 *
 * Điểm then chốt: hoàn toàn KHÔNG biết trước sub-benefit có tên gì.
 * Hàm parseLimitKeys() sẽ tự quét object để tìm các key limit_per_*,
 * còn sub-benefit.name đến trực tiếp từ dữ liệu JSON.
 */
function normalizeSubBenefit(sb: RawSubBenefit): NormalizedSubBenefit {
  // Cast sang Record để parseLimitKeys có thể quét tất cả key động
  const raw = sb as unknown as Record<string, unknown>;

  // Phát hiện dynamic mọi monetary limit key
  const parsedLimits = parseLimitKeys(raw);
  const limits: NormalizedLimit[] = parsedLimits.map(toNormalizedLimit);

  // Xử lý các loại giới hạn phi tiền tệ
  if (typeof sb.coverage_percentage === "number") {
    limits.push({ type: "percentage", percentage: sb.coverage_percentage });
  }
  if (sb.covered === true && limits.length === 0) {
    limits.push({ type: "covered", covered: true, notes: sb.notes });
  }
  if (limits.length === 0 && sb.notes) {
    limits.push({ type: "other", notes: sb.notes });
  }

  return {
    name: sb.name,  // Tên đến từ JSON — không hard-code
    limits,
  };
}

// ─── Benefit normalizer ───────────────────────────────────────────────────────

function normalizeBenefit(b: RawBenefit): NormalizedBenefit {
  const { label, icon } = getBenefitMeta(b.type);
  const hasLifetime = typeof b.lifetime_limit === "number";

  return {
    type: b.type,
    label,
    icon,
    annualLimit: b.annual_limit,
    lifetimeLimit: b.lifetime_limit,
    limitLabel: hasLifetime ? "Lifetime Limit" : "Annual Limit",
    waitingPeriodDays: b.waiting_period_days ?? 0,
    subBenefits: (b.sub_benefits ?? []).map(normalizeSubBenefit),
  };
}

// ─── Copay normalizer ─────────────────────────────────────────────────────────
//
// Key trong copay object (ví dụ "outpatient", "inpatient") KHÔNG nhất thiết
// khớp với benefit type trong mảng benefits — chỉ render những gì có trong data.

function normalizeCopay(
  copay: NonNullable<RawPolicy["copay"]>
): NormalizedCopayEntry[] {
  return Object.entries(copay).map(([type, rawEntry]) => {
    const entry = rawEntry as RawCopayEntry;
    return {
      benefitType: type,
      label: getBenefitMeta(type).label,  // Fallback động nếu type lạ
      percentage: entry.percentage,
      maxPerVisit: entry.max_per_visit,
      maxPerYear: entry.max_per_year,
      flatFee: entry.flat_fee,
    };
  });
}

// ─── Members normalizer ────────────────────────────────────────────────────────

function normalizeMembers(raw: NonNullable<RawPolicy["members"]>): NormalizedMembers {
  return {
    total: raw.total ?? 0,
    employee: raw.employee ?? 0,
    dependentSpouse: raw.dependent_spouse ?? 0,
    dependentChild: raw.dependent_child ?? 0,
    dependentParent: raw.dependent_parent ?? 0,
    other: raw.other ?? 0,
  };
}

// ─── Quick Reference Stats ────────────────────────────────────────────────────

function buildQuickRefStats(
  benefits: NormalizedBenefit[],
  copay: NormalizedCopayEntry[],
  currency: string
): QuickRefStat[] {
  const stats: QuickRefStat[] = [];

  // Highest monetary limit across all benefits
  let maxLimitValue = 0;
  let maxLimitBenefitLabel = "";
  let maxLimitType = "Annual Limit";
  for (const b of benefits) {
    const val = b.lifetimeLimit ?? b.annualLimit ?? 0;
    if (val > maxLimitValue) {
      maxLimitValue = val;
      maxLimitBenefitLabel = b.label;
      maxLimitType = b.limitLabel;
    }
  }
  if (maxLimitValue > 0) {
    stats.push({
      label: `Max ${maxLimitType}`,
      value: formatCurrency(maxLimitValue, currency),
      sublabel: maxLimitBenefitLabel,
      highlight: true,
    });
  }

  // Copay range
  if (copay.length > 0) {
    const pcts = copay.map((c) => c.percentage);
    const min = Math.min(...pcts);
    const max = Math.max(...pcts);
    stats.push({
      label: "Copayment",
      value: min === max ? formatPercent(min) : `${formatPercent(min)} – ${formatPercent(max)}`,
      sublabel: min === 0 ? "Inpatient fully covered" : undefined,
    });
  } else {
    stats.push({ label: "Copayment", value: "None", sublabel: "Fully covered" });
  }

  // Number of benefit types
  stats.push({
    label: "Benefit Types",
    value: String(benefits.length),
    sublabel: benefits.map((b) => b.label).join(" · "),
  });

  // Waiting periods
  const withWaiting = benefits.filter((b) => b.waitingPeriodDays > 0);
  if (withWaiting.length > 0) {
    stats.push({
      label: "Waiting Periods",
      value: `${withWaiting.length} benefit${withWaiting.length > 1 ? "s" : ""}`,
      sublabel: withWaiting.map((b) => `${b.label} (${b.waitingPeriodDays}d)`).join(", "),
    });
  } else {
    stats.push({ label: "Waiting Periods", value: "None" });
  }

  return stats;
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export function normalizePolicy(raw: RawPolicy): NormalizedPolicy {
  const currency = raw.plan.currency;
  const benefits = raw.benefits.map(normalizeBenefit);
  const copay = raw.copay ? normalizeCopay(raw.copay) : [];

  const waitingPeriods = benefits
    .filter((b: NormalizedBenefit) => b.waitingPeriodDays > 0)
    .map((b: NormalizedBenefit) => ({ label: b.label, days: b.waitingPeriodDays }));

  const network = raw.network
    ? {
        type: raw.network.type ? getNetworkTypeLabel(raw.network.type) : "N/A",
        hospitalCount: raw.network.hospital_count,
        clinicCount: raw.network.clinic_count,
        countries: raw.network.countries ?? [],
        notes: raw.network.notes,
      }
    : undefined;

  return {
    policyNumber: raw.policy_number,
    isExpired: isDateExpired(raw.plan.expiry_date),
    daysUntilExpiry: daysUntilExpiry(raw.plan.expiry_date),

    holderName: raw.policyholder.name,
    holderType: raw.policyholder.type,
    holderIndustry: raw.policyholder.industry,
    employeeCount: raw.policyholder.employee_count,

    planName: raw.plan.name,
    planTier: raw.plan.tier ?? "Standard",
    effectiveDate: formatDate(raw.plan.effective_date),
    expiryDate: formatDate(raw.plan.expiry_date),
    currency,
    currencySymbol: getCurrencySymbol(currency),

    hasMembers: !!raw.members,
    members: raw.members ? normalizeMembers(raw.members) : undefined,

    benefits,
    hasCopay: copay.length > 0,
    copay,
    waitingPeriods,
    exclusions: raw.exclusions,
    hasNetwork: !!raw.network,
    network,

    quickRefStats: buildQuickRefStats(benefits, copay, currency),
  };
}
