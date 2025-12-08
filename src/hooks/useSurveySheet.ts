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

  const query = useQuery<{ rows: SheetRow[]; refreshedAt: Date }>({
    queryKey: ['google-sheet', survey, config.sheetId, config.sheetName, config.sheetGid],
    queryFn: async () => {
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
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const normalizer = mockConfig.normalizer as (row: SheetRow, index: number) => T;

  // Fallback: no mock data – just empty data so all KPIs show 0
  if (query.isError || !query.data || !query.data.rows.length) {
    return {
      data: [] as T[],
      raw: [],
      isLive: false,
      isLoading: query.isLoading,
      error: query.error as Error | null,
      refreshedAt: query.data?.refreshedAt,
    };
  }

  // 🔹 Clean live rows: drop empty rows and any accidental header rows
  const cleanedRows = query.data.rows.filter((row, index) => {
    // Always skip the very first row from the parsed data – treat it as row 1 / header
    if (index === 0) return false;

    const entries = Object.entries(row);
    const nonEmpty = entries.filter(([, v]) => v !== '' && v != null);

    // Drop completely empty rows
    if (nonEmpty.length === 0) return false;

    // Drop rows that look like a repeated header row
    const headerLike = nonEmpty.filter(
      ([k, v]) => typeof v === 'string' && v.trim() === k.trim()
    );

    // If *all* non-empty cells equal their column name -> header row, skip it
    if (headerLike.length === nonEmpty.length) return false;

    return true;
  });

  const normalized = cleanedRows.map((row, idx) => normalizer(row, idx));

  return {
    data: normalized,
    raw: cleanedRows,
    isLive: true,
    isLoading: query.isLoading,
    error: null,
    refreshedAt: query.data.refreshedAt,
  };
}
