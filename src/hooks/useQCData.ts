import { useMemo } from 'react';
import { useSheetData } from './useSheetData';
import { mapEnumeratorRow, mapQCDetailRow, mapQCSummaryRow } from '@/lib/qcMappers';
import type { EnumeratorPerformance, QCDetail, QCSummary } from '@/types/qc';

interface QCDataConfig {
  sheetId: string;
  gidDetail: string;
  gidSummary: string;
  gidEnum: string;
}

export function useQCData(config: QCDataConfig | undefined) {
  const detailConfig = useMemo(
    () => (config ? { sheetId: config.sheetId, gid: config.gidDetail } : undefined),
    [config]
  );

  const summaryConfig = useMemo(
    () => (config ? { sheetId: config.sheetId, gid: config.gidSummary } : undefined),
    [config]
  );

  const enumConfig = useMemo(
    () => (config ? { sheetId: config.sheetId, gid: config.gidEnum } : undefined),
    [config]
  );

  const qcDetail = useSheetData<QCDetail>(detailConfig, mapQCDetailRow);
  const qcSummary = useSheetData<QCSummary>(summaryConfig, mapQCSummaryRow);
  const enumPerformance = useSheetData<EnumeratorPerformance>(
    enumConfig,
    mapEnumeratorRow
  );

  const loading = qcDetail.loading || qcSummary.loading || enumPerformance.loading;
  const error = qcDetail.error || qcSummary.error || enumPerformance.error;

  return {
    qcDetail: qcDetail.data,
    qcSummary: qcSummary.data,
    enumPerformance: enumPerformance.data,
    loading,
    error,
    refresh: () => {
      qcDetail.refresh();
      qcSummary.refresh();
      enumPerformance.refresh();
    },
  };
}
