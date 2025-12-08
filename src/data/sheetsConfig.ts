export type SurveyKey = 'farmer' | 'enterprise' | 'youth';

interface SheetConfig {
  sheetId?: string;
  sheetName?: string;
  sheetGid?: string;
}

const env = import.meta.env as Record<string, string | undefined>;

const getEnv = (...keys: string[]): string | undefined => {
  return keys.map((key) => env[key]).find(Boolean);
};

export const sheetConfigs: Record<SurveyKey, SheetConfig> = {
  farmer: {
    sheetId: getEnv('VITE_GOOGLE_SHEET_ID_FARMER', 'VITE_FARMER_SHEET_ID', 'VITE_SHEET_ID_FARMERS'),
    sheetName: getEnv('VITE_GOOGLE_SHEET_NAME_FARMER', 'VITE_FARMER_SHEET_NAME', 'VITE_SHEET_NAME_FARMERS'),
    sheetGid: getEnv('VITE_GOOGLE_SHEET_GID_FARMER', 'VITE_FARMER_SHEET_GID', 'VITE_SHEET_GID_FARMERS'),
  },
  enterprise: {
    sheetId: getEnv(
      'VITE_GOOGLE_SHEET_ID_ENTERPRISE',
      'VITE_ENTERPRISE_SHEET_ID',
      'VITE_SHEET_ID_ENTERPRISE'
    ),
    sheetName: getEnv(
      'VITE_GOOGLE_SHEET_NAME_ENTERPRISE',
      'VITE_ENTERPRISE_SHEET_NAME',
      'VITE_SHEET_NAME_ENTERPRISE'
    ),
    sheetGid: getEnv(
      'VITE_GOOGLE_SHEET_GID_ENTERPRISE',
      'VITE_ENTERPRISE_SHEET_GID',
      'VITE_SHEET_GID_ENTERPRISE'
    ),
  },
  youth: {
    sheetId: getEnv('VITE_GOOGLE_SHEET_ID_YOUTH', 'VITE_YOUTH_SHEET_ID', 'VITE_SHEET_ID_YOUTH'),
    sheetName: getEnv('VITE_GOOGLE_SHEET_NAME_YOUTH', 'VITE_YOUTH_SHEET_NAME', 'VITE_SHEET_NAME_YOUTH'),
    sheetGid: getEnv('VITE_GOOGLE_SHEET_GID_YOUTH', 'VITE_YOUTH_SHEET_GID', 'VITE_SHEET_GID_YOUTH'),
  },
};
