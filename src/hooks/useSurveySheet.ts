import { useQuery } from '@tanstack/react-query';
import { sheetConfigs, SurveyKey } from '@/data/sheetsConfig';
import { fetchSheetRows, SheetRow } from '@/lib/googleSheets';
import { YouthData, EnterpriseData, FarmerData } from '@/data/mockData';
import { normalizeEnterpriseRow, normalizeFarmerRow, normalizeYouthRow } from '@/data/normalizers';

interface SurveyResult<T> {
  data: T[];
  raw: SheetRow[]; // Filtered raw data (after survey-specific filtering)
  rawUnfiltered: SheetRow[]; // Unfiltered raw data (before survey-specific filtering)
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
  const REFETCH_INTERVAL = 60 * 1000; // 1 minute

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
    refetchOnWindowFocus: true, // Refresh when user returns to the tab
    staleTime: 0, // Consider data stale immediately to ensure fresh fetches
    // Keep previous data while fetching new data to avoid flickering
    placeholderData: (previousData) => previousData,
    retry: 1,
  });

  const normalizer = normalizerMap[survey] as (row: SheetRow, index: number) => T;

  // Helper function to check if a value is blank/empty
  const isBlank = (value: unknown): boolean => {
    if (value === null || value === undefined) return true;
    const str = String(value).trim();
    return str === '' || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined';
  };

  // Helper function to get column value (case-insensitive, handles whitespace)
  const getColumnValue = (row: SheetRow, columnName: string): unknown => {
    // Try exact match first
    if (row[columnName] !== undefined && row[columnName] !== null && row[columnName] !== '') {
      return row[columnName];
    }
    // Try case-insensitive match (with and without whitespace trimming)
    const lowerKey = columnName.toLowerCase().trim();
    for (const [key, value] of Object.entries(row)) {
      const trimmedKey = key.trim().toLowerCase();
      if (trimmedKey === lowerKey) {
        return value;
      }
    }
    return undefined;
  };

  // IMPORTANT: Store raw unfiltered rows FIRST, before any processing
  // This ensures "Total Submissions" always counts ALL rows from Google Sheets CSV
  // regardless of any filtering or processing that happens afterwards
  // Always use the most recent query data, even during loading states
  const rawUnfilteredRows = (query.data?.rows ?? []);

  // 🔹 Clean live rows: drop empty rows and any accidental header rows
  const cleanedRows = rawUnfilteredRows.filter((row) => {
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

  // 🔹 Filter rows based on survey-specific criteria BEFORE normalization
  // This ensures excluded rows never appear in the dashboard
  const filteredRows = cleanedRows.filter((row) => {
    if (survey === 'youth') {
      // Youth: exclude where status_com is not "1"
      const statusCom = getColumnValue(row, 'status_com');
      const statusComStr = String(statusCom || '').trim();
      // Only include rows where status_com exactly equals "1"
      return statusComStr === '1';
    } else if (survey === 'enterprise') {
      // Enterprise: exclude where F1_Q is blank
      const f1Q = getColumnValue(row, 'F1_Q');
      // Only include rows where F1_Q has a non-blank value
      return !isBlank(f1Q);
    } else if (survey === 'farmer') {
      // Farmer: exclude where obs0 is blank
      // Try multiple possible column name variations
      const obs0 = getColumnValue(row, 'obs0') || getColumnValue(row, 'obs_0') || getColumnValue(row, 'OBS0') || getColumnValue(row, 'OBS_0');
      // Only include rows where obs0 (or variant) has a non-blank value
      return !isBlank(obs0);
    }
    return true; // If survey type doesn't match, include the row
  });

  // Ensure we never count the first row (sheet headers) toward any dashboard metric
  const dataRows = filteredRows;

  // Even if there are no filtered data rows, we still want to return the unfiltered rows
  // so that Total Submissions can be calculated correctly
  if (query.isError || !query.data) {
    return {
      data: [],
      raw: dataRows,
      rawUnfiltered: rawUnfilteredRows,
      isLive: false,
      isLoading: query.isLoading,
      error: query.error as Error | null,
      refreshedAt: query.data?.refreshedAt,
    };
  }

  // Only normalize and return filtered data if we have filtered rows
  // But always return rawUnfilteredRows regardless
  const normalized = dataRows.length > 0 ? dataRows.map((row, idx) => normalizer(row, idx)) : [];

  return {
    data: normalized,
    raw: dataRows,
    rawUnfiltered: rawUnfilteredRows, // Always includes ALL rows from Google Sheets CSV
    isLive: true,
    isLoading: query.isLoading,
    error: null,
    refreshedAt: query.data.refreshedAt,
  };
}
