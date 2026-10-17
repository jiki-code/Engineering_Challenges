/**
 * kpi.test.ts — Unit tests for KPI pure functions.
 * Run: npm test  (uses Vitest)
 */

import { describe, it, expect } from 'vitest';
import {
  applyFilters,
  calcKPIs,
  calcStatusDist,
  calcTrend,
  calcTop10Diagnoses,
  calcInsurerTypeRates,
  calcHistogram,
} from './kpi';
import type { Claim, FilterState } from '../types';

// ---------------------------------------------------------------------------
// Test data helpers
// ---------------------------------------------------------------------------
function makeClaim(overrides: Partial<Claim> = {}): Claim {
  return {
    claim_id: 'CLM-00001',
    policy_id: 'POL-00001',
    member_name: 'Test User',
    country: 'Thailand',
    insurer: 'Aurora Assurance',
    assessor: 'Somchai P.',
    claim_type: 'OUTPATIENT',
    icd_code: 'J06.9',
    status: 'APPROVED',
    submitted_amount: 3000,
    approved_amount: 3000,
    submitted_date: '2024-03-15',
    processed_date: '2024-03-20',
    ...overrides,
  };
}

const BASE_FILTER: FilterState = {
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31',
  claimTypes: [],
  insurers: [],
  countries: [],
  statuses: [],
  selectedDiagnosis: null,
};

