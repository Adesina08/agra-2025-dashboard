import { useCallback, useEffect, useState } from 'react';

export interface SheetHookState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Generic hook to fetch and transform data from a public Google Sheet.
 *
 * It expects the sheet to be shared as "Anyone with the link can view".
 * It reads the CSV export, converts it to an array of row-objects
 * keyed by the header names, then maps each row using the provided mapper.
 */
export function useSheetData<T>(
  sheetId: string | undefined,
  mapRow: (row: Record<string, string>) => T
): SheetHookState<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refresh = useCallback(() => {
    setReloadToken((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!sheetId) {
      setError('Missing Google Sheet ID');
      return;
    }

    const controller = new AbortController();

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
        const res = await fetch(url, { signal: controller.signal });

        if (!res.ok) {
          throw new Error(`Failed to fetch sheet ${sheetId}: HTTP ${res.status}`);
        }

        const csv = await res.text();
        const rows = csvToObjects(csv);
        const mapped = rows.map(mapRow);

        setData(mapped);
      } catch (err: any) {
        if (!controller.signal.aborted) {
          setError(err?.message ?? 'Unknown error while fetching sheet');
          setData([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    run();

    return () => controller.abort();
  }, [sheetId, mapRow, reloadToken]);

  return { data, loading, error, refresh };
}

/**
 * Convert CSV text into array of row-objects keyed by header.
 */
function csvToObjects(csv: string): Record<string, string>[] {
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (!lines.length) return [];

  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};

    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? '';
    });

    rows.push(row);
  }

  return rows;
}

/**
 * Minimal CSV line parser handling quoted values and commas.
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];

    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        current += c;
      }
    } else {
      if (c === ',') {
        result.push(current);
        current = '';
      } else if (c === '"') {
        inQuotes = true;
      } else {
        current += c;
      }
    }
  }

  result.push(current);
  return result;
}
