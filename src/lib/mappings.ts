import type {
  FarmerData,
  EnterpriseData,
  YouthData,
} from '@/data/mockData';

/**
 * Helper: return the first non-empty value for any of the candidate keys.
 */
function pick(
  row: Record<string, string>,
  candidates: string[],
  fallback = ''
): string {
  for (const key of candidates) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return fallback;
}

/**
 * Helper to parse number safely.
 */
function toNumber(raw: string, fallback = 0): number {
  const v = parseFloat(raw.replace(/,/g, ''));
  return Number.isFinite(v) ? v : fallback;
}

/**
 * Helper to normalise status field.
 */
function mapStatus(raw: string): FarmerData['status'] {
  const s = raw.toLowerCase();
  if (s.includes('approve')) return 'Approved';
  if (s.includes('pending') || s.includes('in review')) return 'Pending';
  if (s.includes('reject') || s.includes('fail')) return 'Rejected';
  // default bucket
  return 'Pending';
}

/**
 * Helper to normalise gender field.
 */
function mapGender(raw: string): 'Male' | 'Female' {
  const g = raw.toLowerCase();
  if (g.startsWith('f')) return 'Female';
  if (g.startsWith('m')) return 'Male';
  return 'Male';
}

/**
 * FARMER ROW MAPPING
 *
 * Adjust the candidate header names in the arrays below so they match
 * your actual Google Sheet headers exactly.
 */
export function mapFarmerRow(row: Record<string, string>): FarmerData {
  const id =
    pick(row, ['ID', 'Farmer ID', 'Submission ID', 'DB1']) ||
    `F-${Math.random().toString(36).slice(2, 8)}`;

  const submissionDate = pick(row, [
    'SubmissionDate',
    'Submission Date',
    'Date of interview',
    'Interview Date',
    'start',
  ]);

  const region = pick(row, ['Region', 'Province', 'Region/Province']);
  const district = pick(row, ['District', 'County', 'ADM2']);
  const genderRaw = pick(row, ['Gender', 'Sex of respondent', 'DB7']);
  const ageGroup = pick(row, ['Age category', 'Age Group', 'DB6']);
  const statusRaw = pick(row, ['QC Status', 'Status', 'QC_flag']);

  const farmerName = pick(row, [
    'Name of the Participant reached',
    'Farmer Name',
    'Respondent name',
    'E1',
  ]);

  const farmSizeRaw = pick(row, [
    'Total land cultivated (ha)',
    'Farm size (Ha)',
    'FM6_TotalLand',
  ]);
  const cropType = pick(row, [
    'Main crop',
    'Focus crop',
    'FM2_Crop',
  ]);
  const yieldRaw = pick(row, [
    'Total production (kg)',
    'Yield (kg)',
    'FM6_Yield',
  ]);

  const inputAccessRaw = pick(row, [
    'Has access to inputs',
    'InputAccess',
    'Received inputs',
  ]);

  const latitudeRaw = pick(row, ['Latitude', '_A5_lat']);
  const longitudeRaw = pick(row, ['Longitude', '_A5_lon']);
  const enumerator = pick(row, [
    'Enumerator name',
    'A1. Enumerator ID',
    'Enumerator',
  ]);

  return {
    id,
    submissionDate,
    region,
    district,
    gender: mapGender(genderRaw),
    ageGroup: ageGroup || 'Unknown',
    status: mapStatus(statusRaw),
    latitude: toNumber(latitudeRaw, 0),
    longitude: toNumber(longitudeRaw, 0),
    enumerator: enumerator || 'Unknown',
    farmerName: farmerName || 'Unknown Farmer',
    farmSize: toNumber(farmSizeRaw, 0),
    cropType: cropType || 'N/A',
    yieldEstimate: toNumber(yieldRaw, 0),
    inputAccess: /1|yes|true/i.test(inputAccessRaw),
  };
}

/**
 * ENTERPRISE ROW MAPPING
 */
