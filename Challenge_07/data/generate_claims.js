import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SEED = 42;
const ROW_COUNT = 5_000;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const outputs = [
  resolve(scriptDir, 'claims.csv'),
  resolve(scriptDir, '../public/claims.csv'),
];

const CLAIM_TYPES = ['OUTPATIENT', 'INPATIENT', 'DENTAL', 'MATERNITY'];
const TYPE_PROBS = [0.65, 0.15, 0.12, 0.08];
const STATUSES = ['APPROVED', 'REJECTED', 'PENDING', 'IN_REVIEW'];
const COUNTRIES = ['Thailand', 'Vietnam', 'Hong Kong'];
const COUNTRY_PROBS = [0.4, 0.35, 0.25];
const INSURERS = ['Aurora Assurance', 'Pacific Shield', 'Mekong Life'];
const ASSESSORS = ['Somchai P.', 'Nguyen Thi Lan', 'Chen Wei', 'Pichaya K.', 'Tran Van Minh'];
const ASSESSOR_PROBS = [0.22, 0.22, 0.22, 0.18, 0.16];
const ICD_BY_TYPE = {
  OUTPATIENT: ['J06.9', 'A09', 'K29.7', 'I10', 'E11.9', 'M54.5', 'R50.9', 'N39.0'],
  INPATIENT: ['A90', 'J18.9', 'K35.8', 'I21.9', 'S72.0'],
  DENTAL: ['K02.9', 'K05.1', 'K04.7', 'K08.1'],
  MATERNITY: ['O80', 'O82', 'Z34.0'],
};
const SEASONAL = {
  A90: [6, 7, 8, 9],
  'J06.9': [11, 12, 1, 2],
  'J18.9': [11, 12, 1, 2],
};
const AMOUNT_PARAMS = {
  OUTPATIENT: [2500, 0.7],
  DENTAL: [4000, 0.6],
  MATERNITY: [60000, 0.8],
  INPATIENT: [80000, 1.0],
};
const PROC_MEAN = {
  OUTPATIENT: 6,
  DENTAL: 5.5,
  INPATIENT: 8.5,
  MATERNITY: 9,
};
const THAI_FIRST = ['Somchai', 'Somsak', 'Nattaporn', 'Wilaiporn', 'Preecha', 'Kanya', 'Phirun', 'Siriporn', 'Anong', 'Boonmee'];
const THAI_LAST = ['Srisuk', 'Thongchai', 'Nakorn', 'Phimchan', 'Kerdpol', 'Wongpan', 'Saengchan', 'Boonsong'];
const VIET_FIRST = ['Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Phan', 'Vu', 'Dang'];
const VIET_MID = ['Van', 'Thi', 'Duc', 'Minh', 'Quoc', 'Thanh', 'Tuan', 'Hai'];
const VIET_LAST = ['An', 'Binh', 'Cuong', 'Dung', 'Giang', 'Hung', 'Khanh', 'Linh', 'Nam', 'Phong'];
const HK_FIRST = ['Wei', 'Fang', 'Ming', 'Jia', 'Hao', 'Xiu', 'Zhen', 'Rui', 'Ling', 'Jun'];
const HK_LAST = ['Chan', 'Wong', 'Lee', 'Lau', 'Cheung', 'Tang', 'Ho', 'Ng', 'Yip', 'Chow'];

function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

const random = createRandom(SEED);

function choose(values, probabilities) {
  const target = random();
  let cumulative = 0;
  for (let index = 0; index < values.length; index += 1) {
    cumulative += probabilities[index];
    if (target < cumulative) return values[index];
  }
  return values[values.length - 1];
}

function chooseUniform(values) {
  return values[Math.floor(random() * values.length)];
}

