// src/data/normalizers.ts
// FINAL VERSION WITH GPS STRING PARSING

import { FarmerData, EnterpriseData, YouthData } from './mockData';
import { SheetRow } from '@/lib/googleSheets';

const toLowerKeyed = (row: SheetRow) => {
  const lowered: Record<string, string> = {};
  Object.entries(row).forEach(([key, value]) => {
    lowered[key.toLowerCase()] = String(value || '');
  });
  return lowered;
};

const pickValue = (row: SheetRow, keys: string[], fallback = ''): string => {
  const lowered = toLowerKeyed(row);
  for (const key of keys) {
    const lowerKey = key.toLowerCase();
    if (row[key] !== undefined && row[key] !== '' && row[key] != null) return String(row[key]);
    if (lowered[lowerKey] !== undefined && lowered[lowerKey] !== '' && lowered[lowerKey] !== 'null') {
      return lowered[lowerKey];
    }
  }
  return fallback;
};

const parseNumber = (value: string | undefined, fallback = 0): number => {
  if (value === undefined || value === '' || value === null) return fallback;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

// NEW: Parses your GPS format "-2.218513 30.042789 1409.0 4.073"
const parseGpsString = (gps: string): { lat: number; lng: number } => {
  if (!gps || typeof gps !== 'string') return { lat: 0, lng: 0 };
  const parts = gps.trim().split(/\s+/);
  if (parts.length >= 2) {
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }
  return { lat: 0, lng: 0 };
};

// Correctly handles your real text column: "Approved" or "Not Approved"
const normalizeApprovalStatus = (value: string): 'Approved' | 'Not Approved' | 'Pending' => {
  const val = String(value || '').trim();
  if (!val || val === 'null' || val === 'undefined') return 'Pending';
  if (val.toLowerCase().includes('approved')) return 'Approved';
  if (val.toLowerCase().includes('not approved') || val.toLowerCase().includes('rejected')) return 'Not Approved';
  return 'Pending';
};

export const normalizeSubmissionDate = (row: SheetRow) =>
  pickValue(row, ['SubmissionDate', 'submission_date', 'submissiondate', 'today', 'start', 'starttime']);

// YOUTH NORMALIZER — FIXED WITH GPS
export function normalizeYouthRow(row: SheetRow, index: number): YouthData {
  const submissionDate = normalizeSubmissionDate(row);
  const country = pickValue(row, ['country', 'int_country']);
  const region = pickValue(row, ['region']);
  const district = pickValue(row, ['district']);
  const gender = pickValue(row, ['gender', 'sex', 'sex_id'], 'Unknown');

  // CRITICAL: "QC Approval Status" MUST be first in the list
  const rawStatus = pickValue(row, [
    'QC Approval Status',      // ← Your real column — comes FIRST
    'qc_approval_status',
    'QC Approval status',
    'status',
    'review_quality',          // ← Old numeric score — ignored now
    'status_com'
  ], '');

  const status = normalizeApprovalStatus(rawStatus);

  // NEW: GPS parsing for your format
  const gpsRaw = pickValue(row, ['D8-Latitude', 'gps', '_gps_latitude', '_gps', 'gps_location']);
  const { lat: youthLat, lng: youthLng } = gpsRaw ? parseGpsString(gpsRaw) : { lat: 0, lng: 0 };

  return {
    id: pickValue(row, ['id', 'caseid', 'case_id', 'uuid', 'KEY'], `youth-${index + 1}`),
    youthName: pickValue(row, ['youthName', 'name', 'participants'], 'Unknown youth'),
    submissionDate,
    country: country || 'Unknown country',
    region: region || 'Unknown region',
    district: district || 'Unknown district',
    gender: (gender.charAt(0).toUpperCase() + gender.slice(1)) as YouthData['gender'],
    ageGroup: pickValue(row, ['agegroup', 'age'], '15-29'),
    status: status as YouthData['status'],
    latitude: youthLat,
    longitude: youthLng,
    enumerator: pickValue(row, ['enumerator', 'users', 'partner_id', 'int_name', 'enu_id'], 'Unknown'),
    educationLevel: pickValue(row, ['educationLevel', 'education', 'education_level'], 'N/A'),
    trainingCompleted: pickValue(row, ['service'], '').toLowerCase().includes('training'),
    employmentStatus: pickValue(row, ['employmentStatus', 'employment_status'], 'N/A'),
    businessIdea: pickValue(row, ['businessIdea', 'service', 'chain'], 'N/A'),
  };
}

// FARMER NORMALIZER — FIXED WITH GPS
export function normalizeFarmerRow(row: SheetRow, index: number): FarmerData {
  const submissionDate = normalizeSubmissionDate(row);
  const country = pickValue(row, ['dccot', 'country', 'dcountry']);
  const region = pickValue(row, ['region', 'db11', 'province']);
  const district = pickValue(row, ['district', 'db10']);
  const gender = pickValue(row, ['gender', 'sex', 'e5'], 'Unknown');
  const ageGroup = pickValue(row, ['agegroup', 'd6', 'age']);

  const fm2Raw = pickValue(row, ['fm2'], '').trim();
  const cropCodes = fm2Raw ? fm2Raw.split(/\s+/) : [];
  const FM2_CROP_MAP: Record<string, string> = {
    '1': 'Maize', '2': 'Soybean', '3': 'Rice', '4': 'Sunflower', '5': 'Chilli',
    '6': 'Poultry', '7': 'Groundnuts', '8': 'Beans', '9': 'Potato', '10': 'Other', '11': 'Refused',
  };
  const cropsCultivated = cropCodes.map(code => FM2_CROP_MAP[code] ?? code);
  const mainCrop = cropsCultivated[0] ?? 'N/A';

  const cropLandFields = Array.from({ length: 15 }, (_, i) => `fm6_${i + 1}`);
  const totalFarmSize = cropLandFields
    .map(f => parseNumber(pickValue(row, [f]), 0))
    .reduce((sum, v) => sum + v, 0);

  // Status — "QC Approval Status" first
  const rawStatus = pickValue(row, [
    'QC Approval Status',
    'qc_approval_status',
    'status',
    'review_quality',
    'status_com'
  ], '');
  const status = normalizeApprovalStatus(rawStatus);

  // NEW: GPS parsing for your format
  const gpsRaw = pickValue(row, ['gps', 'gps_location', '_gps', 'gps-Latitude']);
  const { lat: farmerLat, lng: farmerLng } = gpsRaw ? parseGpsString(gpsRaw) : { lat: 0, lng: 0 };

  return {
    id: pickValue(row, ['id', 'caseid', 'case_id', 'uuid'], `farmer-${index + 1}`),
    farmerName: pickValue(row, ['farmerName', 'db2label', 'db2', 'name'], 'Unknown farmer'),
    submissionDate,
    country: country || 'Unknown country',
    region: region || 'Unknown region',
    district: district || 'Unknown district',
    gender: (gender.charAt(0).toUpperCase() + gender.slice(1)) as FarmerData['gender'],
    ageGroup: ageGroup || 'N/A',
    status: status as FarmerData['status'],
    latitude: farmerLat,
    longitude: farmerLng,
    enumerator: pickValue(row, ['enumerator', 'username', 'users', 'int_name'], 'Unknown'),
    farmSize: totalFarmSize || parseNumber(pickValue(row, ['farmSize', 'fm6_1', 'fm6']), 0),
    cropType: mainCrop,
    yieldEstimate: parseNumber(pickValue(row, ['yieldEstimate', 'fm26_1_1', 'yield']), 0),
    inputAccess: pickValue(row, ['inputAccess', 'k1', 'input_access'], 'false').toLowerCase() === 'true',
    cropsCultivated,
    isYouth: (ageGroup || '').includes('18') || (ageGroup || '').includes('35'),
    youthAttitudeScore: undefined,
  };
}

// ENTERPRISE NORMALIZER — FIXED WITH GPS
export function normalizeEnterpriseRow(row: SheetRow, index: number): EnterpriseData {
  const submissionDate = normalizeSubmissionDate(row);
  const country = pickValue(row, ['A1_cal', 'country']);
  const region = pickValue(row, ['region', 'db1_q', 'province']);
  const district = pickValue(row, ['district', 'db0_q']);
  const gender = pickValue(row, ['gender', 'sex', 'a7'], 'Unknown');

  // Status — "QC Approval Status" first
  const rawStatus = pickValue(row, [
    'QC Approval Status',
    'qc_approval_status',
    'status',
    'review_quality',
    'status_com'
  ], '');
  const status = normalizeApprovalStatus(rawStatus);

  // NEW: GPS parsing for your format
  const gpsRaw = pickValue(row, ['outlet_gps', 'gps', '_gps', 'gps_location']);
  const { lat: entLat, lng: entLng } = gpsRaw ? parseGpsString(gpsRaw) : { lat: 0, lng: 0 };

  return {
    id: pickValue(row, ['id', 'caseid', 'case_id', 'id_num'], `enterprise-${index + 1}`),
    enterpriseName: pickValue(row, ['enterpriseName', 'db8_q', 'db8_1', 'a2', 'name'], 'Unknown enterprise'),
    submissionDate,
    country: country || 'Unknown country',
    region: region || 'Unknown region',
    district: district || 'Unknown district',
    gender: (gender.charAt(0).toUpperCase() + gender.slice(1)) as EnterpriseData['gender'],
    ageGroup: pickValue(row, ['agegroup', 'a3_1', 'years_operating'], 'N/A'),
    status: status as EnterpriseData['status'],
    latitude: entLat,
    longitude: entLng,
    enumerator: pickValue(row, ['enumerator', 'int_name', 'survey_firm'], 'Unknown'),
    businessType: pickValue(row, ['businessType', 'a4', 'a2', 'sector'], 'N/A'),
    employees: parseNumber(pickValue(row, ['employees', 'b5_q1', 'b5_q2']), 0),
    annualRevenue: parseNumber(pickValue(row, ['annualRevenue', 'b15_cal', 'b15_q']), 0),
    yearsOperating: parseNumber(pickValue(row, ['yearsOperating', 'b9_year', 'b10_year']), 0),
  };
}
