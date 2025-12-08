import type { SurveySegment } from "@/config/qcSheets";

export interface ErrorBreakdownItem {
  errorType: string; // Flag Name
  kpiCode: string; // KPI001...
  type: "HARD" | "SOFT" | string;
  category: string; // META / NUMERIC / ...
  count: number;
  percentOfInterviews: number; // 0–1
}

export interface SubmissionQualityOverview {
  totalInterviews: number;
  approved: number;
  notApproved: number;
  approvalRate: number; // 0–1
  avgFlagsPerInterview: number;
  totalFlags: number;
  hardFlags: number;
  softFlags: number;
}

export interface InterviewerStats {
  enumeratorId: string;
  totalSubmissions: number;
  approvedInterviews: number;
  failedInterviews: number;
  totalFlags: number;
  flagsPerInterview: number;
}

export interface KpiCards {
  totalInterviews: number;
  approved: number;
  notApproved: number;
  approvalRate: number;
  totalFlags: number;
  avgFlagsPerInterview: number;
  percentDuplicatePhone: number | null;
  percentLOIIssues: number | null;
  percentHardViolations: number | null;
  ageOutsideYouthCount: number | null;
  ageOutsideYouthPercent: number | null;
}

export interface BuiltQcData {
  errorBreakdown: ErrorBreakdownItem[];
  submissionQuality: SubmissionQualityOverview;
  interviewerStats: InterviewerStats[];
  kpis: KpiCards;
}

function parsePercent(pct: string | undefined): number {
  if (!pct) return 0;
  return parseFloat(pct.replace("%", "")) / 100 || 0;
}

