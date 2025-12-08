import { useQuery } from '@tanstack/react-query';
import { sheetConfigs, SurveyKey } from '@/data/sheetsConfig';
import { fetchSheetRows, SheetRow } from '@/lib/googleSheets';
import { YouthData, EnterpriseData, FarmerData } from '@/data/mockData';
import { normalizeEnterpriseRow, normalizeFarmerRow, normalizeYouthRow } from '@/data/normalizers';

interface SurveyResult<T> {
  data: T[];
  raw: SheetRow[];
  isLive: boolean;
  isLoading: boolean;
  error: Error | null;
  refreshedAt?: Date;
}

const normalizerMap: Record<SurveyKey, (row: SheetRow, index: number) => any> = {
  farmer: normalizeFarmerRow,
  enterprise: normalizeEnterpriseRow,
  youth: normalizeYouthRow,
};

export function useSurveySheet<T extends FarmerData | EnterpriseData | YouthData>(survey: SurveyKey): SurveyResult<T> {
  const config = sheetConfigs[survey];

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

  const normalizer = normalizerMap[survey] as (row: SheetRow, index: number) => T;

  if (query.isError || !query.data || !query.data.rows.length) {
    return {
      data: [],
      raw: [],
      isLive: false,
      isLoading: query.isLoading,
      error: query.error as Error | null,
      refreshedAt: query.data?.refreshedAt,
    };
  }

  // 🔹 Clean: drop empty rows and header-like rows for ALL surveys
  const cleanedRows = query.data.rows.filter((row, rowIndex) => {
    // If your CSV parser included the header row as row 0 with values equal to column keys,
    // this will kick it out.
    const entries = Object.entries(row);
    const nonEmpty = entries.filter(([, v]) => v !== '' && v != null);

    if (nonEmpty.length === 0) return false;

    const headerLike = nonEmpty.filter(
      ([k, v]) => typeof v === 'string' && v.trim() === k.trim()
    );
    if (headerLike.length === nonEmpty.length) return false;

    // optional: hard skip rowIndex === 0 as a safety net
    if (rowIndex === 0) return false;

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
