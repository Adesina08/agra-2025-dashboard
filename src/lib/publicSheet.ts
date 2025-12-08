// src/lib/publicSheet.ts

// Fetches a tab's data as a 2D array (string[][]) without API keys.
// Requires that the sheet is viewable by "anyone with the link".
export async function fetchPublicSheetValues(
  sheetId: string,
  tabName: string
): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?sheet=${encodeURIComponent(
    tabName
  )}&tq=${encodeURIComponent("select *")}`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to fetch '${tabName}': ${res.status} ${res.statusText} – ${text}`
    );
  }

  const text = await res.text();

  // --- 1) Robustly strip the gviz JS wrapper ---
  // Response looks like:  /*O_o*/\ngoogle.visualization.Query.setResponse({...});
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
    console.error("Unexpected gviz response format:", text);
    throw new Error("Could not parse Google Sheets response");
  }

  const jsonText = text.slice(jsonStart, jsonEnd + 1);

  let parsed: any;
  try {
    parsed = JSON.parse(jsonText);
  } catch (e) {
    console.error("Failed to parse gviz JSON:", e, jsonText);
    throw new Error("Could not parse Google Sheets response");
  }

  if (!parsed.table) {
    return [];
  }

  const table = parsed.table;
  const cols = table.cols || [];
  const rows = table.rows || [];

  // --- 2) Build header row ---
  // Prefer column labels from "cols"; if all empty, fallback to first data row.
  let header: string[] = cols.map((c: any) => (c && c.label) || "");

  const bodyRows: string[][] = rows.map((row: any) =>
    (row.c || []).map((cell: any) =>
      cell && cell.v != null ? String(cell.v) : ""
    )
  );

  const allHeaderEmpty = header.every((h) => h === "");

  if (allHeaderEmpty) {
    // e.g. your QC_*_DETAIL with "parsedNumHeaders": 0
    if (bodyRows.length === 0) return [];
    // First row in body is the header row
    const [firstRow, ...rest] = bodyRows;
    return [firstRow, ...rest];
  }

  // Normal case: use cols[].label as header
  return [header, ...bodyRows];
}