function parseNumber(value: string | undefined): number {
  if (!value) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * summaryValues: QC_*_SUMMARY tab values (string[][])
 * enumValues:    ENUM_* tab values (string[][])
 * detailValues:  QC_*_DETAIL tab values (string[][])
 */
export function buildQcDataFromSheets(
  segment: SurveySegment,
  summaryValues: string[][],
  enumValues: string[][],
  detailValues: string[][],
  surveyTypeLabelForDetail: string
): BuiltQcData {
  // 1) SUMMARY SHEET
  const [summaryHeader, ...summaryRows] = summaryValues;
  const idxKPI = summaryHeader.indexOf("KPI");
  const idxFlagName = summaryHeader.indexOf("Flag Name");
  const idxType = summaryHeader.indexOf("Type");
  const idxCategory = summaryHeader.indexOf("Category");
  const idxCount = summaryHeader.indexOf("Count");
  const idxPctInterviews = summaryHeader.indexOf("% Interviews");

  const errorBreakdown: ErrorBreakdownItem[] = summaryRows
    .filter((row) => parseNumber(row[idxCount]) > 0)
    .map((row) => ({
      kpiCode: row[idxKPI] || "",
      errorType: row[idxFlagName] || "",
      type: (row[idxType] as ErrorBreakdownItem["type"]) || "",
      category: row[idxCategory] || "",
      count: parseNumber(row[idxCount]),
      percentOfInterviews: parsePercent(row[idxPctInterviews]),
    }));

  const summaryByFlagName: Record<string, string[]> = {};
  for (const row of summaryRows) {
    const flagName = row[idxFlagName] || "";
    if (!flagName) continue;
    summaryByFlagName[flagName] = row;
  }

  const totalHardFlags = summaryRows
    .filter((r) => r[idxType] === "HARD")
    .reduce((sum, r) => sum + parseNumber(r[idxCount]), 0);

  const totalSoftFlags = summaryRows
    .filter((r) => r[idxType] === "SOFT")
    .reduce((sum, r) => sum + parseNumber(r[idxCount]), 0);

  const highLOI = summaryByFlagName["High LOI"];
  const lowLOI = summaryByFlagName["Low LOI"];
  const duplicatePhone = summaryByFlagName["Duplicate Phone"];
  const ageOutsideYouth = summaryByFlagName["Age outside 18–35 (Youth)"];

  const percentLOIIssues =
    parsePercent(highLOI?.[idxPctInterviews]) +
    parsePercent(lowLOI?.[idxPctInterviews]);

  const percentDuplicatePhone = duplicatePhone
    ? parsePercent(duplicatePhone[idxPctInterviews])
    : null;

  const ageOutsideYouthCount =
    segment === "youth" && ageOutsideYouth
      ? parseNumber(ageOutsideYouth[idxCount])
      : null;

  const ageOutsideYouthPercent =
    segment === "youth" && ageOutsideYouth
      ? parsePercent(ageOutsideYouth[idxPctInterviews])
      : null;

  const percentHardViolations = summaryRows
    .filter((r) => r[idxType] === "HARD")
    .reduce(
      (sum, r) => sum + parsePercent(r[idxPctInterviews]),
      0
    );

  // 2) ENUM SHEET
  const [enumHeader, ...enumRows] = enumValues;
  const idxEnumId = enumHeader.indexOf("EnumeratorID");
  const idxTotalSubs = enumHeader.indexOf("TotalSubmissions");
  const idxTotalFlags = enumHeader.indexOf("TotalFlags");

  // 3) DETAIL SHEET
  const [detailHeader, ...detailRows] = detailValues;
  const idxDSurveyType = detailHeader.indexOf("SurveyType");
  const idxDEnumId = detailHeader.indexOf("EnumeratorID");
  const idxDApproval = detailHeader.indexOf("Approval");

  const failedByEnumerator: Record<string, number> = {};
  for (const row of detailRows) {
    // If SurveyType column exists, filter; otherwise assume this detail sheet is only for that segment
    const surveyType =
      idxDSurveyType >= 0 ? row[idxDSurveyType] || "" : surveyTypeLabelForDetail;
    if (surveyType !== surveyTypeLabelForDetail) continue;

    const approval = row[idxDApproval] || "";
    if (approval !== "Not Approved") continue;

    const id = row[idxDEnumId] || "";
    if (!id) continue;

    failedByEnumerator[id] = (failedByEnumerator[id] || 0) + 1;
  }

  const interviewerStats: InterviewerStats[] = enumRows
    .filter((row) => row[idxEnumId])
    .map((row) => {
      const enumeratorId = row[idxEnumId];
      const totalSubmissions = parseNumber(row[idxTotalSubs]);
      const totalFlags = parseNumber(row[idxTotalFlags]); // per-flag as you described
      const failedInterviews = failedByEnumerator[enumeratorId] || 0;
      const approvedInterviews = Math.max(
        totalSubmissions - failedInterviews,
        0
      );
      const flagsPerInterview =
        totalSubmissions > 0 ? totalFlags / totalSubmissions : 0;

      return {
        enumeratorId,
        totalSubmissions,
        approvedInterviews,
        failedInterviews,
        totalFlags,
        flagsPerInterview,
      };
    });

  // 4) Overall submission quality
  const totalInterviews = interviewerStats.reduce(
    (sum, r) => sum + r.totalSubmissions,
    0
  );
  const totalFailed = interviewerStats.reduce(
    (sum, r) => sum + r.failedInterviews,
    0
  );
  const totalApproved = interviewerStats.reduce(
    (sum, r) => sum + r.approvedInterviews,
    0
  );
  const totalFlags = interviewerStats.reduce(
    (sum, r) => sum + r.totalFlags,
    0
  );

  const approvalRate =
    totalInterviews > 0 ? totalApproved / totalInterviews : 0;
  const avgFlagsPerInterview =
    totalInterviews > 0 ? totalFlags / totalInterviews : 0;

  const submissionQuality: SubmissionQualityOverview = {
    totalInterviews,
    approved: totalApproved,
    notApproved: totalFailed,
    approvalRate,
    avgFlagsPerInterview,
    totalFlags,
    hardFlags: totalHardFlags,
    softFlags: totalSoftFlags,
  };

  const kpis: KpiCards = {
    totalInterviews,
    approved: totalApproved,
    notApproved: totalFailed,
    approvalRate,
    totalFlags,
    avgFlagsPerInterview,
    percentDuplicatePhone,
    percentLOIIssues,
    percentHardViolations,
    ageOutsideYouthCount,
    ageOutsideYouthPercent,
  };

  return {
    errorBreakdown,
    submissionQuality,
    interviewerStats,
    kpis,
  };
}
