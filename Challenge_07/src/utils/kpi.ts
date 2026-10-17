/**
 * kpi.ts — Pure computation functions.
 * All functions are side-effect-free and unit-tested in kpi.test.ts.
 *
 * DEFINITIONS (locked in README):
 *   Approval rate  = APPROVED / (APPROVED + REJECTED)  — excludes PENDING/IN_REVIEW
 *   Rejection rate = REJECTED / total claims
 *   Avg claim amt  = mean(submitted_amount)
 *   Avg proc days  = mean(processed_date - submitted_date) where processed_date != ""
 */

import type {
  Claim,
  ClaimStatus,
  ClaimType,
  DiagnosisCount,
  FilterState,
  HistogramBin,
  InsurerTypeRate,
  KPIMetrics,
  StatusDist,
  TrendGranularity,
  TrendPoint,
} from '../types';

// ---------------------------------------------------------------------------
// Filter
// ---------------------------------------------------------------------------
export function applyFilters(claims: Claim[], f: FilterState): Claim[] {
  return claims.filter((c) => {
    if (c.submitted_date < f.dateFrom || c.submitted_date > f.dateTo) return false;
    if (f.claimTypes.length > 0 && !f.claimTypes.includes(c.claim_type)) return false;
    if (f.insurers.length > 0 && !f.insurers.includes(c.insurer)) return false;
    if (f.countries.length > 0 && !f.countries.includes(c.country)) return false;
    if (f.statuses.length > 0 && !f.statuses.includes(c.status)) return false;
    if (f.selectedDiagnosis !== null && c.icd_code !== f.selectedDiagnosis) return false;
    return true;
  });
}

// ---------------------------------------------------------------------------
// KPI
// ---------------------------------------------------------------------------
export function calcKPIs(rows: Claim[]): KPIMetrics {
  const n = rows.length;

  const approved = rows.filter((r) => r.status === 'APPROVED').length;
  const rejected = rows.filter((r) => r.status === 'REJECTED').length;
  const decided = approved + rejected;

  const totalApprovedAmount = rows.reduce((s, r) => s + r.approved_amount, 0);

  const approvalRate = decided > 0 ? approved / decided : null;
  const rejectionRate = n > 0 ? rejected / n : 0;

  const avgClaimAmount = n > 0
    ? rows.reduce((s, r) => s + r.submitted_amount, 0) / n
    : null;

  const procDays = rows
    .filter((r) => r.processed_date !== '')
    .map((r) => {
      const ms = new Date(r.processed_date).getTime() - new Date(r.submitted_date).getTime();
      return ms / 86_400_000; // days
    });

  const avgProcessingDays = procDays.length > 0
    ? procDays.reduce((s, d) => s + d, 0) / procDays.length
    : null;

  return {
    totalClaims: n,
    totalApprovedAmount,
    approvalRate,
    rejectionRate,
    avgClaimAmount,
    avgProcessingDays,
  };
}

// ---------------------------------------------------------------------------
// Status distribution
// ---------------------------------------------------------------------------
const STATUS_ORDER: ClaimStatus[] = ['APPROVED', 'REJECTED', 'PENDING', 'IN_REVIEW'];

export function calcStatusDist(rows: Claim[]): StatusDist[] {
  const counts: Record<string, number> = {};
  for (const r of rows) counts[r.status] = (counts[r.status] ?? 0) + 1;
  return STATUS_ORDER.map((s) => ({ status: s, count: counts[s] ?? 0 }));
}

// ---------------------------------------------------------------------------
// Monthly / weekly trend
// ---------------------------------------------------------------------------
function isoWeek(dateStr: string): string {
  const d = new Date(dateStr);
  const jan4 = new Date(d.getFullYear(), 0, 4);
  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86_400_000);
  const weekNum = Math.ceil((dayOfYear + jan4.getDay()) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export function calcTrend(rows: Claim[], granularity: TrendGranularity): TrendPoint[] {
  const map = new Map<string, { count: number; approvedAmount: number }>();

  for (const r of rows) {
    const period =
      granularity === 'month'
        ? r.submitted_date.slice(0, 7)
        : isoWeek(r.submitted_date);

    const cur = map.get(period) ?? { count: 0, approvedAmount: 0 };
    cur.count += 1;
    cur.approvedAmount += r.approved_amount;
    map.set(period, cur);
  }

  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([period, v]) => ({ period, ...v }));
}

// ---------------------------------------------------------------------------
// Top-10 diagnoses
// ---------------------------------------------------------------------------
export function calcTop10Diagnoses(rows: Claim[]): {
  byCount: DiagnosisCount[];
  byAmount: DiagnosisCount[];
} {
  const map = new Map<string, DiagnosisCount>();
  for (const r of rows) {
    const cur = map.get(r.icd_code) ?? { icd_code: r.icd_code, count: 0, totalAmount: 0 };
    cur.count += 1;
    cur.totalAmount += r.submitted_amount;
    map.set(r.icd_code, cur);
  }
  const all = [...map.values()];
  const byCount = [...all].sort((a, b) => b.count - a.count).slice(0, 10);
  const byAmount = [...all].sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 10);
  return { byCount, byAmount };
}

// ---------------------------------------------------------------------------
// Insurer × claim_type approval rate (grouped bar)
// ---------------------------------------------------------------------------
const TYPE_ORDER: ClaimType[] = ['OUTPATIENT', 'INPATIENT', 'DENTAL', 'MATERNITY'];

export function calcInsurerTypeRates(rows: Claim[], insurers: string[]): InsurerTypeRate[] {
  const result: InsurerTypeRate[] = [];
  for (const ins of insurers) {
    for (const ct of TYPE_ORDER) {
      const sub = rows.filter((r) => r.insurer === ins && r.claim_type === ct);
      const decided = sub.filter((r) => r.status === 'APPROVED' || r.status === 'REJECTED');
      const approved = sub.filter((r) => r.status === 'APPROVED').length;
      result.push({
        insurer: ins,
        claim_type: ct,
        approvalRate: decided.length > 0 ? approved / decided.length : null,
        count: sub.length,
      });
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Processing time histogram (bins 1..30)
// ---------------------------------------------------------------------------
export function calcHistogram(rows: Claim[]): HistogramBin[] {
  const counts = new Array<number>(31).fill(0); // index = days
  for (const r of rows) {
    if (r.processed_date === '') continue;
    const days = Math.round(
      (new Date(r.processed_date).getTime() - new Date(r.submitted_date).getTime()) / 86_400_000
    );
    if (days >= 1 && days <= 30) counts[days] += 1;
  }
  return Array.from({ length: 30 }, (_, i) => ({ day: i + 1, count: counts[i + 1] }));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function fmtNumber(n: number, decimals = 0): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: decimals });
}

export function fmtCurrency(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function fmtPct(n: number | null, decimals = 1): string {
  if (n === null) return '—';
  return (n * 100).toFixed(decimals) + '%';
}
