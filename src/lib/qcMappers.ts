import type { EnumeratorPerformance, QCDetail, QCSummary } from '@/types/qc';

export function mapQCDetailRow(row: Record<string, string>): QCDetail {
  return {
    surveyType: (row['SurveyType'] || 'Farmer') as QCDetail['surveyType'],
    sourceRow: parseInt(row['SourceRow'] || '0', 10),
    enumeratorID: row['EnumeratorID'] || '',
    deviceID: row['DeviceID'] || row['deviceid'] || '',
    phone: row['Phone'] || '',
    start: row['Start'] || row['start'] || row['starttime'] || '',
    end: row['End'] || row['end'] || row['endtime'] || '',
    qcStatus: (row['QC Status'] || '').toLowerCase().includes('pass') ? 'pass' : 'fail',
    approval: (row['Approval'] || '').includes('Approved') ? 'Approved' : 'Not Approved',
    qcFlagCount: parseInt(row['QC_FLAG_COUNT'] || '0', 10),
    qcFlags: row['QC_Flags'] || '',
    qcIssues: row['QC Issues'] || '',
  };
}

export function mapQCSummaryRow(row: Record<string, string>): QCSummary {
  const percentStr = (row['% Interviews'] || '0').replace('%', '');

  return {
    kpi: row['KPI'] || '',
    flagName: row['Flag Name'] || '',
    type: (row['Type'] || 'SOFT') as QCSummary['type'],
    category: (row['Category'] || 'META') as QCSummary['category'],
    count: parseInt(row['Count'] || '0', 10),
    percentInterviews: parseFloat(percentStr || '0'),
  };
}

export function mapEnumeratorRow(row: Record<string, string>): EnumeratorPerformance {
  return {
    enumeratorID: row['EnumeratorID'] || '',
    totalSubmissions: parseInt(row['TotalSubmissions'] || '0', 10),
    totalFlags: parseInt(row['TotalFlags'] || '0', 10),
    flagsPerInterview: parseFloat(row['FlagsPerInterview'] || '0'),
  };
}
