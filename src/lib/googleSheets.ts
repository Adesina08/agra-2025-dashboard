export interface SheetRow {
  [key: string]: string;
}

interface FetchSheetOptions {
  sheetId: string;
  sheetName?: string;
  sheetGid?: string;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function parseCsv(text: string): SheetRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: SheetRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    return row;
  });
}

export async function fetchSheetRows({ sheetId, sheetName, sheetGid }: FetchSheetOptions): Promise<SheetRow[]> {
  const base = `https://docs.google.com/spreadsheets/d/${sheetId}/`;
  const url = sheetGid
    ? `${base}export?format=csv&gid=${sheetGid}`
    : `${base}gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName ?? '')}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch Google Sheet: ${response.status} ${response.statusText}`);
  }

  const csvText = await response.text();
  return parseCsv(csvText);
}
