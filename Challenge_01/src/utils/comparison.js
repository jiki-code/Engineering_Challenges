/**
 * Formats monetary amounts into USD standard currency string
 * e.g. 500000 -> "$500,000"
 */
export function formatCurrency(amount, notIncludedText = "Not Included", unlimitedText = "Unlimited") {
  if (amount === null || amount === undefined) return notIncludedText;
  if (amount === -1) return unlimitedText;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Calculates monthly vs annual price (10% discount for annual)
 */
export function getDisplayPrice(monthlyPrice, isAnnual) {
  if (isAnnual) {
    const annualTotal = monthlyPrice * 12 * 0.9;
    const effectiveMonthly = Math.round(annualTotal / 12);
    return {
      monthlyEquivalent: effectiveMonthly,
      totalBilling: Math.round(annualTotal),
      originalMonthly: monthlyPrice,
      savings: Math.round(monthlyPrice * 12 * 0.1)
    };
  }
  return {
    monthlyEquivalent: monthlyPrice,
    totalBilling: monthlyPrice * 12,
    originalMonthly: monthlyPrice,
    savings: 0
  };
}

/**
 * Evaluates which plan index (0, 1, or 2) holds the "Best Value" for a given feature row
 */
export function getBestPlanIndexForRow(feature, plans) {
  const values = plans.map(p => {
    if (feature.getValue) {
      return feature.getValue(p);
    }
    return p[feature.key];
  });

  const { bestCriteria } = feature;

  if (bestCriteria === 'min') {
    const validValues = values.filter(v => v !== null && v !== undefined);
    if (validValues.length === 0) return -1;
    const minVal = Math.min(...validValues);
    return values.indexOf(minVal);
  }

  if (bestCriteria === 'max') {
    const validValues = values.filter(v => v !== null && v !== undefined);
    if (validValues.length === 0) return -1;
    const maxVal = Math.max(...validValues);
    if (maxVal <= 0) return -1;
    return values.indexOf(maxVal);
  }

  if (bestCriteria === 'max_unlimited') {
    const unlimitedIndex = values.indexOf(-1);
    if (unlimitedIndex !== -1) {
      return unlimitedIndex;
    }
    const validValues = values.filter(v => typeof v === 'number' && v > 0);
    if (validValues.length === 0) return -1;
    const maxVal = Math.max(...validValues);
    return values.indexOf(maxVal);
  }

  return -1;
}

/**
 * Format human-readable string for feature cell with i18n support
 */
export function renderFeatureDisplayValue(feature, plan, t) {
  let rawVal = feature.getValue ? feature.getValue(plan) : plan[feature.key];
  const notIncludedText = t?.display?.notIncluded || "Not Included";
  const unlimitedText = t?.display?.unlimited || "Unlimited";

  if (rawVal === null || rawVal === undefined) {
    return { text: notIncludedText, isIncluded: false };
  }

  if (rawVal === -1) {
    return { text: unlimitedText, isIncluded: true, isUnlimited: true };
  }

  switch (feature.type) {
    case 'currency':
    case 'currency_or_null':
      return { text: formatCurrency(rawVal, notIncludedText, unlimitedText), isIncluded: true };
    case 'percentage':
      return { text: `${rawVal}%`, isIncluded: true, zeroIsBest: rawVal === 0 };
    case 'days':
      return { 
        text: rawVal === 0 ? (t?.display?.immediate || "Immediate (0 days)") : `${rawVal} ${t?.display?.days || "Days"}`, 
        isIncluded: true 
      };
    case 'days_limit':
      return { 
        text: `${rawVal} ${t?.display?.daysYear || "Days / Year"}`, 
        isIncluded: true 
      };
    case 'visits':
      return { 
        text: `${rawVal} ${t?.display?.visitsYear || "Visits / Year"}`, 
        isIncluded: true 
      };
    default:
      return { text: String(rawVal), isIncluded: true };
  }
}
