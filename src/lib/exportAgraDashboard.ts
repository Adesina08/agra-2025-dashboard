import type { SheetRow } from "@/lib/googleSheets";

export type ExportType = "all" | "approved" | "notApproved" | "errorFlags";
export type Segment = "farmer" | "enterprise" | "youth";

// column name candidates for approval status
const APPROVAL_KEY_CANDIDATES = [
  "qc_final_status",
  "qc final status",
  "qc status",
  "qc_status",
  "approval_status",
  "approval status",
  "interview_status",
  "interview status",
];

function normalize(str: string | undefined | null): string {
  return (str ?? "").trim().toLowerCase();
}

function detectApprovalStatusField(row: SheetRow): string | null {
  const keys = Object.keys(row);
  for (const key of keys) {
    const k = normalize(key);
    if (APPROVAL_KEY_CANDIDATES.includes(k)) return key;
  }

  // fallback: any column whose name contains "qc" and "status"
  for (const key of keys) {
    const k = normalize(key);
    if (k.includes("status") && k.includes("qc")) return key;
  }

  return null;
}

function rowStatus(row: SheetRow, statusKey: string | null): string | null {
  if (!statusKey) return null;
  return normalize(row[statusKey]);
}

function isApproved(status: string | null): boolean {
  if (!status) return false;
  if (status.includes("not")) return false;
  if (status.includes("reject") || status.includes("disapprove")) return false;
  return status.includes("approve");
}

function isNotApproved(status: string | null): boolean {
  if (!status) return false;
  if (status.includes("reject") || status.includes("disapprove")) return true;
  if (status.includes("not") && status.includes("approve")) return true;
  return false;
}

function rowHasErrorFlags(row: SheetRow): boolean {
  // any non-empty field whose header mentions "flag" or "error"
  for (const [key, value] of Object.entries(row)) {
    const k = normalize(key);
    const v = normalize(value);
    if ((k.includes("flag") || k.includes("error")) && v && v !== "0" && v !== "none") {
      return true;
    }
  }
  return false;
}

function toCsvValue(value: string | undefined): string {
  const v = value ?? "";
  const needsQuotes = /[",\n]/.test(v);
  const escaped = v.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function buildCsv(rows: SheetRow[]): string {
  if (!rows.length) return "";

  const headerSet = new Set<string>();
  rows.forEach((row) => {
    Object.keys(row).forEach((k) => headerSet.add(k));
  });
  const headers = Array.from(headerSet);

  const lines: string[] = [];
  lines.push(headers.map((h) => toCsvValue(h)).join(","));

  for (const row of rows) {
    const line = headers.map((h) => toCsvValue(row[h])).join(",");
    lines.push(line);
  }

  return lines.join("\n");
}

export function exportAgraData(
  rows: SheetRow[],
  options: { type: ExportType; segment: Segment },
) {
  if (!rows || rows.length === 0) return;

  const statusKey = detectApprovalStatusField(rows[0]);
  let filtered: SheetRow[] = rows;

  switch (options.type) {
    case "approved":
      filtered = rows.filter((row) => isApproved(rowStatus(row, statusKey)));
      break;
    case "notApproved":
      filtered = rows.filter((row) => isNotApproved(rowStatus(row, statusKey)));
      break;
    case "errorFlags":
      filtered = rows.filter((row) => rowHasErrorFlags(row));
      break;
    case "all":
    default:
      filtered = rows;
      break;
  }

  // if filter gives 0 rows, still export headers, so fall back to full set
  const csv = buildCsv(filtered.length ? filtered : rows);
  if (!csv) return;

  const today = new Date().toISOString().slice(0, 10);
  const filename = `agra_${options.segment}_${options.type}_${today}.csv`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
