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
  isFetching: boolean;
  refetch: () => Promise<unknown>;
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
    // Keep data fresh even without manual refreshes
    refetchInterval: 10 * 60 * 1000,
    refetchIntervalInBackground: true,
    retry: 1,
  });

  const normalizer = normalizerMap[survey] as (row: SheetRow, index: number) => T;

  // 🔹 Clean live rows: drop empty rows and any accidental header rows
  const cleanedRows = query.data?.rows.filter((row) => {
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
  }) ?? [];

  // Ensure we never count the first row (sheet headers) toward any dashboard metric
  const dataRows = cleanedRows.slice(1);

  if (query.isError || !query.data || !dataRows.length) {
    return {
      data: [],
      raw: dataRows,
      isLive: false,
      isLoading: query.isLoading,
      error: query.error as Error | null,
      refreshedAt: query.data?.refreshedAt,
      isFetching: query.isFetching,
      refetch: query.refetch,
    };
  }

  const normalized = dataRows.map((row, idx) => normalizer(row, idx));

  return {
    data: normalized,
    raw: dataRows,
    isLive: true,
    isLoading: query.isLoading,
    error: null,
    refreshedAt: query.data.refreshedAt,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}
