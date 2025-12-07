import type { FarmerData, EnterpriseData, YouthData } from '@/data/mockData';

// Helper functions
function pick(row: Record<string, string>, candidates: string[], fallback = ''): string {
  for (const key of candidates) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return fallback;
}

function toNumber(raw: string, fallback = 0): number {
  const v = parseFloat(raw.replace(/,/g, ''));
  return Number.isFinite(v) ? v : fallback;
}

function mapStatus(raw: string): 'Approved' | 'Pending' | 'Rejected' {
  const s = raw.toLowerCase();
  if (s.includes('approve')) return 'Approved';
  if (s.includes('pending') || s.includes('review')) return 'Pending';
  if (s.includes('reject') || s.includes('fail')) return 'Rejected';
  return 'Pending';
}

function mapGender(raw: string): 'Male' | 'Female' {
  const g = raw.toLowerCase();
  if (g.startsWith('f')) return 'Female';
  if (g.startsWith('m')) return 'Male';
  return 'Male';
}

// ==========================================
// FARMER MAPPER
// ==========================================
export function mapFarmerRow(row: Record<string, string>): FarmerData {
  const id = pick(row, ['KEY', 'caseid', 'db1']) || `F-${Math.random().toString(36).slice(2, 8)}`;

  const submissionDate = pick(row, ['SubmissionDate', 'date', 'starttime']);
  const region = pick(row, ['dccot', 'e2', 'Region']);
  const district = pick(row, ['dcman', 'e3', 'District']);

  const genderRaw = pick(row, ['db7', 'd4', 'Gender']);
  const ageGroup = pick(row, ['db6', 'd3', 'Age category']);

  const farmerName = pick(row, ['db2', 'd1', 'e1', 'Farmer Name']);
  const farmSizeRaw = pick(row, ['fm7calc', 'fm7', 'e5']);
  const cropType = pick(row, ['fm2', 'Main crop']);

  const yieldRaw = pick(row, ['calcfm6_1', 'fm6_1', 'fm26_1_1']);

  const inputAccessRaw = pick(row, ['k1', 'fm10', 'Has access to inputs']);

  const latitudeRaw = pick(row, ['d8.Latitude', 'Latitude']);
  const longitudeRaw = pick(row, ['d8.Longitude', 'Longitude']);
  const enumerator = pick(row, ['dcorg', 'username', 'Enumerator']);

  return {
    id,
    submissionDate,
    region,
    district,
    gender: mapGender(genderRaw),
    ageGroup: ageGroup || 'Unknown',
    status: 'Pending',
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

// ==========================================
// ENTERPRISE MAPPER
// ==========================================
export function mapEnterpriseRow(row: Record<string, string>): EnterpriseData {
  const id = pick(row, ['KEY', 'Survey_FirmID_num', 'DB1_Q']) || `E-${Math.random().toString(36).slice(2, 8)}`;

  const submissionDate = pick(row, ['SubmissionDate', 'start']);
  const region = pick(row, ['A4', 'DB10_Q', 'Region']);
  const district = pick(row, ['A6', 'DB11_Q', 'District']);

  const genderRaw = pick(row, ['B1_Q', 'DB8_Q', 'Owner gender']);

  const enterpriseName = pick(row, ['B6_Q', 'DB3_Q', 'Enterprise name']);
  const businessType = pick(row, ['B7_Q', 'B8_Q', 'Business type']);

  const employeesRaw = pick(row, ['C1_Q', 'Number of employees']);
  const revenueRaw = pick(row, ['C3_Q', 'Annual revenue']);
  const yearsOperatingRaw = pick(row, ['B9_Year', 'B10_Year']);

  const latitudeRaw = pick(row, ['A3.1', 'Latitude']);
  const longitudeRaw = pick(row, ['A3.2', 'Longitude']);
  const enumerator = pick(row, ['INT_NAME', 'Enumerator']);

  const startYear = toNumber(yearsOperatingRaw);
  const currentYear = new Date().getFullYear();
  const yearsOperating = startYear > 0 && startYear <= currentYear ? currentYear - startYear : 0;

  return {
    id,
    submissionDate,
    region,
    district,
    gender: mapGender(genderRaw),
    ageGroup: '',
    status: 'Pending',
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

// ==========================================
// YOUTH MAPPER
// ==========================================
export function mapYouthRow(row: Record<string, string>): YouthData {
  const id = pick(row, ['KEY', 'caseid', 'id']) || `Y-${Math.random().toString(36).slice(2, 8)}`;

  const submissionDate = pick(row, ['SubmissionDate', 'date', 'starttime']);
  const region = pick(row, ['region', 'int_country']);
  const district = pick(row, ['district', 'sector']);

  const genderRaw = pick(row, ['D4', 'sex', 'Gender']);
  const ageGroup = pick(row, ['D3', 'age', 'agegroup']);

  const youthName = pick(row, ['D1', 'participants', 'Youth name']);
  const educationLevel = pick(row, ['D11', 'Education level']);

  const trainingCompletedRaw = pick(row, ['OBS10', 'Training completed']);
  const employmentStatus = pick(row, ['RS3', 'YW3', 'Employment status']);
  const businessIdea = pick(row, ['RS4', 'Business idea']);

  const latitudeRaw = pick(row, ['D8_Latitude', 'Latitude']);
  const longitudeRaw = pick(row, ['D8_Longitude', 'Longitude']);
  const enumerator = pick(row, ['int_org', 'enu_id', 'Enumerator']);

  return {
    id,
    submissionDate,
    region,
    district,
    gender: mapGender(genderRaw),
    ageGroup: ageGroup || 'Unknown',
    status: 'Pending',
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
