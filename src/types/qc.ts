export interface QCDetail {
  surveyType: 'Farmer' | 'Enterprise' | 'Youth';
  sourceRow: number;
  enumeratorID: string;
  deviceID: string;
  phone: string;
  start: string;
  end: string;
  qcStatus: 'pass' | 'fail';
  approval: 'Approved' | 'Not Approved';
  qcFlagCount: number;
  qcFlags: string;
  qcIssues: string;
}

export interface QCSummary {
  kpi: string;
  flagName: string;
  type: 'SOFT' | 'HARD';
  category: 'META' | 'NUMERIC';
  count: number;
  percentInterviews: number;
}

export interface EnumeratorPerformance {
  enumeratorID: string;
  totalSubmissions: number;
  totalFlags: number;
  flagsPerInterview: number;
}