function normal() {
  const u1 = Math.max(random(), Number.EPSILON);
  const u2 = random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function gamma(shape, scale) {
  if (shape < 1) return gamma(shape + 1, scale) * random() ** (1 / shape);
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  while (true) {
    const gaussian = normal();
    const value = 1 + c * gaussian;
    if (value <= 0) continue;
    const cube = value ** 3;
    const sample = random();
    if (sample < 1 - 0.0331 * gaussian ** 4) return scale * d * cube;
    if (Math.log(sample) < 0.5 * (value ** 2 - 1) + d * (1 - cube + Math.log(cube))) {
      return scale * d * cube;
    }
  }
}

function makeName(country) {
  if (country === 'Thailand') return `${chooseUniform(THAI_FIRST)} ${chooseUniform(THAI_LAST)}`;
  if (country === 'Vietnam') return `${chooseUniform(VIET_FIRST)} ${chooseUniform(VIET_MID)} ${chooseUniform(VIET_LAST)}`;
  return `${chooseUniform(HK_LAST)} ${chooseUniform(HK_FIRST)}`;
}

function dateString(date) {
  return date.toISOString().slice(0, 10);
}

function sampleSubmittedDate(weights, totalWeight) {
  const target = random() * totalWeight;
  let cumulative = 0;
  for (let index = 0; index < weights.length; index += 1) {
    cumulative += weights[index];
    if (target < cumulative) return new Date(Date.UTC(2024, 0, 1 + index));
  }
  return new Date(Date.UTC(2024, 11, 31));
}

function sampleStatus(insurer) {
  const probabilities = insurer === 'Pacific Shield'
    ? [0.62, 0.22, 0.09, 0.07]
    : [0.71, 0.12, 0.09, 0.08];
  return choose(STATUSES, probabilities);
}

function sampleAmount(claimType, icdCode) {
  const [median, sigma] = AMOUNT_PARAMS[claimType];
  let amount = Math.exp(Math.log(median) + sigma * normal());
  if (icdCode === 'O82') amount *= 1.5;
  amount = Math.max(500, Math.min(2_000_000, amount));
  return Math.round(amount / 50) * 50;
}

function sampleProcessingDays(claimType, status, assessor) {
  let mean = PROC_MEAN[claimType];
  if (status === 'REJECTED') mean *= 0.85;
  if (assessor === 'Chen Wei') mean *= 1.35;
  const std = mean * 0.8;
  const shape = (mean / std) ** 2;
  const scale = (std ** 2) / mean;
  return Math.max(1, Math.min(30, Math.round(gamma(shape, scale))));
}

function generateClaims() {
  const claims = [];
  const policyPool = Array.from({ length: 3000 }, (_, index) => `POL-${String(index + 1).padStart(5, '0')}`);
  const dateWeights = [];
  let totalDateWeight = 0;
  for (let day = 0; day < 366; day += 1) {
    const date = new Date(Date.UTC(2024, 0, 1 + day));
    const weekday = date.getUTCDay();
    const weight = (weekday === 0 || weekday === 6 ? 0.4 : 1) * (1 + 0.3 * day / 366);
    dateWeights.push(weight);
    totalDateWeight += weight;
  }

  for (let index = 0; index < ROW_COUNT; index += 1) {
    const claimType = choose(CLAIM_TYPES, TYPE_PROBS);
    const country = choose(COUNTRIES, COUNTRY_PROBS);
    const insurerProbabilities = country === 'Thailand'
      ? [0.55, 0.30, 0.15]
      : country === 'Vietnam' ? [0.25, 0.55, 0.20] : [0.20, 0.25, 0.55];
    const insurer = choose(INSURERS, insurerProbabilities);
    const assessor = choose(ASSESSORS, ASSESSOR_PROBS);
    const submittedDate = sampleSubmittedDate(dateWeights, totalDateWeight);
    const month = submittedDate.getUTCMonth() + 1;
    const icdCodes = ICD_BY_TYPE[claimType];
    const icdWeights = icdCodes.map((code) => (SEASONAL[code]?.includes(month) ? 3 : 1));
    const icdCode = choose(icdCodes, icdWeights.map((weight) => weight / icdWeights.reduce((sum, item) => sum + item, 0)));
    let status = sampleStatus(insurer);
    if (month === 12 && ['APPROVED', 'REJECTED'].includes(status) && random() < 0.35) {
      status = choose(['PENDING', 'IN_REVIEW'], [0.5, 0.5]);
    }

    const [submittedYear, submittedMonth, submittedDay] = dateString(submittedDate).split('-').map(Number);
    let submittedAmount = sampleAmount(claimType, icdCode);
    if (country === 'Hong Kong') submittedAmount = Math.min(2_000_000, Math.round(submittedAmount * 1.3 / 50) * 50);
    let approvedAmount = 0;
    if (status === 'APPROVED') {
      approvedAmount = random() < 0.85
        ? submittedAmount
        : Math.round(submittedAmount * (0.6 + random() * 0.35) / 50) * 50;
    }

    let processedDate = '';
    if (status === 'APPROVED' || status === 'REJECTED') {
      const processed = new Date(Date.UTC(submittedYear, submittedMonth - 1, submittedDay));
      processed.setUTCDate(processed.getUTCDate() + sampleProcessingDays(claimType, status, assessor));
      processedDate = dateString(processed);
    }

    claims.push({
      claim_id: `CLM-${String(index + 1).padStart(5, '0')}`,
      policy_id: chooseUniform(policyPool),
      member_name: makeName(country),
      country,
      insurer,
      assessor,
      claim_type: claimType,
      icd_code: icdCode,
      status,
      submitted_amount: submittedAmount,
      approved_amount: approvedAmount,
      submitted_date: dateString(submittedDate),
      processed_date: processedDate,
    });
  }

  const outlierCandidates = claims.filter((claim) =>
    ['I21.9', 'S72.0', 'O82'].includes(claim.icd_code) && claim.status === 'APPROVED'
  );
  const outlierCount = Math.min(15, outlierCandidates.length);
  for (let index = 0; index < outlierCount; index += 1) {
    const swapIndex = index + Math.floor(random() * (outlierCandidates.length - index));
    [outlierCandidates[index], outlierCandidates[swapIndex]] = [outlierCandidates[swapIndex], outlierCandidates[index]];
    const claim = outlierCandidates[index];
    claim.submitted_amount = Math.round((500_000 + random() * 1_500_000) / 50) * 50;
    if (claim.country === 'Hong Kong') claim.submitted_amount = Math.min(2_000_000, Math.round(claim.submitted_amount * 1.3 / 50) * 50);
    claim.approved_amount = random() < 0.85
      ? claim.submitted_amount
      : Math.round(claim.submitted_amount * (0.6 + random() * 0.35) / 50) * 50;
  }

  return claims;
}

function validateClaims(claims) {
  if (claims.length !== ROW_COUNT) throw new Error(`Expected ${ROW_COUNT} rows, got ${claims.length}`);
  if (new Set(claims.map((claim) => claim.claim_id)).size !== ROW_COUNT) throw new Error('Duplicate claim IDs');
  for (const claim of claims) {
    if (claim.submitted_amount < 500 || claim.submitted_amount > 2_000_000) throw new Error('Submitted amount out of range');
    if (claim.approved_amount > claim.submitted_amount) throw new Error('Approved amount exceeds submitted amount');
    if (claim.status !== 'APPROVED' && claim.approved_amount !== 0) throw new Error('Non-approved claim has an approved amount');
    if (['PENDING', 'IN_REVIEW'].includes(claim.status) && claim.processed_date) throw new Error('Unresolved claim has a processed date');
    if (claim.processed_date) {
      const days = (Date.parse(`${claim.processed_date}T00:00:00Z`) - Date.parse(`${claim.submitted_date}T00:00:00Z`)) / 86_400_000;
      if (days < 1 || days > 30) throw new Error('Processing days outside [1, 30]');
    }
  }
  const rejectedRate = claims.filter((claim) => claim.status === 'REJECTED').length / claims.length * 100;
  if (Math.abs(rejectedRate - 15) > 2) throw new Error(`Rejection rate ${rejectedRate.toFixed(1)}% outside expected range`);
}

function toCsv(claims) {
  const columns = Object.keys(claims[0]);
  const escape = (value) => {
    const text = String(value);
    return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  return `${columns.join(',')}\n${claims.map((claim) => columns.map((column) => escape(claim[column])).join(',')).join('\n')}\n`;
}

const claims = generateClaims();
validateClaims(claims);
const csv = toCsv(claims);
for (const output of outputs) {
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, csv);
  console.log(`Saved ${claims.length.toLocaleString()} rows: ${output}`);
}
console.log('Validation passed.');