export const getPlansData = (t) => [
  {
    "name": "Bronze",
    "monthly_premium": 150,
    "annual_limit": 500000,
    "benefits": {
      "outpatient": { "limit_per_visit": 3000, "visits_per_year": 30 },
      "inpatient": { "limit_per_day": 10000, "days_per_year": 60 },
      "dental": null,
      "maternity": null
    },
    "copay_percentage": 20,
    "waiting_period_days": 30,
    "highlights": t?.plans?.bronze?.highlights || ["Basic coverage", "No dental or maternity"],
    "badge": t?.plans?.bronze?.badge || null,
    "color": "bronze",
    "theme": {
      "border": "border-amber-700/40",
      "headerBg": "bg-gradient-to-br from-amber-950/40 to-slate-900",
      "badgeBg": "bg-amber-900/60 text-amber-300 border-amber-700/50",
      "accent": "text-amber-400",
      "btn": "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
    }
  },
  {
    "name": "Silver",
    "monthly_premium": 350,
    "annual_limit": 1500000,
    "benefits": {
      "outpatient": { "limit_per_visit": 5000, "visits_per_year": 60 },
      "inpatient": { "limit_per_day": 25000, "days_per_year": 120 },
      "dental": { "limit_per_year": 30000 },
      "maternity": null
    },
    "copay_percentage": 10,
    "waiting_period_days": 15,
    "highlights": t?.plans?.silver?.highlights || ["Includes dental", "Lower copay", "Higher limits"],
    "badge": t?.plans?.silver?.badge || "Best Value",
    "isRecommended": true,
    "color": "silver",
    "theme": {
      "border": "border-cyan-500/60 shadow-lg shadow-cyan-500/10",
      "headerBg": "bg-gradient-to-br from-cyan-950/60 to-slate-900",
      "badgeBg": "bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-sm shadow-cyan-500/50",
      "accent": "text-cyan-400",
      "btn": "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20"
    }
  },
  {
    "name": "Gold",
    "monthly_premium": 700,
    "annual_limit": 5000000,
    "benefits": {
      "outpatient": { "limit_per_visit": 10000, "visits_per_year": -1 },
      "inpatient": { "limit_per_day": 50000, "days_per_year": -1 },
      "dental": { "limit_per_year": 100000 },
      "maternity": { "limit_per_pregnancy": 200000 }
    },
    "copay_percentage": 0,
    "waiting_period_days": 0,
    "highlights": t?.plans?.gold?.highlights || ["Full coverage", "No copay", "No waiting period", "Unlimited visits"],
    "badge": t?.plans?.gold?.badge || "Premium Protection",
    "color": "gold",
    "theme": {
      "border": "border-yellow-500/50",
      "headerBg": "bg-gradient-to-br from-amber-950/40 via-yellow-950/30 to-slate-900",
      "badgeBg": "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
      "accent": "text-yellow-400",
      "btn": "bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-semibold shadow-md shadow-yellow-500/20"
    }
  }
];

export const getFeatureCategories = (t) => [
  {
    category: t?.categories?.financial || "Financial & Limits",
    features: [
      {
        key: "annual_limit",
        label: t?.features?.annual_limit?.label || "Annual Maximum Limit",
        tooltip: t?.features?.annual_limit?.tooltip,
        type: "currency",
        bestCriteria: "max"
      },
      {
        key: "copay_percentage",
        label: t?.features?.copay_percentage?.label || "Co-pay Percentage",
        tooltip: t?.features?.copay_percentage?.tooltip,
        type: "percentage",
        bestCriteria: "min"
      },
      {
        key: "waiting_period_days",
        label: t?.features?.waiting_period_days?.label || "Waiting Period",
        tooltip: t?.features?.waiting_period_days?.tooltip,
        type: "days",
        bestCriteria: "min"
      }
    ]
  },
  {
    category: t?.categories?.outpatient || "Outpatient Care (Doctor Visits & Clinics)",
    features: [
      {
        key: "outpatient_visit_limit",
        label: t?.features?.outpatient_visit_limit?.label || "Per Visit Coverage Limit",
        tooltip: t?.features?.outpatient_visit_limit?.tooltip,
        type: "currency",
        getValue: (p) => p.benefits.outpatient?.limit_per_visit,
        bestCriteria: "max"
      },
      {
        key: "outpatient_visits_year",
        label: t?.features?.outpatient_visits_year?.label || "Visits Per Year",
        tooltip: t?.features?.outpatient_visits_year?.tooltip,
        type: "visits",
        getValue: (p) => p.benefits.outpatient?.visits_per_year,
        bestCriteria: "max_unlimited"
      }
    ]
  },
  {
    category: t?.categories?.inpatient || "Inpatient Care (Hospital Stays & Surgeries)",
    features: [
      {
        key: "inpatient_day_limit",
        label: t?.features?.inpatient_day_limit?.label || "Per Day Coverage Limit",
        tooltip: t?.features?.inpatient_day_limit?.tooltip,
        type: "currency",
        getValue: (p) => p.benefits.inpatient?.limit_per_day,
        bestCriteria: "max"
      },
      {
        key: "inpatient_days_year",
        label: t?.features?.inpatient_days_year?.label || "Hospital Days Per Year",
        tooltip: t?.features?.inpatient_days_year?.tooltip,
        type: "days_limit",
        getValue: (p) => p.benefits.inpatient?.days_per_year,
        bestCriteria: "max_unlimited"
      }
    ]
  },
  {
    category: t?.categories?.specialized || "Specialized Care Add-ons",
    features: [
      {
        key: "dental_limit",
        label: t?.features?.dental_limit?.label || "Dental Coverage",
        tooltip: t?.features?.dental_limit?.tooltip,
        type: "currency_or_null",
        getValue: (p) => p.benefits.dental ? p.benefits.dental.limit_per_year : null,
        bestCriteria: "max"
      },
      {
        key: "maternity_limit",
        label: t?.features?.maternity_limit?.label || "Maternity Coverage",
        tooltip: t?.features?.maternity_limit?.tooltip,
        type: "currency_or_null",
        getValue: (p) => p.benefits.maternity ? p.benefits.maternity.limit_per_pregnancy : null,
        bestCriteria: "max"
      }
    ]
  }
];
