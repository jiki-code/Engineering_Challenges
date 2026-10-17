// Core claim record — matches claims.csv columns exactly
export interface Claim {
  claim_id: string;
  policy_id: string;
  member_name: string;
  country: string;
  insurer: string;
  assessor: string;
  claim_type: ClaimType;
  icd_code: string;
  status: ClaimStatus;
  submitted_amount: number;
  approved_amount: number;
  submitted_date: string; // ISO YYYY-MM-DD
  processed_date: string; // ISO YYYY-MM-DD or ""
}

export type ClaimType = 'OUTPATIENT' | 'INPATIENT' | 'DENTAL' | 'MATERNITY';
export type ClaimStatus = 'APPROVED' | 'REJECTED' | 'PENDING' | 'IN_REVIEW';

export interface KPIMetrics {
  totalClaims: number;
  totalApprovedAmount: number;
  approvalRate: number | null; // null when no decided claims
  rejectionRate: number;
  avgClaimAmount: number | null;
  avgProcessingDays: number | null;
}

export interface StatusDist {
  status: ClaimStatus;
  count: number;
}

export interface TrendPoint {
  period: string; // "2024-01" or "2024-W03"
  count: number;
  approvedAmount: number;
}

export interface DiagnosisCount {
  icd_code: string;
  count: number;
  totalAmount: number;
}

export interface InsurerTypeRate {
  insurer: string;
  claim_type: ClaimType;
  approvalRate: number | null;
  count: number;
}

export interface HistogramBin {
  day: number; // 1..30
  count: number;
}

export type TrendGranularity = 'month' | 'week';

export interface FilterState {
  dateFrom: string;
  dateTo: string;
  claimTypes: ClaimType[];
  insurers: string[];
  countries: string[];
  statuses: ClaimStatus[];
  selectedDiagnosis: string | null;
}
