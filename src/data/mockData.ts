// Data structure based on AGRA 2025 Excel schema
// Keys from NAME column, Labels from LABEL column

export interface Submission {
  id: string;
  country?: string;
  submissionDate: string;
  region: string;
  district: string;
  gender: 'Male' | 'Female';
  ageGroup: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  latitude: number;
  longitude: number;
  enumerator: string;
}

export interface FarmerData extends Submission {
  farmerName: string;
  farmSize: number;
  cropType: string;
  yieldEstimate: number;
  inputAccess: boolean;
  country?: string; // 🔹 new
  youthInWork?: string;
  cropsCultivated?: string[];
  rainfallAmount?: string;
  rainfallSpread?: string;
  heavyRainDamage?: 'Severe' | 'Mild' | 'No';
  drySpell?: boolean;
  practicesApplied?: string[];
  usesImprovedSeed?: boolean;
  usesFertilizer?: boolean;
  commercializationRate?: number;
  hasFinancialAccount?: boolean;
  hasAgLoan?: boolean;
  creditConstrained?: boolean;
  receivedExtension?: boolean;
  extensionChannels?: string[];
  isYouth?: boolean;
  youthAttitudeScore?: number;
}

export interface EnterpriseData extends Submission {
  enterpriseName: string;
  businessType: string;
  employees: number;
  annualRevenue: number;
  yearsOperating: number;
}

export interface YouthData extends Submission {
  youthName: string;
  educationLevel: string;
  trainingCompleted: boolean;
  employmentStatus: string;
  businessIdea: string;
  w1?: string;
  country?: string;
  vulnerable?: boolean;
  workFocus?: string;
  outreachActivities?: string[];
}

// Field mappings (NAME -> LABEL)
export const fieldLabels = {
  farmer: {
    farmerName: 'Farmer Name',
    farmSize: 'Farm Size (Ha)',
    cropType: 'Primary Crop',
    yieldEstimate: 'Yield Estimate (kg)',
    inputAccess: 'Has Input Access',
    gender: 'Gender',
    country: 'Country',          // 🔹 new
    region: 'Region',
    district: 'District',
    ageGroup: 'Age Group',
    status: 'QC Status',
    submissionDate: 'Submission Date',
  },
  enterprise: {
    enterpriseName: 'Enterprise Name',
    businessType: 'Business Type',
    employees: 'Number of Employees',
    annualRevenue: 'Annual Revenue (USD)',
    yearsOperating: 'Years Operating',
    gender: 'Owner Gender',
    region: 'Region',
    district: 'District',
    status: 'QC Status',
    submissionDate: 'Submission Date',
  },
  youth: {
    youthName: 'Youth Name',
    educationLevel: 'Education Level',
    trainingCompleted: 'Training Completed',
    employmentStatus: 'Employment Status',
    businessIdea: 'Business Idea',
    gender: 'Gender',
    region: 'Region',
    district: 'District',
    ageGroup: 'Age Group',
    status: 'QC Status',
    submissionDate: 'Submission Date',
  },
};

// Regions for the map
export const regions = [
  'Central', 'Western', 'Eastern', 'Northern', 'Southern',
  'Rift Valley', 'Coast', 'Nyanza', 'North Eastern'
];

const districts = {
  Central: ['Nairobi', 'Kiambu', 'Murang\'a', 'Nyeri'],
  Western: ['Kakamega', 'Bungoma', 'Vihiga', 'Busia'],
  Eastern: ['Meru', 'Embu', 'Machakos', 'Kitui'],
  Northern: ['Garissa', 'Wajir', 'Mandera'],
  Southern: ['Kajiado', 'Makueni', 'Taita Taveta'],
  'Rift Valley': ['Nakuru', 'Eldoret', 'Kericho', 'Narok'],
  Coast: ['Mombasa', 'Kilifi', 'Kwale', 'Lamu'],
  Nyanza: ['Kisumu', 'Migori', 'Homa Bay', 'Siaya'],
  'North Eastern': ['Marsabit', 'Isiolo', 'Samburu'],
};

