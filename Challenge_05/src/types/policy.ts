// ─── Raw JSON Schema Types (as received from API / file) ───────────────────

export interface RawSubBenefit {
  name: string;
  // Limit variants — only one or a combination will be present
  limit_per_day?: number;
  max_days?: number;
  limit_per_event?: number;
  limit_per_visit?: number;
  visits_per_year?: number;
  limit_per_year?: number;
  limit_per_pregnancy?: number;
  limit_per_trip?: number;
  limit_per_person?: number;
  coverage_percentage?: number;
  covered?: boolean;
  notes?: string;
}

export interface RawBenefit {
  type: string; // INPATIENT | OUTPATIENT | DENTAL | MATERNITY | VISION | etc.
  annual_limit?: number;
  lifetime_limit?: number;
  waiting_period_days?: number;
  sub_benefits?: RawSubBenefit[];
}

export interface RawCopayEntry {
  percentage: number;
  max_per_visit?: number;
  max_per_year?: number;
  flat_fee?: number;
}

export interface RawCopay {
  [benefitType: string]: RawCopayEntry;
}

export interface RawNetwork {
  type?: string;
  hospital_count?: number;
  clinic_count?: number;
  countries?: string[];
  notes?: string;
}

export interface RawMembers {
  total?: number;
  employee?: number;
  dependent_spouse?: number;
  dependent_child?: number;
  dependent_parent?: number;
  other?: number;
}

export interface RawPolicyholder {
  name: string;
  type: "CORPORATE" | "INDIVIDUAL" | "FAMILY" | string;
  industry?: string;
  employee_count?: number;
  date_of_birth?: string;
  gender?: string;
  id_number?: string;
}

export interface RawPlan {
  name: string;
  tier?: string;
  effective_date: string;
  expiry_date: string;
  currency: string;
  premium_amount?: number;
  premium_frequency?: string;
}

export interface RawPolicy {
  policy_number: string;
  policyholder: RawPolicyholder;
  plan: RawPlan;
  members?: RawMembers;
  benefits: RawBenefit[];
  exclusions: string[];
  copay?: RawCopay;
  network?: RawNetwork;
}

// ─── Normalized / Render-Ready Types ────────────────────────────────────────

export type LimitType =
  | "annual"
  | "lifetime"
  | "per_day"
  | "per_event"
  | "per_visit"
  | "per_year"
  | "per_pregnancy"
  | "per_trip"
  | "per_person"
  | "percentage"
  | "covered"
  | "other";

export interface NormalizedLimit {
  type: LimitType;
  amount?: number;          // monetary value
  percentage?: number;      // for coverage_percentage
  qualifier?: string;       // e.g. "max 120 days", "30 visits/year"
  covered?: boolean;        // for boolean coverage
  notes?: string;
}

export interface NormalizedSubBenefit {
  name: string;
  limits: NormalizedLimit[];
}

export interface NormalizedBenefit {
  type: string;             // raw type key
  label: string;            // Human-friendly label, e.g. "Inpatient"
  icon: string;             // emoji or icon identifier
  annualLimit?: number;
  lifetimeLimit?: number;
  limitLabel: string;       // "Annual Limit" | "Lifetime Limit"
  waitingPeriodDays: number;
  subBenefits: NormalizedSubBenefit[];
}

export interface NormalizedCopayEntry {
  benefitType: string;
  label: string;
  percentage: number;
  maxPerVisit?: number;
  maxPerYear?: number;
  flatFee?: number;
}

export interface NormalizedMembers {
  total: number;
  employee: number;
  dependentSpouse: number;
  dependentChild: number;
  dependentParent: number;
  other: number;
}

export interface QuickRefStat {
  label: string;
  value: string;
  sublabel?: string;
  highlight?: boolean;
}

export interface NormalizedPolicy {
  // Meta
  policyNumber: string;
  isExpired: boolean;
  daysUntilExpiry: number;

  // Policyholder
  holderName: string;
  holderType: string;
  holderIndustry?: string;
  employeeCount?: number;

  // Plan
  planName: string;
  planTier: string;
  effectiveDate: string;       // formatted
  expiryDate: string;          // formatted
  currency: string;
  currencySymbol: string;

  // Members (only for corporate/family)
  hasMembers: boolean;
  members?: NormalizedMembers;

  // Benefits
  benefits: NormalizedBenefit[];

  // Copay
  hasCopay: boolean;
  copay: NormalizedCopayEntry[];

  // Waiting periods (filtered benefits that have waiting_period_days > 0)
  waitingPeriods: Array<{ label: string; days: number }>;

  // Exclusions
  exclusions: string[];

  // Network
  hasNetwork: boolean;
  network?: {
    type: string;
    hospitalCount?: number;
    clinicCount?: number;
    countries: string[];
    notes?: string;
  };

  // Quick reference
  quickRefStats: QuickRefStat[];
}

// ─── Validation Result ───────────────────────────────────────────────────────

export interface ValidationError {
  field: string;
  message: string;
}

export interface ParseResult {
  success: boolean;
  data?: RawPolicy;
  errors?: ValidationError[];
}