export function mapEnterpriseRow(
  row: Record<string, string>
): EnterpriseData {
  const id =
    pick(row, ['ID', 'Enterprise ID', 'DB1']) ||
    `E-${Math.random().toString(36).slice(2, 8)}`;

  const submissionDate = pick(row, [
    'SubmissionDate',
    'Submission Date',
    'Interview Date',
    'start',
  ]);

  const region = pick(row, ['Region', 'Province', 'Region/Province']);
  const district = pick(row, ['District', 'County', 'ADM2']);

  const genderRaw = pick(row, [
    'Gender of the owner',
    'Owner gender',
    'B1',
  ]);
  const statusRaw = pick(row, ['QC Status', 'Status', 'QC_flag']);

  const enterpriseName = pick(row, [
    'Name of enterprise',
    'Company name',
    'B6',
  ]);
  const businessType = pick(row, [
    'Main activity',
    'Type of services',
    'B7',
    'B8',
  ]);

  const employeesRaw = pick(row, [
    'Number of employees',
    'Total employees',
    'C1',
  ]);
  const revenueRaw = pick(row, [
    'Annual revenue (local currency)',
    'Annual revenue',
    'C3',
  ]);
  const yearsOperatingRaw = pick(row, [
    'Year started operations',
    'B9',
  ]);

  const latitudeRaw = pick(row, ['Latitude', '_A5_lat']);
  const longitudeRaw = pick(row, ['Longitude', '_A5_lon']);
  const enumerator = pick(row, [
    'Enumerator name',
    'A1. Enumerator ID',
    'Enumerator',
  ]);

  const startYear = toNumber(yearsOperatingRaw);
  const currentYear = new Date().getFullYear();
  const yearsOperating =
    startYear > 0 && startYear <= currentYear
      ? currentYear - startYear
      : 0;

  return {
    id,
    submissionDate,
    region,
    district,
    gender: mapGender(genderRaw),
    ageGroup: '', // not always available for enterprises
    status: mapStatus(statusRaw),
    latitude: toNumber(latitudeRaw, 0),
    longitude: toNumber(longitudeRaw, 0),
    enumerator: enumerator || 'Unknown',

    enterpriseName: enterpriseName || 'Unknown Enterprise',
    businessType: businessType || 'N/A',
    employees: Math.max(0, Math.round(toNumber(employeesRaw))),
    annualRevenue: Math.max(0, toNumber(revenueRaw)),
    yearsOperating,
  };
}

/**
 * YOUTH ROW MAPPING
 */
export function mapYouthRow(row: Record<string, string>): YouthData {
  const id =
    pick(row, ['ID', 'Participant ID', 'DB1']) ||
    `Y-${Math.random().toString(36).slice(2, 8)}`;

  const submissionDate = pick(row, [
    'SubmissionDate',
    'Submission Date',
    'Interview Date',
    'start',
  ]);

  const region = pick(row, ['Region', 'Province', 'Region/Province']);
  const district = pick(row, ['District', 'County', 'ADM2']);
  const genderRaw = pick(row, ['Gender', 'DB7']);
  const ageGroup = pick(row, ['Age category', 'Age Group', 'DB6']);
  const statusRaw = pick(row, ['QC Status', 'Status', 'QC_flag']);

  const youthName = pick(row, [
    'Name of the Participant reached',
    'Respondent name',
    'E1',
  ]);

  const educationLevel = pick(row, [
    'Highest level of education',
    'Education Level',
    'E7',
    'E8',
  ]);

  const trainingCompletedRaw = pick(row, [
    'Training status',
    'Has completed training',
    'OBS10',
  ]);
  const employmentStatus = pick(row, [
    'Main occupation',
    'Employment status',
    'Youth employment status',
  ]);

  const businessIdea = pick(row, [
    'Business idea',
    'Proposed business',
    'Youth business description',
  ]);

  const latitudeRaw = pick(row, ['Latitude', '_A5_lat']);
  const longitudeRaw = pick(row, ['Longitude', '_A5_lon']);
  const enumerator = pick(row, [
    'Enumerator name',
    'A1. Enumerator ID',
    'Enumerator',
  ]);

  return {
    id,
    submissionDate,
    region,
    district,
    gender: mapGender(genderRaw),
    ageGroup: ageGroup || 'Unknown',
    status: mapStatus(statusRaw),
    latitude: toNumber(latitudeRaw, 0),
    longitude: toNumber(longitudeRaw, 0),
    enumerator: enumerator || 'Unknown',

    youthName: youthName || 'Unknown Youth',
    educationLevel: educationLevel || 'N/A',
    trainingCompleted: /1|yes|true|completed/i.test(trainingCompletedRaw),
    employmentStatus: employmentStatus || 'N/A',
    businessIdea: businessIdea || '',
  };
}
