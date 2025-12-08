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
  const country = pickValue(row, ['dccot', 'country', 'dcountry']);
  const region = pickValue(row, ['region', 'db11', 'province']);
  const district = pickValue(row, ['district', 'db10']);
  const gender = pickValue(row, ['gender', 'sex', 'e5'], 'Unknown');
  const ageGroup = pickValue(row, ['agegroup', 'd6', 'age']);
  const youthInWork = pickValue(row, ['YouthinWork', 'youthinwork']);

  // --- multi-select crops cultivated (fm2) ---
  const fm2Raw = pickValue(row, ['fm2'], '').trim();
  const cropCodes = fm2Raw ? fm2Raw.split(/\s+/) : [];
  const FM2_CROP_MAP: Record<string, string> = {
    '1': 'Maize',
    '2': 'Soybean',
    '3': 'Rice',
    '4': 'Sunflower',
    '5': 'Chilli',
    '6': 'Poultry',
    '7': 'Groundnuts',
    '8': 'Beans',
    '9': 'Potato',
    '10': 'Other',
    '11': 'Refused',
  };
  const cropsCultivated = cropCodes.map((code) => FM2_CROP_MAP[code] ?? code);

  // --- land size: sum of fm6_1..fm6_15 ---
  const cropLandFields = [
    'fm6_1',
    'fm6_2',
    'fm6_3',
    'fm6_4',
    'fm6_5',
    'fm6_6',
    'fm6_7',
    'fm6_8',
    'fm6_9',
    'fm6_10',
    'fm6_11',
    'fm6_12',
    'fm6_13',
    'fm6_14',
    'fm6_15',
  ];
  const totalFarmSize = cropLandFields
    .map((f) => parseNumber(pickValue(row, [f]), 0))
    .reduce((sum, v) => sum + v, 0);

  // --- rainfall perception (e28) ---
  const e28Code = pickValue(row, ['e28']).trim();
  const E28_MAP: Record<string, string> = {
    '1': 'Much less than average',
    '2': 'Less than average',
    '3': 'About average',
    '4': 'More than average',
    '5': 'Much more than average',
  };
  const rainfallAmount = E28_MAP[e28Code] ?? '';

  // --- rainfall spread (e32) ---
  const e32Code = pickValue(row, ['e32']).trim();
  const E32_MAP: Record<string, string> = {
    '4': 'Very good',
    '3': 'Fair',
    '2': 'Poor',
    '1': 'Very poor',
  };
  const rainfallSpread = E32_MAP[e32Code] ?? '';

  // --- shocks ---
  const e29Code = pickValue(row, ['e29']).trim(); // heavy rain damage
  let heavyRainDamage: FarmerData['heavyRainDamage'] = undefined;
  if (e29Code === '1') heavyRainDamage = 'Severe';
  else if (e29Code === '2') heavyRainDamage = 'Mild';
  else if (e29Code === '3') heavyRainDamage = 'No';

  const e30Code = pickValue(row, ['e30']).trim(); // dry spell yes/no
  const drySpell = e30Code === '1';

  // --- main crop (just pick first fm2 crop if available) ---
  const mainCrop = cropsCultivated[0] ?? 'N/A';

  // --- existing pieces you already had ---
  const farmSizeRaw = pickValue(row, ['farmSize', 'fm6_1', 'fm6']);
  const yieldEstimate = parseNumber(pickValue(row, ['yieldEstimate', 'fm26_1_1', 'yield']), 0);
  const inputAccess = pickValue(row, ['inputAccess', 'k1', 'input_access'], 'false')
    .toString()
    .toLowerCase() === 'true';

  return {
    id: pickValue(row, ['id', 'caseid', 'case_id', 'uuid'], `farmer-${index + 1}`),
    farmerName: pickValue(row, ['farmerName', 'db2label', 'db2', 'name'], 'Unknown farmer'),
    submissionDate,
    country: country || 'Unknown country',
    region: region || 'Unknown region',
    district: district || 'Unknown district',
    gender: (gender.charAt(0).toUpperCase() + gender.slice(1)) as FarmerData['gender'],
    ageGroup: ageGroup || 'N/A',
    status: pickValue(row, ['status', 'qc status', 'approval'], 'Pending') as FarmerData['status'],
    latitude: parseNumber(pickValue(row, ['lat', 'latitude', 'gps_lat'])),
    longitude: parseNumber(pickValue(row, ['lon', 'longitude', 'gps_lon'])),
    enumerator: pickValue(row, ['enumerator', 'username', 'users', 'int_name'], 'Unknown'),

    // new semantic fields
    farmSize: totalFarmSize || parseNumber(farmSizeRaw, 0),
    cropType: mainCrop,
    yieldEstimate,
    inputAccess,
    youthInWork,
    cropsCultivated,
    rainfallAmount,
    rainfallSpread,
    heavyRainDamage,
    drySpell,
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
