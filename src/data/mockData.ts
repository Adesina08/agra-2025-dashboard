// Data structure based on AGRA 2025 Excel schema
// Keys from NAME column, Labels from LABEL column

export interface Submission {
  id: string;
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

function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

function randomCoord(center: number, range: number): number {
  return center + (Math.random() - 0.5) * range;
}

const baseCoords = { lat: -1.2921, lng: 36.8219 }; // Kenya center

function generateFarmerData(count: number): FarmerData[] {
  const data: FarmerData[] = [];
  const enumerators = ['John M.', 'Sarah K.', 'Peter O.', 'Grace W.', 'David N.', 'Mary A.'];
  
  for (let i = 0; i < count; i++) {
    const region = regions[Math.floor(Math.random() * regions.length)];
    const districtList = districts[region as keyof typeof districts] || ['Unknown'];
    
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
      enumerator: enumerators[Math.floor(Math.random() * enumerators.length)],
      farmSize: Math.round((Math.random() * 10 + 0.5) * 10) / 10,
      cropType: cropTypes[Math.floor(Math.random() * cropTypes.length)],
      yieldEstimate: Math.round(Math.random() * 5000 + 500),
      inputAccess: Math.random() > 0.3,
    });
  }
  return data;
}

function generateEnterpriseData(count: number): EnterpriseData[] {
  const data: EnterpriseData[] = [];
  const enumerators = ['Alice R.', 'Bob T.', 'Carol M.', 'Dan K.', 'Eve N.'];
  
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
      enumerator: enumerators[Math.floor(Math.random() * enumerators.length)],
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
  const enumerators = ['Felix M.', 'Hannah K.', 'Isaac O.', 'Julia W.', 'Kevin N.'];
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
      enumerator: enumerators[Math.floor(Math.random() * enumerators.length)],
      educationLevel: educationLevels[Math.floor(Math.random() * educationLevels.length)],
      trainingCompleted: Math.random() > 0.4,
      employmentStatus: employmentStatuses[Math.floor(Math.random() * employmentStatuses.length)],
      businessIdea: businessIdeas[Math.floor(Math.random() * businessIdeas.length)],
    });
  }
  return data;
}

export const farmerData = generateFarmerData(1250);
export const enterpriseData = generateEnterpriseData(480);
export const youthData = generateYouthData(890);

export const lastUpdated = new Date().toISOString();
