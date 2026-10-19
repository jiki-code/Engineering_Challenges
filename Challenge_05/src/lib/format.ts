// ─── 1. CURRENCY SYMBOLS ─────────────────────────────────────────────────────
//
// Dùng Intl.NumberFormat để tạo symbol thật sự theo locale,
// không hardcode bảng symbol tĩnh.

/**
 * Trả về currency symbol từ mã ISO 4217 bằng cách dùng Intl.NumberFormat.
 * Ví dụ: "THB" → "฿", "USD" → "$", "VND" → "₫"
 * Fallback về mã currency nếu không extract được.
 */
export function getCurrencySymbol(currencyCode: string): string {
  try {
    const parts = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
    }).formatToParts(0);
    const symbolPart = parts.find((p) => p.type === "currency");
    return symbolPart?.value ?? currencyCode;
  } catch {
    return currencyCode;
  }
}

/**
 * Một số locale đặt symbol trước, một số sau số.
 * Hàm này phát hiện động vị trí đặt symbol.
 */
function currencySymbolPosition(currencyCode: string): "prefix" | "suffix" {
  try {
    const parts = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).formatToParts(1000);
    const symbolIdx = parts.findIndex((p) => p.type === "currency");
    const numberIdx = parts.findIndex((p) => p.type === "integer");
    return symbolIdx < numberIdx ? "prefix" : "suffix";
  } catch {
    return "prefix";
  }
}

// ─── 2. CURRENCY FORMATTER ───────────────────────────────────────────────────

/**
 * Format số tiền theo mã currency — không hardcode symbol, dùng Intl.
 *
 * Quy tắc:
 * - Không hiển thị thập phân (0 fractional digits) vì đây là bảo hiểm
 * - Tự phát hiện locale phù hợp từ currency code
 * - VND/IDR/KRW/JPY: dùng locale bản địa (dấu phân cách khác)
 *
 * Ví dụ:
 *   formatCurrency(2000000, "THB") → "฿2,000,000"
 *   formatCurrency(50000000, "VND") → "₫50.000.000"
 *   formatCurrency(1000, "USD")    → "$1,000"
 */
export function formatCurrency(amount: number, currencyCode: string): string {
  // Map từ currency code → locale bản địa tốt nhất
  const CURRENCY_LOCALE_MAP: Record<string, string> = {
    VND: "vi-VN",
    IDR: "id-ID",
    JPY: "ja-JP",
    KRW: "ko-KR",
    THB: "th-TH",
    MYR: "ms-MY",
    PHP: "fil-PH",
    SGD: "en-SG",
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
    AUD: "en-AU",
    CAD: "en-CA",
  };

  const locale = CURRENCY_LOCALE_MAP[currencyCode.toUpperCase()] ?? "en-US";

  try {
    // Dùng style: "currency" để Intl tự xử lý symbol, vị trí, dấu phân cách
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Fallback: thêm symbol thủ công nếu Intl không hỗ trợ currency code này
    const symbol = getCurrencySymbol(currencyCode);
    const number = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    return `${symbol}${number}`;
  }
}

// ─── 3. DATE FORMATTER ───────────────────────────────────────────────────────

