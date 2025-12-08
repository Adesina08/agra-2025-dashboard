import { FarmerData, EnterpriseData, YouthData } from './mockData';
import { SheetRow } from '@/lib/googleSheets';

const toLowerKeyed = (row: SheetRow) => {
  const lowered: Record<string, string> = {};
  Object.entries(row).forEach(([key, value]) => {
    lowered[key.toLowerCase()] = String(value);
  });
  return lowered;
};

const pickValue = (row: SheetRow, keys: string[], fallback = ''): string => {
  const lowered = toLowerKeyed(row);
  for (const key of keys) {
    const lowerKey = key.toLowerCase();
    if (row[key] !== undefined && row[key] !== '') return String(row[key]);
    if (lowered[lowerKey] !== undefined && lowered[lowerKey] !== '') return lowered[lowerKey];
  }
  return fallback;
};

const parseNumber = (value: string | undefined, fallback = 0): number => {
  if (value === undefined) return fallback;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

export const normalizeSubmissionDate = (row: SheetRow) =>
  pickValue(row, ['SubmissionDate', 'submission_date', 'submissiondate', 'today', 'start', 'starttime']);

export function normalizeFarmerRow(row: SheetRow, index: number): FarmerData {
  const submissionDate = normalizeSubmissionDate(row);
  const region = pickValue(row, ['region', 'db11', 'province']);
  const district = pickValue(row, ['district', 'db10']);
  const gender = pickValue(row, ['gender', 'sex', 'e5'], 'Unknown');
  const farmSizeRaw = pickValue(row, ['farmSize', 'fm6_1', 'fm6']);

  return {
    id: pickValue(row, ['id', 'caseid', 'case_id', 'uuid'], `farmer-${index + 1}`),
    farmerName: pickValue(row, ['farmerName', 'db2label', 'db2', 'name'], 'Unknown farmer'),
    submissionDate,
    region: region || 'Unknown region',
    district: district || 'Unknown district',
    gender: (gender.charAt(0).toUpperCase() + gender.slice(1)) as FarmerData['gender'],
    ageGroup: pickValue(row, ['agegroup', 'd6', 'age'], 'N/A'),
    status: pickValue(row, ['status', 'qc status', 'approval'], 'Pending') as FarmerData['status'],
    latitude: parseNumber(pickValue(row, ['lat', 'latitude', 'gps_lat'])),
    longitude: parseNumber(pickValue(row, ['lon', 'longitude', 'gps_lon'])),
    enumerator: pickValue(row, ['enumerator', 'username', 'users', 'int_name'], 'Unknown'),
    farmSize: parseNumber(farmSizeRaw, 0),
    cropType: pickValue(row, ['cropType', 'chain', 'maincrop'], 'N/A'),
    yieldEstimate: parseNumber(pickValue(row, ['yieldEstimate', 'fm26_1_1', 'yield']), 0),
    inputAccess: pickValue(row, ['inputAccess', 'k1', 'input_access'], 'false').toString().toLowerCase() === 'true',
  };
}

export function normalizeEnterpriseRow(row: SheetRow, index: number): EnterpriseData {
  const submissionDate = normalizeSubmissionDate(row);
  const region = pickValue(row, ['region', 'db1_q', 'province']);
  const district = pickValue(row, ['district', 'db0_q']);
  const gender = pickValue(row, ['gender', 'sex', 'a7'], 'Unknown');

  return {
    id: pickValue(row, ['id', 'caseid', 'case_id', 'id_num'], `enterprise-${index + 1}`),
    enterpriseName: pickValue(row, ['enterpriseName', 'db8_q', 'db8_1', 'a2', 'name'], 'Unknown enterprise'),
    submissionDate,
    region: region || 'Unknown region',
    district: district || 'Unknown district',
    gender: (gender.charAt(0).toUpperCase() + gender.slice(1)) as EnterpriseData['gender'],
    ageGroup: pickValue(row, ['agegroup', 'a3_1', 'years_operating'], 'N/A'),
    status: pickValue(row, ['status', 'qc status', 'approval'], 'Pending') as EnterpriseData['status'],
    latitude: parseNumber(pickValue(row, ['lat', 'latitude', 'gps_lat'])),
    longitude: parseNumber(pickValue(row, ['lon', 'longitude', 'gps_lon'])),
    enumerator: pickValue(row, ['enumerator', 'int_name', 'survey_firm'], 'Unknown'),
    businessType: pickValue(row, ['businessType', 'a4', 'a2', 'sector'], 'N/A'),
    employees: parseNumber(pickValue(row, ['employees', 'b5_q1', 'b5_q2']), 0),
    annualRevenue: parseNumber(pickValue(row, ['annualRevenue', 'b15_cal', 'b15_q']), 0),
    yearsOperating: parseNumber(pickValue(row, ['yearsOperating', 'b9_year', 'b10_year']), 0),
  };
}

export function normalizeYouthRow(row: SheetRow, index: number): YouthData {
  const submissionDate = normalizeSubmissionDate(row);
  const region = pickValue(row, ['region']);
  const district = pickValue(row, ['district']);
  const gender = pickValue(row, ['gender', 'sex', 'sex_id'], 'Unknown');

  return {
    id: pickValue(row, ['id', 'caseid', 'case_id'], `youth-${index + 1}`),
    youthName: pickValue(row, ['youthName', 'name'], 'Unknown youth'),
    submissionDate,
    region: region || 'Unknown region',
    district: district || 'Unknown district',
    gender: (gender.charAt(0).toUpperCase() + gender.slice(1)) as YouthData['gender'],
    ageGroup: pickValue(row, ['agegroup', 'age'], 'N/A'),
    status: pickValue(row, ['status', 'qc status', 'approval'], 'Pending') as YouthData['status'],
    latitude: parseNumber(pickValue(row, ['lat', 'latitude', 'gps_lat'])),
    longitude: parseNumber(pickValue(row, ['lon', 'longitude', 'gps_lon'])),
    enumerator: pickValue(row, ['enumerator', 'users', 'partner_id', 'int_name'], 'Unknown'),
    educationLevel: pickValue(row, ['educationLevel', 'education', 'education_level'], 'N/A'),
    trainingCompleted:
      pickValue(row, ['trainingCompleted', 'training_status', 'trainingcompleted'], 'false').toString().toLowerCase() === 'true',
    employmentStatus: pickValue(row, ['employmentStatus', 'employment_status'], 'N/A'),
    businessIdea: pickValue(row, ['businessIdea', 'service', 'chain'], 'N/A'),
  };
}
