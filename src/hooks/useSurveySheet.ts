import { useQuery } from '@tanstack/react-query';
import { sheetConfigs, SurveyKey } from '@/data/sheetsConfig';
import { fetchSheetRows, SheetRow } from '@/lib/googleSheets';
import { enterpriseData, farmerData, YouthData, EnterpriseData, FarmerData, youthData } from '@/data/mockData';
import { normalizeEnterpriseRow, normalizeFarmerRow, normalizeYouthRow } from '@/data/normalizers';

interface SurveyResult<T> {
  data: T[];
  raw: SheetRow[];
  isLive: boolean;
  isLoading: boolean;
  error: Error | null;
  refreshedAt?: Date;
}

const mockMap: Record<SurveyKey, { data: any[]; normalizer: (row: SheetRow, index: number) => any }> = {
  farmer: { data: farmerData, normalizer: normalizeFarmerRow },
  enterprise: { data: enterpriseData, normalizer: normalizeEnterpriseRow },
  youth: { data: youthData, normalizer: normalizeYouthRow },
};

export function useSurveySheet<T extends FarmerData | EnterpriseData | YouthData>(survey: SurveyKey): SurveyResult<T> {
  const config = sheetConfigs[survey];
  const mockConfig = mockMap[survey];

  const query = useQuery<{ rows: SheetRow[]; refreshedAt: Date }>(
    ['google-sheet', survey, config.sheetId, config.sheetName, config.sheetGid],
    async () => {
      if (!config.sheetId || !(config.sheetName || config.sheetGid)) {
        throw new Error('Missing Google Sheet configuration');
      }
      const rows = await fetchSheetRows({
        sheetId: config.sheetId,
        sheetName: config.sheetName,
        sheetGid: config.sheetGid,
      });
      return { rows, refreshedAt: new Date() };
    },
    {
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );

  const normalizer = mockConfig.normalizer as (row: SheetRow, index: number) => T;

  if (query.isError || !query.data || !query.data.rows.length) {
    const rawMock = (mockConfig.data as SheetRow[]).map((row) => row);
    const normalized = rawMock.map((row, idx) => normalizer(row, idx));
    return {
      data: normalized,
      raw: rawMock,
      isLive: false,
      isLoading: query.isLoading,
      error: query.error as Error | null,
      refreshedAt: query.data?.refreshedAt,
    };
  }

  const normalized = query.data.rows.map((row, idx) => normalizer(row, idx));

  return {
    data: normalized,
    raw: query.data.rows,
    isLive: true,
    isLoading: query.isLoading,
    error: null,
    refreshedAt: query.data.refreshedAt,
  };
}