const cropTypes = ['Maize', 'Wheat', 'Rice', 'Beans', 'Coffee', 'Tea', 'Sugarcane', 'Cassava'];
const businessTypes = ['Agro-dealer', 'Food Processing', 'Transport', 'Storage', 'Retail', 'Export'];
const educationLevels = ['Primary', 'Secondary', 'Diploma', 'Bachelor', 'Masters'];
const employmentStatuses = ['Employed', 'Self-employed', 'Unemployed', 'Student'];
const youthCountries = ['Tanzania', 'Rwanda', 'Mozambique', 'Malawi', 'Ghana'];
const youthWorkFocuses = ['onFarm', 'agriService', 'agriBusiness', 'trade', 'extension', 'training'];
const youthOutreachActivities = [
  'extensionEvent',
  'onFarmCsaTraining',
  'entrepreneurshipTraining',
  'mentorshipSupport',
  'accessToFinance',
  'grainAggregation',
  'internship',
  'marketing',
  'seedsDistribution',
  'training',
  'trainingInternship',
  'agroDealerTraining',
  'incubationBds',
  'marketLinkages',
  'agriBusinessOutreach',
  'caaOrientation',
  'salesIncrease',
  'fieldExchangeDemo',
  'others',
];

const youthLocations: Record<string, { region: string; districts: string[] }[]> = {
  Tanzania: [
    { region: 'Kigoma Region', districts: ['Uvinza', 'Kibondo', 'Mpimbwe'] },
    { region: 'Katavi Region', districts: ['Nsimbo', 'MPANDA', 'Total'] },
  ],
  Rwanda: [
    { region: 'Eastern Region', districts: ['Bugesera', 'Gatsibo', 'Kayonza', 'Rwamagana'] },
  ],
  Mozambique: [
    { region: 'Nampula Region', districts: ['Ribáuè', 'Meconta'] },
    { region: 'Sofala Region', districts: ['Gorongosa', 'Nhamatanda'] },
  ],
  Malawi: [
    { region: 'Central Region', districts: ['Lilongwe', 'Kasungu', 'Dowa'] },
    { region: 'Southern Region', districts: ['Zomba'] },
  ],
  Ghana: [
    { region: 'Northern Region', districts: ['Sagnarigu', 'Yendi', 'Mion', 'Tamale', 'Total'] },
    { region: 'Upper East Region', districts: ['Talensi', 'Bongo', 'Nabdam'] },
  ],
};

function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

function randomCoord(center: number, range: number): number {
  return center + (Math.random() - 0.5) * range;
}

const baseCoords = { lat: -1.2921, lng: 36.8219 }; // Kenya center

