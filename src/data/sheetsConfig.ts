export type SurveyKey = 'farmer' | 'enterprise' | 'youth';

interface SheetConfig {
  sheetId?: string;
  sheetName?: string;
}

export const sheetConfigs: Record<SurveyKey, SheetConfig> = {
  farmer: {
    sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_FARMER,
    sheetName: import.meta.env.VITE_GOOGLE_SHEET_NAME_FARMER,
  },
  enterprise: {
    sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_ENTERPRISE,
    sheetName: import.meta.env.VITE_GOOGLE_SHEET_NAME_ENTERPRISE,
  },
  youth: {
    sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_YOUTH,
    sheetName: import.meta.env.VITE_GOOGLE_SHEET_NAME_YOUTH,
  },
};
