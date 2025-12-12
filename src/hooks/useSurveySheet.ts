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
  const REFETCH_INTERVAL = 10 * 60 * 1000; // 10 minutes

  const isEnabled = Boolean(config.sheetId && (config.sheetName || config.sheetGid));

  const query = useQuery<{ rows: SheetRow[]; refreshedAt: Date }>({
    queryKey: ['google-sheet', survey, config.sheetId, config.sheetName, config.sheetGid],
    queryFn: async () => {
      if (!isEnabled) {
        throw new Error('Missing Google Sheet configuration');
      }
      const rows = await fetchSheetRows({
        sheetId: config.sheetId,
        sheetName: config.sheetName,
        sheetGid: config.sheetGid,
      });
      return { rows, refreshedAt: new Date() };
    },
    enabled: isEnabled,
    refetchInterval: isEnabled ? REFETCH_INTERVAL : false,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const normalizer = normalizerMap[survey] as (row: SheetRow, index: number) => T;

  // Helper function to check if a value is blank/empty
  const isBlank = (value: unknown): boolean => {
    if (value === null || value === undefined) return true;
    const str = String(value).trim();
    return str === '' || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined';
  };

  // Helper function to get column value (case-insensitive)
  const getColumnValue = (row: SheetRow, columnName: string): unknown => {
    // Try exact match first
    if (row[columnName] !== undefined) return row[columnName];
    // Try case-insensitive match
    const lowerKey = columnName.toLowerCase();
    for (const [key, value] of Object.entries(row)) {
      if (key.toLowerCase() === lowerKey) return value;
    }
    return undefined;
  };

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

  // 🔹 Filter rows based on survey-specific criteria BEFORE normalization
  // This ensures excluded rows never appear in the dashboard
  const filteredRows = cleanedRows.filter((row) => {
    if (survey === 'youth') {
      // Youth: exclude where status_com is not "1"
      const statusCom = getColumnValue(row, 'status_com');
      const statusComStr = String(statusCom || '').trim();
      return statusComStr === '1';
    } else if (survey === 'enterprise') {
      // Enterprise: exclude where F1_Q is blank
      const f1Q = getColumnValue(row, 'F1_Q');
      return !isBlank(f1Q);
    } else if (survey === 'farmer') {
      // Farmer: exclude where obs0 is blank
      const obs0 = getColumnValue(row, 'obs0');
      return !isBlank(obs0);
    }
    return true; // If survey type doesn't match, include the row
  });

  // Ensure we never count the first row (sheet headers) toward any dashboard metric
  const dataRows = filteredRows;

  if (query.isError || !query.data || !dataRows.length) {
    return {
      data: [],
      raw: dataRows,
      isLive: false,
      isLoading: query.isLoading,
      error: query.error as Error | null,
      refreshedAt: query.data?.refreshedAt,
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
  };
}