const enumeratorNames = {
  farmer: ['Maryjane', 'Rosemary', 'Adekunle bunmi', 'Glory Emezurike', 'Omololu temitope', 'FISAYO', 'Oluwabunmi', 'Joshua', 'Samuel K.', 'Grace W.'],
  enterprise: ['Alice R.', 'Bob T.', 'Carol M.', 'Dan K.', 'Eve N.', 'Frank O.', 'Helen P.', 'Isaac Q.', 'Jane R.', 'Ken S.'],
  youth: ['Felix M.', 'Hannah K.', 'Isaac O.', 'Julia W.', 'Kevin N.', 'Linda P.', 'Mike Q.', 'Nancy R.', 'Oscar S.', 'Paula T.'],
};

  function generateFarmerData(count: number): FarmerData[] {
    const data: FarmerData[] = [];

    for (let i = 0; i < count; i++) {
      const region = regions[Math.floor(Math.random() * regions.length)];
      const districtList = districts[region as keyof typeof districts] || ['Unknown'];
    const cropCount = Math.max(1, Math.floor(Math.random() * 3));
    const cropSelection = Array.from({ length: cropCount }, () =>
      cropTypes[Math.floor(Math.random() * cropTypes.length)]
    );
    const rainfallAmountOptions = [
      'Much less than average',
      'Less than average',
      'About average',
      'More than average',
      'Much more than average',
    ];
    const rainfallSpreadOptions = ['Very poor', 'Poor', 'Fair', 'Very good'];
    const heavyRainDamageOptions: FarmerData['heavyRainDamage'][] = ['Severe', 'Mild', 'No'];
    const youthClassifications = ['Youth', 'Non-youth', 'Transitioning'];
    const practiceOptions = ['Improved seed', 'Inorganic fertilizer', 'Organic manure', 'Pest management'];
    const extensionChannels = ['Extension officer', 'Radio', 'TV', 'SMS', 'Farmer group'];

    data.push({
      id: `F${String(i + 1).padStart(5, '0')}`,
      farmerName: `Farmer ${i + 1}`,
      submissionDate: randomDate(new Date('2025-01-01'), new Date('2025-12-02')),
      region,
      district: districtList[Math.floor(Math.random() * districtList.length)],
      gender: Math.random() > 0.45 ? 'Male' : 'Female',
      ageGroup: ['18-25', '26-35', '36-45', '46-55', '55+'][Math.floor(Math.random() * 5)],
      status: ['Approved', 'Pending', 'Rejected'][Math.floor(Math.random() * 3)] as any,
      latitude: randomCoord(baseCoords.lat, 6),
      longitude: randomCoord(baseCoords.lng, 6),
      enumerator: enumeratorNames.farmer[Math.floor(Math.random() * enumeratorNames.farmer.length)],
      farmSize: Math.round((Math.random() * 10 + 0.5) * 10) / 10,
      cropType: cropTypes[Math.floor(Math.random() * cropTypes.length)],
      yieldEstimate: Math.round(Math.random() * 5000 + 500),
      inputAccess: Math.random() > 0.3,
      country: 'Kenya', // 🔹 or any default country for mock data
      youthInWork: youthClassifications[Math.floor(Math.random() * youthClassifications.length)],
      cropsCultivated: cropSelection,
      rainfallAmount: rainfallAmountOptions[Math.floor(Math.random() * rainfallAmountOptions.length)],
      rainfallSpread: rainfallSpreadOptions[Math.floor(Math.random() * rainfallSpreadOptions.length)],
      heavyRainDamage: heavyRainDamageOptions[Math.floor(Math.random() * heavyRainDamageOptions.length)],
      drySpell: Math.random() > 0.5,
      practicesApplied: practiceOptions.filter(() => Math.random() > 0.5),
      usesImprovedSeed: Math.random() > 0.4,
      usesFertilizer: Math.random() > 0.35,
      commercializationRate: Math.round(Math.random() * 100),
      hasFinancialAccount: Math.random() > 0.5,
      hasAgLoan: Math.random() > 0.7,
      creditConstrained: Math.random() > 0.65,
      receivedExtension: Math.random() > 0.5,
      extensionChannels: extensionChannels.filter(() => Math.random() > 0.65),
      isYouth: Math.random() > 0.55,
      youthAttitudeScore: Math.round((Math.random() * 4 + 1) * 10) / 10,
    });
  }
  return data;
}

function generateEnterpriseData(count: number): EnterpriseData[] {
  const data: EnterpriseData[] = [];
  
  for (let i = 0; i < count; i++) {
    const region = regions[Math.floor(Math.random() * regions.length)];
    const districtList = districts[region as keyof typeof districts] || ['Unknown'];
    
    data.push({
      id: `E${String(i + 1).padStart(5, '0')}`,
      enterpriseName: `Enterprise ${i + 1}`,
      submissionDate: randomDate(new Date('2025-01-01'), new Date('2025-12-02')),
      region,
      district: districtList[Math.floor(Math.random() * districtList.length)],
      gender: Math.random() > 0.6 ? 'Male' : 'Female',
      ageGroup: ['18-25', '26-35', '36-45', '46-55', '55+'][Math.floor(Math.random() * 5)],
      status: ['Approved', 'Pending', 'Rejected'][Math.floor(Math.random() * 3)] as any,
      latitude: randomCoord(baseCoords.lat, 6),
      longitude: randomCoord(baseCoords.lng, 6),
      enumerator: enumeratorNames.enterprise[Math.floor(Math.random() * enumeratorNames.enterprise.length)],
      businessType: businessTypes[Math.floor(Math.random() * businessTypes.length)],
      employees: Math.floor(Math.random() * 50 + 1),
      annualRevenue: Math.round(Math.random() * 100000 + 5000),
      yearsOperating: Math.floor(Math.random() * 15 + 1),
    });
  }
  return data;
}

