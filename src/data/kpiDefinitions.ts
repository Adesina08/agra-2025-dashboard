export interface KpiDefinition {
  kpi: string; // KPI001 …
  flagName: string; // High LOI, etc.
  type: 'HARD' | 'SOFT' | string;
  category: string; // META / NUMERIC …
  appliesTo: 'ALL' | 'FARMER' | 'YOUTH';
  variables: string; // formatted list of variables/columns
}

export const KPI_DEFINITIONS: KpiDefinition[] = [
  { kpi: 'KPI001', flagName: 'High LOI', type: 'SOFT', category: 'META', appliesTo: 'ALL', variables: 'start, end' },
  { kpi: 'KPI002', flagName: 'Low LOI', type: 'SOFT', category: 'META', appliesTo: 'ALL', variables: 'start, end' },
  { kpi: 'KPI003', flagName: 'Odd Hour', type: 'SOFT', category: 'META', appliesTo: 'ALL', variables: 'start' },
  { kpi: 'KPI004', flagName: 'Short Gap', type: 'SOFT', category: 'META', appliesTo: 'ALL', variables: 'start, end, deviceid' },
  { kpi: 'KPI005', flagName: 'Interwoven', type: 'HARD', category: 'META', appliesTo: 'ALL', variables: 'start, end, deviceid' },
  { kpi: 'KPI006', flagName: 'Clustered Interview', type: 'SOFT', category: 'META', appliesTo: 'ALL', variables: 'enumerator_id, gps_lat, gps_lon, start' },
  { kpi: 'KPI007', flagName: 'Duplicate Phone', type: 'SOFT', category: 'META', appliesTo: 'ALL', variables: 'respondent_phone' },
  { kpi: 'KPI008', flagName: 'Duplicate GPS', type: 'SOFT', category: 'META', appliesTo: 'ALL', variables: 'gps_lat, gps_lon' },
  { kpi: 'KPI009', flagName: 'Age < 18 (Farmer)', type: 'HARD', category: 'NUMERIC', appliesTo: 'FARMER', variables: 'D6, Age of respondent' },
  { kpi: 'KPI010', flagName: 'Age outside 18–35 (Youth)', type: 'HARD', category: 'NUMERIC', appliesTo: 'YOUTH', variables: 'D3, Age (Youth screening)' },
  { kpi: 'KPI011', flagName: 'Household size > 20', type: 'SOFT', category: 'NUMERIC', appliesTo: 'FARMER', variables: 'E14, Household size' },
  { kpi: 'KPI012', flagName: 'Good month pay very high', type: 'SOFT', category: 'NUMERIC', appliesTo: 'ALL', variables: 'DF3.3, Daily pay good month' },
  { kpi: 'KPI013', flagName: 'Bad month pay very high', type: 'SOFT', category: 'NUMERIC', appliesTo: 'ALL', variables: 'DF4.3, Daily pay bad month' },
  { kpi: 'KPI014', flagName: 'Daily pay very low', type: 'SOFT', category: 'NUMERIC', appliesTo: 'ALL', variables: 'DF3.3, DF4.3' },
  { kpi: 'KPI015', flagName: 'Weekly income out of range', type: 'SOFT', category: 'NUMERIC', appliesTo: 'ALL', variables: 'DF4.4' },
  { kpi: 'KPI016', flagName: 'Monthly income out of range', type: 'SOFT', category: 'NUMERIC', appliesTo: 'ALL', variables: 'DF2' },
  { kpi: 'KPI017', flagName: 'Seasonal amount out of range', type: 'SOFT', category: 'NUMERIC', appliesTo: 'ALL', variables: 'DF1.2, DF5.2' },
  { kpi: 'KPI018', flagName: 'Cultivated land unrealistic', type: 'SOFT', category: 'NUMERIC', appliesTo: 'ALL', variables: 'FM6, FM7' },
  { kpi: 'KPI019', flagName: 'Yield maize > 6000kg/ha', type: 'SOFT', category: 'NUMERIC', appliesTo: 'ALL', variables: 'FM26' },
  { kpi: 'KPI020', flagName: 'Yield soybean > 2500kg/ha', type: 'SOFT', category: 'NUMERIC', appliesTo: 'ALL', variables: 'FM26' },
  { kpi: 'KPI021', flagName: 'Yield rice > 5000kg/ha', type: 'SOFT', category: 'NUMERIC', appliesTo: 'ALL', variables: 'FM26' },
  { kpi: 'KPI022', flagName: 'Yield other crop > 6000kg/ha', type: 'SOFT', category: 'NUMERIC', appliesTo: 'ALL', variables: 'FM26' },
  { kpi: 'KPI023', flagName: 'Zero harvest but crop selected', type: 'SOFT', category: 'NUMERIC', appliesTo: 'ALL', variables: 'FM26' },
  { kpi: 'KPI024', flagName: 'Poultry birds sold > 5000', type: 'SOFT', category: 'NUMERIC', appliesTo: 'ALL', variables: 'FM27.1' },
  { kpi: 'KPI025', flagName: 'Annual egg revenue > 15m RWF', type: 'SOFT', category: 'NUMERIC', appliesTo: 'ALL', variables: 'FM27.4, FM27.5' },
  { kpi: 'KPI026', flagName: 'Crop sale very high', type: 'SOFT', category: 'NUMERIC', appliesTo: 'ALL', variables: 'FM28' },
  { kpi: 'KPI027', flagName: 'Crop sale very low', type: 'SOFT', category: 'NUMERIC', appliesTo: 'ALL', variables: 'FM28' },
];

export const KPI_BY_CODE: Record<string, KpiDefinition> = KPI_DEFINITIONS.reduce(
  (acc, def) => {
    acc[def.kpi] = def;
    return acc;
  },
  {} as Record<string, KpiDefinition>
);
