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

  // gviz returns JS, not pure JSON; strip wrapper
  const jsonText = text
    .replace(/^[^{]+/, "") // remove leading "/*O_o*/google.visualization.Query.setResponse("
    .replace(/;?$/, "");   // remove trailing ");"

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (e) {
    console.error("Failed to parse gviz response", e, text);
    throw new Error("Could not parse Google Sheets response");
  }

  const table = (parsed as { table?: { rows?: Array<{ c?: Array<{ v: unknown } | null> }> } }).table;

  if (!table || !table.rows) {
    return [];
  }

  const rows = table.rows as Array<{ c?: Array<{ v: unknown } | null> }>;
  const values: string[][] = rows.map((row) =>
    (row.c || []).map((cell) =>
      cell && cell.v != null ? String(cell.v) : ""
    )
  );

  // Header row: we assume first row contains header text
  // If your sheet already has a proper header row at row 1, this is fine.
  // If you do something more complex, adjust here.
  return values;
}
