import { useMemo } from 'react';
import { SheetRow } from '@/lib/googleSheets';
import { Submission } from '@/data/mockData';
import { deriveQualityMetrics, QcSurveyKey, runQcEngine } from '@/lib/qcEngine';

interface Options {
  survey: 'farmer' | 'enterprise' | 'youth';
  rawRows?: SheetRow[];
  fallbackSubmissions?: Submission[];
}

const SURVEY_KEY_MAP: Record<Options['survey'], QcSurveyKey> = {
  farmer: 'FARMER',
  enterprise: 'ENTERPRISE',
  youth: 'YOUTH',
};

function buildSyntheticRows(submissions: Submission[]): SheetRow[] {
  return submissions.map((s, idx) => {
    const baseStart = new Date(s.submissionDate || new Date()).toISOString();
    const endDate = new Date(baseStart);
    endDate.setMinutes(endDate.getMinutes() + 15 + (idx % 7));

    return {
      _rowNumber: idx + 2,
      start: baseStart,
      end: endDate.toISOString(),
      starttime: baseStart,
      endtime: endDate.toISOString(),
      deviceid: s.enumerator,
      INT_NAME: s.enumerator,
      username: s.enumerator,
      'Respondent phone number': `+2547${String(idx).padStart(8, '0')}`,
      phone: `+2547${String(idx).padStart(8, '0')}`,
      _gps_latitude: s.latitude?.toString() ?? '',
      _gps_longitude: s.longitude?.toString() ?? '',
      int_country: (s.region || 'Kenya').toString(),
      status: s.status,
    } as SheetRow;
  });
}

export function useQualityChecks({ survey, rawRows = [], fallbackSubmissions = [] }: Options) {
  return useMemo(() => {
    const surveyKey = SURVEY_KEY_MAP[survey];
    const rows = fallbackSubmissions.length > 0
      ? buildSyntheticRows(fallbackSubmissions)
      : rawRows;

    if (!rows.length) {
      return {
        metrics: { submissionQuality: [], errorBreakdown: [], interviewerStats: [] },
        qcResult: null as const,
      };
    }

    const qcResult = runQcEngine(rows, surveyKey);
    const metrics = deriveQualityMetrics(qcResult);

    return { metrics, qcResult };
  }, [fallbackSubmissions, rawRows, survey]);
}
