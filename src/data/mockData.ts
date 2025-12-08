// Data structure definitions shared across survey types

export interface Submission {
  id: string;
  submissionDate: string;
  country?: string;
  region?: string;
  district?: string;
  gender?: string;
  ageGroup?: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  latitude?: number;
  longitude?: number;
  enumerator?: string;
}

export interface FarmerData extends Submission {
  farmerName: string;
  farmSize: number;
  cropType: string;
  yieldEstimate: number;
  inputAccess: boolean;
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
  name: string;
  gender?: string;
  ageGroup?: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  employeesCount?: number;
  annualTurnover?: number;
  sector?: string;
}

export interface YouthData extends Submission {
  respondentName: string;
  gender?: string;
  ageGroup?: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  isYouth?: boolean;
  youthInWork?: string;
  youthAttitudeScore?: number;
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
    country: 'Country',
    region: 'Region',
    district: 'District',
    ageGroup: 'Age Group',
    status: 'QC Status',
    submissionDate: 'Submission Date',
  },
  enterprise: {
    name: 'Enterprise Name',
    sector: 'Business Sector',
    employeesCount: 'Number of Employees',
    annualTurnover: 'Annual Turnover (USD)',
    country: 'Country',
    region: 'Region',
    district: 'District',
    gender: 'Owner Gender',
    ageGroup: 'Age Group',
    status: 'QC Status',
    submissionDate: 'Submission Date',
  },
  youth: {
    respondentName: 'Respondent Name',
    country: 'Country',
    region: 'Region',
    district: 'District',
    gender: 'Gender',
    ageGroup: 'Age Group',
    status: 'QC Status',
    submissionDate: 'Submission Date',
    youthInWork: 'Youth In Work',
  },
};

// Generate interviewer stats from live submission data
export function generateInterviewerStats(data: Submission[]) {
  const stats: Record<string, { name: string; totalInterviews: number; approved: number }> = {};

  data.forEach((d) => {
    const interviewer = d.enumerator || 'Unknown';
    if (!stats[interviewer]) {
      stats[interviewer] = { name: interviewer, totalInterviews: 0, approved: 0 };
    }
    stats[interviewer].totalInterviews++;
    if (d.status === 'Approved') {
      stats[interviewer].approved++;
    }
  });

  return Object.values(stats);
}

// Generate submission quality data
export function generateSubmissionQuality(data: Submission[]) {
  const stats: Record<string, { name: string; approved: number; notApproved: number }> = {};

  data.forEach((d) => {
    const interviewer = d.enumerator || 'Unknown';
    if (!stats[interviewer]) {
      stats[interviewer] = { name: interviewer, approved: 0, notApproved: 0 };
    }
    if (d.status === 'Approved') {
      stats[interviewer].approved++;
    } else {
      stats[interviewer].notApproved++;
    }
  });

  return Object.values(stats);
}

// Error breakdown placeholder data (to be replaced by live QC metrics if available)
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