/**
 * Format ISO date string (YYYY-MM-DD) → "01 Jan 2024" (tiếng Anh, rõ ràng)
 * Tránh lỗi timezone shift bằng cách append T00:00:00.
 * Fallback về string gốc nếu parse thất bại.
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(`${dateStr}T00:00:00`);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function isDateExpired(dateStr: string): boolean {
  try {
    return new Date(`${dateStr}T23:59:59`) < new Date();
  } catch {
    return false;
  }
}

export function daysUntilExpiry(dateStr: string): number {
  try {
    const expiry = new Date(`${dateStr}T23:59:59`);
    return Math.floor((expiry.getTime() - Date.now()) / 86_400_000);
  } catch {
    return 0;
  }
}

// ─── 4. BENEFIT TYPE → DISPLAY NAME (với fallback động) ──────────────────────
//
// Chỉ ánh xạ những type phổ biến nhất.
// Nếu gặp type KHÔNG có trong map → tự động title-case từ tên field.
// Hoàn toàn không cần biết trước các giá trị có thể có.

const BENEFIT_DISPLAY: Record<string, { label: string; icon: string }> = {
  INPATIENT:        { label: "Inpatient",          icon: "🏥" },
  OUTPATIENT:       { label: "Outpatient",          icon: "🩺" },
  DENTAL:           { label: "Dental",              icon: "🦷" },
  MATERNITY:        { label: "Maternity",           icon: "🤱" },
  VISION:           { label: "Vision / Optical",    icon: "👁️" },
  MENTAL_HEALTH:    { label: "Mental Health",       icon: "🧠" },
  EMERGENCY_MEDICAL:{ label: "Emergency Medical",   icon: "🚑" },
  TRAVEL_ACCIDENT:  { label: "Travel Accident",     icon: "✈️" },
  EVACUATION:       { label: "Medical Evacuation",  icon: "🚁" },
  LIFE:             { label: "Life",                icon: "❤️" },
  DISABILITY:       { label: "Disability",          icon: "♿" },
  CRITICAL_ILLNESS: { label: "Critical Illness",    icon: "⚕️" },
  WELLNESS:         { label: "Wellness",            icon: "💪" },
  PREVENTIVE:       { label: "Preventive Care",     icon: "🛡️" },
};

/**
 * Lấy label + icon cho một benefit type.
 *
 * Fallback ĐỘNG: nếu type không nằm trong map ở trên,
 * tự chuyển "SOME_BENEFIT_TYPE" → "Some Benefit Type" + icon mặc định.
 * Không cần biết trước tất cả giá trị có thể có.
 */
export function getBenefitMeta(rawType: string): { label: string; icon: string } {
  const key = rawType.toUpperCase().replace(/[\s-]+/g, "_");
  if (key in BENEFIT_DISPLAY) return BENEFIT_DISPLAY[key];

  // Fallback động: split theo _, title-case từng word
  const label = rawType
    .replace(/[_-]+/g, " ")
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ")
    .trim();

  return { label: label || rawType, icon: "📋" };
}

// ─── 5. DYNAMIC LIMIT KEY MAPPER ─────────────────────────────────────────────
//
// Nguyên tắc: KHÔNG hardcode danh sách tên sub-benefit.
// Thay vào đó, phát hiện mọi key dạng "limit_per_*" hay "max_*"
// bằng regex pattern matching trên object thật.

// Pattern regex để nhận diện các key giới hạn tiền tệ
const MONETARY_LIMIT_PATTERN = /^limit_(?:per|for)_(\w+)$/;
// Pattern regex để nhận diện các key "max_*" (số lần/ngày)
const MAX_QUALIFIER_PATTERN   = /^max_(\w+)$/;
// Pattern regex để nhận diện "visits/count qualifier"
const COUNT_QUALIFIER_PATTERN = /^(\w+?)s?_per_year$|^visits_per_year$/;

/**
 * Mô tả một giới hạn đã được chuẩn hóa từ một sub-benefit.
 */
export interface ParsedLimit {
  /** Key gốc trong JSON, ví dụ "limit_per_day" */
  rawKey: string;
  /** Nhãn đọc được, ví dụ "per day", "per event", "per pregnancy" */
  humanLabel: string;
  /** Giá trị tiền tệ */
  amount: number;
  /**
   * Qualifier bổ sung, ví dụ "max 120 days", "30 visits/year"
   * Được phát hiện động từ các key "max_*" hay "*_per_year" trên cùng object
   */
  qualifier?: string;
}

/**
 * Chuyển một key dạng "limit_per_day" → nhãn "per day"
 * bằng cách extract phần sau "limit_per_" và replace "_" → " ".
 *
 * Không cần biết trước danh sách key có thể có.
 */
