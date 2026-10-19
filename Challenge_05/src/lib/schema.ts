import type {
  RawPolicy,
  RawBenefit,
  RawSubBenefit,
  RawCopay,
  ParseResult,
  ValidationError,
} from "../types/policy";

// ─── Validators ──────────────────────────────────────────────────────────────

function validateSubBenefit(
  sb: unknown,
  path: string,
  errors: ValidationError[]
): boolean {
  if (typeof sb !== "object" || sb === null || Array.isArray(sb)) {
    errors.push({ field: path, message: "Must be an object" });
    return false;
  }
  const obj = sb as Record<string, unknown>;
  if (typeof obj.name !== "string" || !obj.name.trim()) {
    errors.push({ field: `${path}.name`, message: "Required string" });
  }
  return true;
}

function validateBenefit(
  benefit: unknown,
  index: number,
  errors: ValidationError[]
): boolean {
  const path = `benefits[${index}]`;
  if (typeof benefit !== "object" || benefit === null || Array.isArray(benefit)) {
    errors.push({ field: path, message: "Must be an object" });
    return false;
  }
  const obj = benefit as Record<string, unknown>;
  if (typeof obj.type !== "string" || !obj.type.trim()) {
    errors.push({ field: `${path}.type`, message: "Required string" });
  }
  if (obj.sub_benefits !== undefined) {
    if (!Array.isArray(obj.sub_benefits)) {
      errors.push({
        field: `${path}.sub_benefits`,
        message: "Must be an array if provided",
      });
    } else {
      (obj.sub_benefits as unknown[]).forEach((sb, i) =>
        validateSubBenefit(sb, `${path}.sub_benefits[${i}]`, errors)
      );
    }
  }
  return true;
}

function validateCopay(copay: unknown, errors: ValidationError[]): void {
  if (typeof copay !== "object" || copay === null || Array.isArray(copay)) {
    errors.push({ field: "copay", message: "Must be an object" });
    return;
  }
  Object.entries(copay as Record<string, unknown>).forEach(([key, val]) => {
    if (typeof val !== "object" || val === null || Array.isArray(val)) {
      errors.push({ field: `copay.${key}`, message: "Must be an object" });
      return;
    }
    const entry = val as Record<string, unknown>;
    if (typeof entry.percentage !== "number") {
      errors.push({
        field: `copay.${key}.percentage`,
        message: "Required number",
      });
    }
  });
}

// ─── Main parse function ─────────────────────────────────────────────────────

export function parsePolicy(jsonString: string): ParseResult {
  // 1. JSON syntax check
  let raw: unknown;
  try {
    raw = JSON.parse(jsonString);
  } catch (e) {
    return {
      success: false,
      errors: [
        {
          field: "root",
          message: `Invalid JSON syntax: ${(e as Error).message}`,
        },
      ],
    };
  }

  // 2. Root object check
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return {
      success: false,
      errors: [{ field: "root", message: "Policy must be a JSON object" }],
    };
  }

  const obj = raw as Record<string, unknown>;
  const errors: ValidationError[] = [];

  // 3. Required fields
  if (typeof obj.policy_number !== "string" || !obj.policy_number.trim()) {
    errors.push({ field: "policy_number", message: "Required string" });
  }

  // policyholder
  if (typeof obj.policyholder !== "object" || obj.policyholder === null) {
    errors.push({ field: "policyholder", message: "Required object" });
  } else {
    const ph = obj.policyholder as Record<string, unknown>;
    if (typeof ph.name !== "string" || !ph.name.trim()) {
      errors.push({ field: "policyholder.name", message: "Required string" });
    }
    if (typeof ph.type !== "string" || !ph.type.trim()) {
      errors.push({ field: "policyholder.type", message: "Required string" });
    }
  }

  // plan
  if (typeof obj.plan !== "object" || obj.plan === null) {
    errors.push({ field: "plan", message: "Required object" });
  } else {
    const plan = obj.plan as Record<string, unknown>;
    if (typeof plan.name !== "string" || !plan.name.trim()) {
      errors.push({ field: "plan.name", message: "Required string" });
    }
    if (typeof plan.effective_date !== "string" || !plan.effective_date.trim()) {
      errors.push({ field: "plan.effective_date", message: "Required date string" });
    }
    if (typeof plan.expiry_date !== "string" || !plan.expiry_date.trim()) {
      errors.push({ field: "plan.expiry_date", message: "Required date string" });
    }
    if (typeof plan.currency !== "string" || !plan.currency.trim()) {
      errors.push({ field: "plan.currency", message: "Required string" });
    }
  }

  // benefits
  if (!Array.isArray(obj.benefits)) {
    errors.push({ field: "benefits", message: "Required array" });
  } else if (obj.benefits.length === 0) {
    errors.push({ field: "benefits", message: "At least one benefit required" });
  } else {
    (obj.benefits as unknown[]).forEach((b, i) => validateBenefit(b, i, errors));
  }

  // exclusions
  if (!Array.isArray(obj.exclusions)) {
    errors.push({ field: "exclusions", message: "Required array" });
  }

  // copay (optional but validate structure if present)
  if (obj.copay !== undefined) {
    validateCopay(obj.copay, errors);
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: raw as RawPolicy };
}