function generateYouthData(count: number): YouthData[] {
  const data: YouthData[] = [];
  const businessIdeas = ['Poultry Farming', 'Digital Marketing', 'Agri-Tech App', 'Organic Farming', 'Food Delivery', 'Farm Equipment Rental'];
  
  for (let i = 0; i < count; i++) {
    const region = regions[Math.floor(Math.random() * regions.length)];
    const districtList = districts[region as keyof typeof districts] || ['Unknown'];
    
    data.push({
      id: `Y${String(i + 1).padStart(5, '0')}`,
      youthName: `Youth ${i + 1}`,
      submissionDate: randomDate(new Date('2025-01-01'), new Date('2025-12-02')),
      region,
      district: districtList[Math.floor(Math.random() * districtList.length)],
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
      ageGroup: ['18-21', '22-25', '26-29', '30-35'][Math.floor(Math.random() * 4)],
      status: ['Approved', 'Pending', 'Rejected'][Math.floor(Math.random() * 3)] as any,
      latitude: randomCoord(baseCoords.lat, 6),
      longitude: randomCoord(baseCoords.lng, 6),
      enumerator: enumeratorNames.youth[Math.floor(Math.random() * enumeratorNames.youth.length)],
      educationLevel: educationLevels[Math.floor(Math.random() * educationLevels.length)],
      trainingCompleted: Math.random() > 0.4,
      employmentStatus: employmentStatuses[Math.floor(Math.random() * employmentStatuses.length)],
      businessIdea: businessIdeas[Math.floor(Math.random() * businessIdeas.length)],
      country,
      vulnerable: Math.random() > 0.7,
      workFocus: youthWorkFocuses[Math.floor(Math.random() * youthWorkFocuses.length)],
      outreachActivities: youthOutreachActivities.filter(() => Math.random() > 0.7),
    });
  }
  return data;
}

// Generate interviewer stats from data
export function generateInterviewerStats(data: Submission[]) {
  const stats: Record<string, { name: string; totalInterviews: number; approved: number }> = {};
  
  data.forEach(d => {
    if (!stats[d.enumerator]) {
      stats[d.enumerator] = { name: d.enumerator, totalInterviews: 0, approved: 0 };
    }
    stats[d.enumerator].totalInterviews++;
    if (d.status === 'Approved') {
      stats[d.enumerator].approved++;
    }
  });
  
  return Object.values(stats);
}

// Generate submission quality data
export function generateSubmissionQuality(data: Submission[]) {
  const stats: Record<string, { name: string; approved: number; notApproved: number }> = {};
  
  data.forEach(d => {
    if (!stats[d.enumerator]) {
      stats[d.enumerator] = { name: d.enumerator, approved: 0, notApproved: 0 };
    }
    if (d.status === 'Approved') {
      stats[d.enumerator].approved++;
    } else {
      stats[d.enumerator].notApproved++;
    }
  });
  
  return Object.values(stats);
}

// Error breakdown mock data
export const errorBreakdownData = {
  farmer: [
    { errorType: 'Low LOI', relatedVariables: 'start, end, Minutes Difference', count: 2218 },
    { errorType: 'Clustered Interview', relatedVariables: 'A1. Enumerator ID, _A5 lat/lon, start', count: 2153 },
    { errorType: 'Interwoven', relatedVariables: 'start, end, deviceid', count: 1048 },
    { errorType: 'Short Gap', relatedVariables: 'start, end, deviceid', count: 425 },
    { errorType: 'Duplicate Phone', relatedVariables: 'Respondent phone number', count: 340 },
    { errorType: 'Quantity Sold Out of Range', relatedVariables: 'D5a, D2', count: 265 },
    { errorType: 'Duplicate GPS', relatedVariables: '_A5 lat/lon', count: 236 },
  ],
  enterprise: [
    { errorType: 'Invalid Revenue', relatedVariables: 'annual_revenue, employees', count: 156 },
    { errorType: 'Duplicate Registration', relatedVariables: 'business_reg_number', count: 89 },
    { errorType: 'Missing Documents', relatedVariables: 'license, permit', count: 67 },
    { errorType: 'GPS Mismatch', relatedVariables: '_location, registered_address', count: 45 },
    { errorType: 'Invalid Contact', relatedVariables: 'phone, email', count: 34 },
  ],
  youth: [
    { errorType: 'Age Mismatch', relatedVariables: 'dob, age_group', count: 312 },
    { errorType: 'Duplicate ID', relatedVariables: 'national_id', count: 178 },
    { errorType: 'Training Incomplete', relatedVariables: 'training_status, certificate', count: 145 },
    { errorType: 'Invalid Education', relatedVariables: 'education_level, certificate', count: 98 },
    { errorType: 'Missing Business Plan', relatedVariables: 'business_idea, plan_document', count: 67 },
  ],
};

export const farmerData = generateFarmerData(1250);
export const enterpriseData = generateEnterpriseData(480);
export const youthData = generateYouthData(890);

export const lastUpdated = new Date().toISOString();