function keyToHumanLabel(key: string): string {
  const match = MONETARY_LIMIT_PATTERN.exec(key);
  if (match) {
    // "limit_per_day" → "day" → "per day"
    // "limit_per_pregnancy" → "pregnancy" → "per pregnancy"
    return `per ${match[1].replace(/_/g, " ")}`;
  }
  // Fallback: replace _ → space, bỏ prefix "limit_"
  return key.replace(/^limit_/, "").replace(/_/g, " ");
}

/**
 * Tìm tất cả qualifier bổ sung từ một sub-benefit object.
 * Phát hiện động, không biết trước tên field.
 *
 * Logic:
 * 1. Tìm mọi key dạng "max_*" có giá trị number → "max N <unit>"
 * 2. Tìm mọi key dạng "*_per_year" / "visits_per_year" → "N <unit>/year"
 */
function findQualifiers(obj: Record<string, unknown>): string[] {
  const qualifiers: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value !== "number") continue;

    // "max_days" → "max 30 days"
    const maxMatch = MAX_QUALIFIER_PATTERN.exec(key);
    if (maxMatch) {
      const unit = maxMatch[1].replace(/_/g, " ");
      qualifiers.push(`max ${value} ${unit}`);
      continue;
    }

    // "visits_per_year" → "30 visits/year"
    // "sessions_per_year" → "10 sessions/year"
    const countMatch = COUNT_QUALIFIER_PATTERN.exec(key);
    if (countMatch) {
      const unit = key.replace(/_per_year$/, "").replace(/_/g, " ");
      qualifiers.push(`${value} ${unit}/year`);
      continue;
    }
  }

  return qualifiers;
}

/**
 * Phân tích toàn bộ giới hạn từ một sub-benefit object.
 *
 * Phát hiện ĐỘNG tất cả key dạng limit_per_* bằng regex —
 * không hardcode danh sách key, không hardcode tên sub-benefit.
 *
 * @param subBenefitObj  Sub-benefit thô từ JSON (Record<string, unknown>)
 * @returns              Mảng ParsedLimit đã chuẩn hóa
 */
export function parseLimitKeys(subBenefitObj: Record<string, unknown>): ParsedLimit[] {
  const qualifiers = findQualifiers(subBenefitObj);
  const limits: ParsedLimit[] = [];

  for (const [key, value] of Object.entries(subBenefitObj)) {
    if (typeof value !== "number") continue;
    if (!MONETARY_LIMIT_PATTERN.test(key)) continue;

    limits.push({
      rawKey: key,
      humanLabel: keyToHumanLabel(key),
      amount: value,
      // Gán qualifier vào limit đầu tiên tìm được (thường chỉ có 1 monetary limit / sub-benefit)
      qualifier: limits.length === 0 && qualifiers.length > 0
        ? qualifiers.join(", ")
        : undefined,
    });
  }

  return limits;
}

// ─── 6. NETWORK TYPE LABEL ───────────────────────────────────────────────────

const NETWORK_TYPE_LABELS: Record<string, string> = {
  PREFERRED_PROVIDER: "Preferred Provider Organization (PPO)",
  HMO:                "Health Maintenance Organization (HMO)",
  EPO:                "Exclusive Provider Organization (EPO)",
  OPEN:               "Open Network",
  GLOBAL:             "Global Network",
};

export function getNetworkTypeLabel(type: string): string {
  const key = type.toUpperCase().replace(/[\s-]+/g, "_");
  // Fallback động: title-case nếu không có trong map
  return NETWORK_TYPE_LABELS[key] ?? getBenefitMeta(type).label;
}

// ─── 7. SMALL UTILITIES ──────────────────────────────────────────────────────

export const formatPercent = (n: number): string => `${n}%`;
export const formatDays    = (n: number): string => `${n} day${n !== 1 ? "s" : ""}`;
export const formatCount   = (n: number, unit: string): string =>
  `${n.toLocaleString()} ${unit}${n !== 1 ? "s" : ""}`;