// ---------------------------------------------------------------------------
// applyFilters
// ---------------------------------------------------------------------------
describe('applyFilters', () => {
  const claims: Claim[] = [
    makeClaim({ claim_id: 'A', submitted_date: '2024-03-01', status: 'APPROVED', claim_type: 'OUTPATIENT', country: 'Thailand', insurer: 'Aurora Assurance', icd_code: 'J06.9' }),
    makeClaim({ claim_id: 'B', submitted_date: '2024-06-15', status: 'REJECTED', claim_type: 'INPATIENT', country: 'Vietnam', insurer: 'Pacific Shield', icd_code: 'A90' }),
    makeClaim({ claim_id: 'C', submitted_date: '2024-11-01', status: 'PENDING', claim_type: 'DENTAL', country: 'Hong Kong', insurer: 'Mekong Life', icd_code: 'K02.9' }),
  ];

  it('returns all rows when no filters applied', () => {
    expect(applyFilters(claims, BASE_FILTER)).toHaveLength(3);
  });

  it('filters by date range', () => {
    const result = applyFilters(claims, { ...BASE_FILTER, dateFrom: '2024-06-01', dateTo: '2024-06-30' });
    expect(result).toHaveLength(1);
    expect(result[0].claim_id).toBe('B');
  });

  it('filters by claim_type', () => {
    const result = applyFilters(claims, { ...BASE_FILTER, claimTypes: ['DENTAL'] });
    expect(result).toHaveLength(1);
    expect(result[0].claim_id).toBe('C');
  });

  it('filters by insurer', () => {
    const result = applyFilters(claims, { ...BASE_FILTER, insurers: ['Pacific Shield'] });
    expect(result).toHaveLength(1);
    expect(result[0].claim_id).toBe('B');
  });

  it('filters by country', () => {
    const result = applyFilters(claims, { ...BASE_FILTER, countries: ['Hong Kong'] });
    expect(result).toHaveLength(1);
    expect(result[0].claim_id).toBe('C');
  });

  it('filters by status', () => {
    const result = applyFilters(claims, { ...BASE_FILTER, statuses: ['APPROVED', 'REJECTED'] });
    expect(result).toHaveLength(2);
  });

  it('filters by selectedDiagnosis', () => {
    const result = applyFilters(claims, { ...BASE_FILTER, selectedDiagnosis: 'A90' });
    expect(result).toHaveLength(1);
    expect(result[0].claim_id).toBe('B');
  });

  it('returns empty array when no match', () => {
    const result = applyFilters(claims, { ...BASE_FILTER, countries: ['Singapore'] });
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// calcKPIs
// ---------------------------------------------------------------------------
describe('calcKPIs', () => {
  it('returns nulls for empty array', () => {
    const m = calcKPIs([]);
    expect(m.totalClaims).toBe(0);
    expect(m.approvalRate).toBeNull();
    expect(m.avgClaimAmount).toBeNull();
    expect(m.avgProcessingDays).toBeNull();
  });

  it('approval rate = APPROVED / (APPROVED+REJECTED), excludes PENDING', () => {
    const rows: Claim[] = [
      makeClaim({ status: 'APPROVED', approved_amount: 1000, submitted_amount: 1000 }),
      makeClaim({ status: 'APPROVED', approved_amount: 1000, submitted_amount: 1000 }),
      makeClaim({ status: 'REJECTED', approved_amount: 0, submitted_amount: 1000 }),
      makeClaim({ status: 'PENDING', approved_amount: 0, submitted_amount: 1000 }),
    ];
    const m = calcKPIs(rows);
    // 2 approved / (2+1) decided = 2/3
    expect(m.approvalRate).toBeCloseTo(2 / 3, 5);
    // rejection rate = 1/4 total
    expect(m.rejectionRate).toBeCloseTo(0.25, 5);
  });

  it('approvalRate is null when all are PENDING/IN_REVIEW', () => {
    const rows: Claim[] = [
      makeClaim({ status: 'PENDING', approved_amount: 0 }),
      makeClaim({ status: 'IN_REVIEW', approved_amount: 0 }),
    ];
    expect(calcKPIs(rows).approvalRate).toBeNull();
  });

  it('avgClaimAmount = mean of submitted_amount', () => {
    const rows: Claim[] = [
      makeClaim({ submitted_amount: 1000, approved_amount: 1000 }),
      makeClaim({ submitted_amount: 3000, approved_amount: 3000 }),
    ];
    expect(calcKPIs(rows).avgClaimAmount).toBeCloseTo(2000, 5);
  });

  it('avgProcessingDays excludes rows with empty processed_date', () => {
    const rows: Claim[] = [
      makeClaim({ submitted_date: '2024-01-01', processed_date: '2024-01-08' }), // 7 days
      makeClaim({ submitted_date: '2024-01-01', processed_date: '2024-01-11' }), // 10 days
      makeClaim({ status: 'PENDING', processed_date: '' }),
    ];
    const m = calcKPIs(rows);
    expect(m.avgProcessingDays).toBeCloseTo(8.5, 5);
  });

  it('totalApprovedAmount sums approved_amount', () => {
    const rows: Claim[] = [
      makeClaim({ approved_amount: 5000, status: 'APPROVED' }),
      makeClaim({ approved_amount: 0, status: 'REJECTED' }),
      makeClaim({ approved_amount: 3000, status: 'APPROVED' }),
    ];
    expect(calcKPIs(rows).totalApprovedAmount).toBe(8000);
  });
});

// ---------------------------------------------------------------------------
// calcStatusDist
// ---------------------------------------------------------------------------
describe('calcStatusDist', () => {
  it('returns all 4 statuses even if count is 0', () => {
    const dist = calcStatusDist([makeClaim({ status: 'APPROVED' })]);
    expect(dist).toHaveLength(4);
    const statuses = dist.map((d) => d.status);
    expect(statuses).toContain('REJECTED');
    expect(statuses).toContain('PENDING');
    expect(statuses).toContain('IN_REVIEW');
  });
});

// ---------------------------------------------------------------------------
// calcTrend
// ---------------------------------------------------------------------------
describe('calcTrend', () => {
  it('groups by month correctly', () => {
    const rows: Claim[] = [
      makeClaim({ submitted_date: '2024-01-05', approved_amount: 100 }),
      makeClaim({ submitted_date: '2024-01-20', approved_amount: 200 }),
      makeClaim({ submitted_date: '2024-02-10', approved_amount: 50 }),
    ];
    const trend = calcTrend(rows, 'month');
    expect(trend).toHaveLength(2);
    expect(trend[0].period).toBe('2024-01');
    expect(trend[0].count).toBe(2);
    expect(trend[0].approvedAmount).toBe(300);
  });
});

// ---------------------------------------------------------------------------
// calcTop10Diagnoses
// ---------------------------------------------------------------------------
describe('calcTop10Diagnoses', () => {
  it('top by count and top by amount can differ', () => {
    const rows: Claim[] = [
      ...Array(5).fill(null).map(() => makeClaim({ icd_code: 'J06.9', submitted_amount: 500 })),
      makeClaim({ icd_code: 'I21.9', submitted_amount: 100000 }),
    ];
    const { byCount, byAmount } = calcTop10Diagnoses(rows);
    expect(byCount[0].icd_code).toBe('J06.9');
    expect(byAmount[0].icd_code).toBe('I21.9');
  });
});

// ---------------------------------------------------------------------------
// calcInsurerTypeRates
// ---------------------------------------------------------------------------
describe('calcInsurerTypeRates', () => {
  it('returns null approvalRate when no decided claims', () => {
    const rows: Claim[] = [
      makeClaim({ insurer: 'Test Inc', claim_type: 'OUTPATIENT', status: 'PENDING' }),
    ];
    const rates = calcInsurerTypeRates(rows, ['Test Inc']);
    const outpRate = rates.find((r) => r.claim_type === 'OUTPATIENT')!;
    expect(outpRate.approvalRate).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// calcHistogram
// ---------------------------------------------------------------------------
describe('calcHistogram', () => {
  it('produces exactly 30 bins', () => {
    const bins = calcHistogram([]);
    expect(bins).toHaveLength(30);
  });

  it('skips rows with empty processed_date', () => {
    const rows: Claim[] = [
      makeClaim({ submitted_date: '2024-01-01', processed_date: '2024-01-08' }), // day 7
      makeClaim({ status: 'PENDING', processed_date: '' }),
    ];
    const bins = calcHistogram(rows);
    expect(bins[6].count).toBe(1); // index 6 = day 7
    const total = bins.reduce((s, b) => s + b.count, 0);
    expect(total).toBe(1);
  });
});
