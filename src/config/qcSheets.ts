export type SurveySegment = "youth" | "farmer" | "enterprise";

export interface SegmentSheetsConfig {
  sheetId: string; // Spreadsheet ID (same for all segments)
  summaryTab: string; // QC_*_SUMMARY
  enumTab: string; // ENUM_*
  detailTab: string; // QC_*_DETAIL
  surveyTypeLabel: string; // if you still have SurveyType column
}

// Single Google Sheet for everything
export const QC_SHEET_ID =
  "16Hl3cYu_A1QRyCsUPRIs2UX0tv3-QjH3tZD-_lETZz0";

export const QC_SHEETS_CONFIG: Record<SurveySegment, SegmentSheetsConfig> = {
  youth: {
    sheetId: QC_SHEET_ID,
    summaryTab: "QC_Youth_SUMMARY",
    enumTab: "ENUM_Youth",
    detailTab: "QC_Youth_DETAIL",
    surveyTypeLabel: "Youth",
  },
  farmer: {
    sheetId: QC_SHEET_ID,
    summaryTab: "QC_Farmer_SUMMARY",
    enumTab: "ENUM_Farmer",
    detailTab: "QC_Farmer_DETAIL",
    surveyTypeLabel: "Farmer",
  },
  enterprise: {
    sheetId: QC_SHEET_ID,
    summaryTab: "QC_Enterprise_SUMMARY",
    enumTab: "ENUM_Enterprise",
    detailTab: "QC_Enterprise_DETAIL",
    surveyTypeLabel: "Enterprise",
  },
};
