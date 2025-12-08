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
  const gender = pickValue(row, ['gender', 'sex', 'e5', 'db7'], 'Unknown');
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

  // --- practices applied (fm8_1..fm8_15) ---
  const fm8Fields = [
    'fm8_1',
    'fm8_2',
    'fm8_3',
    'fm8_4',
    'fm8_5',
    'fm8_6',
    'fm8_7',
    'fm8_8',
    'fm8_9',
    'fm8_10',
    'fm8_11',
    'fm8_12',
    'fm8_13',
    'fm8_14',
    'fm8_15',
  ];
  const PRACTICE_MAP: Record<string, string> = {
    '1': 'Improved seed',
    '2': 'Inorganic fertilizer',
    '3': 'Organic manure',
    '4': 'Pest & disease management',
    '5': 'Soil & water conservation',
  };
  const practicesApplied = Array.from(
    fm8Fields.reduce((set, field) => {
      const raw = pickValue(row, [field], '').trim();
      if (!raw) return set;
      raw.split(/\s+/).forEach((code) => {
        const label = PRACTICE_MAP[code] ?? code;
        set.add(label);
      });
      return set;
    }, new Set<string>())
  );
  const usesImprovedSeed = practicesApplied.includes('Improved seed');
  const usesFertilizer = practicesApplied.includes('Inorganic fertilizer');

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

  // --- markets & finance ---
  const commercializationRate = parseNumber(pickValue(row, ['df6', 'df7', 'commercializationRate']), NaN);
  const hasFinancialAccount = pickValue(row, ['h1', 'h2'], '')
    .toString()
    .trim()
    .toLowerCase() === '1';
  const hasAgLoan = pickValue(row, ['h7', 'h8'], '')
    .toString()
    .trim()
    .toLowerCase() === '1';
  const creditConstrained = pickValue(row, ['h9'], '')
    .toString()
    .trim() !== '';

  // --- extension / advisory ---
  const receivedExtension = pickValue(row, ['j2'], '')
    .toString()
    .trim()
    .toLowerCase() === '1';
  const extensionChannels = Array.from(
    [
      'j3_1',
      'j3_2',
      'j3_3',
      'j3_4',
      'j3_5',
      'j3_6',
      'j3_7',
      'j3_8',
      'j3_9',
      'j3_10',
      'j3_11',
      'j3_12',
      'j3_13',
    ].reduce((set, field) => {
      const raw = pickValue(row, [field], '').trim();
      if (raw) set.add(raw);
      return set;
    }, new Set<string>())
  );

  // --- youth / attitudes ---
  const isYouth = (ageGroup || '').includes('18') || (ageGroup || '').includes('35');
  const avFields = [
    'av1',
    'av2',
    'av3',
    'av4',
    'av5',
    'av6',
    'av7',
    'av8',
    'av9',
    'av10',
    'av11',
    'av12',
    'av13',
    'av14',
    'av15',
    'av16',
    'av17',
  ];
  const avValues = avFields
    .map((f) => parseNumber(pickValue(row, [f]), NaN))
    .filter((v) => !Number.isNaN(v) && v > 0);
  const youthAttitudeScore = avValues.length
    ? avValues.reduce((sum, v) => sum + v, 0) / avValues.length
    : undefined;

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
    practicesApplied,
    usesImprovedSeed,
    usesFertilizer,
    commercializationRate: Number.isNaN(commercializationRate) ? undefined : commercializationRate,
    hasFinancialAccount,
    hasAgLoan,
    creditConstrained,
    receivedExtension,
    extensionChannels,
    isYouth,
    youthAttitudeScore,
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
