import { useCallback, useEffect, useState } from 'react';

export interface SheetHookState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

interface SheetConfig {
  sheetId: string;
  gid?: string;
}

export function useSheetData<T>(
  config: SheetConfig | undefined,
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
    if (!config?.sheetId) {
      setError('Missing Google Sheet ID in environment variables');
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function run() {
      setLoading(true);
      setError(null);

      try {
        let url = `https://docs.google.com/spreadsheets/d/${config.sheetId}/gviz/tq?tqx=out:csv`;
        if (config.gid) {
          url += `&gid=${config.gid}`;
        }

        const res = await fetch(url, { signal: controller.signal });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Unable to fetch sheet. Check Sheet ID and GID.`);
        }

        const csv = await res.text();

        if (!csv.trim()) {
          throw new Error('Sheet is empty or not accessible');
        }

        const rows = csvToObjects(csv);
        const mapped = rows.map(mapRow);

        setData(mapped);
        setError(null);
      } catch (err: any) {
        if (!controller.signal.aborted) {
          console.error('Sheet fetch error:', err);
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
  }, [config?.sheetId, config?.gid, mapRow, reloadToken]);

  return { data, loading, error, refresh };
}

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

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];

    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') {
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
