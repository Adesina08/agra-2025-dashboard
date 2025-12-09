// Type definitions for normalized submission data across segments.

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
  country?: string;
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
  country?: string;
  programLabel?: string;
}
