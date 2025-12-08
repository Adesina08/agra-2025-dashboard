
import { SheetRow } from '@/lib/googleSheets';

export type QcSurveyKey = 'ENTERPRISE' | 'FARMER' | 'YOUTH';

const ENTERPRISE_SHEET_ID = '14-NNGFAQvanVNhhM0n-e4xJySWdR3TVfJX87AWLCYwM';
const FARMER_SHEET_ID = '10BOW33ym2LLzZKz6ZXh0dscK889Sk6ozQcKHlDvk5L4';
const YOUTH_SHEET_ID = '17x6j7YoqaYW4xn7qRtbX3KGzEvynYu_iHcShU6zoarw';

export const META_QC_CONFIG = {
  low_loi_multiplier: 0.5,
  high_loi_multiplier: 1.5,
  short_gap_threshold: 5,
  odd_hour_start: 19,
  odd_hour_end: 6,
  cluster_radius_meters: 15,
  cluster_time_window: 0,
};

export const SURVEYS: Record<QcSurveyKey, {
  key: QcSurveyKey;
  label: string;
  surveyType: string;
  sheetId: string;
  countryCol: string;
  metaCols: {
    start: string;
    end: string;
    deviceid: string;
    enumerator_id: string;
    respondent_phone: string;
    gps_lat: string;
    gps_lon: string;
    forceApproval: string;
  };
}> = {
  ENTERPRISE: {
    key: 'ENTERPRISE',
    label: 'Enterprise',
    surveyType: 'Enterprise',
    sheetId: ENTERPRISE_SHEET_ID,
    countryCol: 'int_country',
    metaCols: {
      start: 'start',
      end: 'end',
      deviceid: 'deviceid',
      enumerator_id: 'INT_NAME',
      respondent_phone: 'Respondent phone number',
      gps_lat: '_gps_latitude',
      gps_lon: '_gps_longitude',
      forceApproval: 'Force Approval Status',
    },
  },
  FARMER: {
    key: 'FARMER',
    label: 'Farmer',
    surveyType: 'Farmer',
    sheetId: FARMER_SHEET_ID,
    countryCol: 'int_country',
    metaCols: {
      start: 'start',
      end: 'end',
      deviceid: 'deviceid',
      enumerator_id: 'INT_NAME',
      respondent_phone: 'Respondent phone number',
      gps_lat: '_gps_latitude',
      gps_lon: '_gps_longitude',
      forceApproval: 'Force Approval Status',
    },
  },
  YOUTH: {
    key: 'YOUTH',
    label: 'Youth',
    surveyType: 'Youth',
    sheetId: YOUTH_SHEET_ID,
    countryCol: 'int_country',
    metaCols: {
      start: 'starttime',
      end: 'endtime',
      deviceid: 'deviceid',
      enumerator_id: 'username',
      respondent_phone: 'phone',
      gps_lat: '_gps_latitude',
      gps_lon: '_gps_longitude',
      forceApproval: 'Force Approval Status',
    },
  },
};

export const COUNTRY_THRESHOLDS = {
  GH: {
    code: 'GHS',
    goodDayHigh: 742,
    badDayHigh: 495,
    dayLow: 33,
    weekHigh: 4950,
    weekLow: 247.5,
    monthHigh: 14850,
    monthLow: 907.5,
    lumpHigh: 59400,
    lumpLow: 2970,
    saleHigh: 60000,
    saleLow: 2000,
  },
  MZ: {
    code: 'MZN',
    goodDayHigh: 2925,
    badDayHigh: 1950,
    dayLow: 130,
    weekHigh: 19500,
    weekLow: 975,
    monthHigh: 58500,
    monthLow: 3575,
    lumpHigh: 234000,
    lumpLow: 11700,
    saleHigh: 240000,
    saleLow: 8000,
  },
  MW: {
    code: 'MWK',
    goodDayHigh: 78750,
    badDayHigh: 52500,
    dayLow: 3500,
    weekHigh: 525000,
    weekLow: 26250,
    monthHigh: 1575000,
    monthLow: 96250,
    lumpHigh: 6300000,
    lumpLow: 315000,
    saleHigh: 6500000,
    saleLow: 200000,
  },
  RW: {
    code: 'RWF',
    goodDayHigh: 60750,
    badDayHigh: 40500,
    dayLow: 2700,
    weekHigh: 405000,
    weekLow: 20250,
    monthHigh: 1215000,
    monthLow: 74250,
    lumpHigh: 4860000,
    lumpLow: 243000,
    saleHigh: 5000000,
    saleLow: 150000,
  },
  TZ: {
    code: 'TZS',
    goodDayHigh: 109800,
    badDayHigh: 73200,
    dayLow: 4880,
    weekHigh: 732000,
    weekLow: 36600,
    monthHigh: 2196000,
    monthLow: 134200,
    lumpHigh: 8780000,
    lumpLow: 439200,
    saleHigh: 9000000,
    saleLow: 350000,
  },
};

export const QC_FLAG_DEFINITIONS = [
  { name: 'High LOI', type: 'SOFT', category: 'META', surveys: ['ALL'], variables: ['start', 'end'] },
  { name: 'Low LOI', type: 'SOFT', category: 'META', surveys: ['ALL'], variables: ['start', 'end'] },
  { name: 'Odd Hour', type: 'SOFT', category: 'META', surveys: ['ALL'], variables: ['start'] },
  { name: 'Short Gap', type: 'SOFT', category: 'META', surveys: ['ALL'], variables: ['start', 'end', 'deviceid'] },
  { name: 'Interwoven', type: 'HARD', category: 'META', surveys: ['ALL'], variables: ['start', 'end', 'deviceid'] },
  { name: 'Clustered Interview', type: 'SOFT', category: 'META', surveys: ['ALL'], variables: ['enumerator_id', 'gps_lat', 'gps_lon', 'start'] },
  { name: 'Duplicate Phone', type: 'SOFT', category: 'META', surveys: ['ALL'], variables: ['respondent_phone'] },
  { name: 'Duplicate GPS', type: 'SOFT', category: 'META', surveys: ['ALL'], variables: ['gps_lat', 'gps_lon'] },
  { name: 'Age < 18 (Farmer)', type: 'HARD', category: 'NUMERIC', surveys: ['FARMER'], variables: ['D6', 'Age of respondent'] },
  { name: 'Age outside 18–35 (Youth)', type: 'HARD', category: 'NUMERIC', surveys: ['YOUTH'], variables: ['D3', 'Age (Youth screening)'] },
  { name: 'Household size > 20', type: 'SOFT', category: 'NUMERIC', surveys: ['FARMER'], variables: ['E14', 'Household size'] },
  { name: 'Good month pay very high', type: 'SOFT', category: 'NUMERIC', surveys: ['ALL'], variables: ['DF3.3', 'Daily pay good month'] },
  { name: 'Bad month pay very high', type: 'SOFT', category: 'NUMERIC', surveys: ['ALL'], variables: ['DF4.3', 'Daily pay bad month'] },
  { name: 'Daily pay very low', type: 'SOFT', category: 'NUMERIC', surveys: ['ALL'], variables: ['DF3.3', 'DF4.3'] },
  { name: 'Weekly income out of range', type: 'SOFT', category: 'NUMERIC', surveys: ['ALL'], variables: ['DF4.4'] },
  { name: 'Monthly income out of range', type: 'SOFT', category: 'NUMERIC', surveys: ['ALL'], variables: ['DF2'] },
  { name: 'Seasonal amount out of range', type: 'SOFT', category: 'NUMERIC', surveys: ['ALL'], variables: ['DF1.2', 'DF5.2'] },
  { name: 'Cultivated land unrealistic', type: 'SOFT', category: 'NUMERIC', surveys: ['ALL'], variables: ['FM6', 'FM7'] },
  { name: 'Yield maize > 6000kg/ha', type: 'SOFT', category: 'NUMERIC', surveys: ['ALL'], variables: ['FM26'] },
  { name: 'Yield soybean > 2500kg/ha', type: 'SOFT', category: 'NUMERIC', surveys: ['ALL'], variables: ['FM26'] },
  { name: 'Yield rice > 5000kg/ha', type: 'SOFT', category: 'NUMERIC', surveys: ['ALL'], variables: ['FM26'] },
  { name: 'Yield other crop > 6000kg/ha', type: 'SOFT', category: 'NUMERIC', surveys: ['ALL'], variables: ['FM26'] },
  { name: 'Zero harvest but crop selected', type: 'SOFT', category: 'NUMERIC', surveys: ['ALL'], variables: ['FM26'] },
  { name: 'Poultry birds sold > 5000', type: 'SOFT', category: 'NUMERIC', surveys: ['ALL'], variables: ['FM27.1'] },
  { name: 'Annual egg revenue > 15m RWF', type: 'SOFT', category: 'NUMERIC', surveys: ['ALL'], variables: ['FM27.4', 'FM27.5'] },
  { name: 'Crop sale very high', type: 'SOFT', category: 'NUMERIC', surveys: ['ALL'], variables: ['FM28'] },
  { name: 'Crop sale very low', type: 'SOFT', category: 'NUMERIC', surveys: ['ALL'], variables: ['FM28'] },
];

function normalizeToFlagName(label: string) {
  return String(label).toUpperCase().replace(/[^A-Z0-9]+/g, '_');
}

function calculateDistanceMeters(lat1?: number, lon1?: number, lat2?: number, lon2?: number) {
  if ([lat1, lon1, lat2, lon2].some((v) => v == null || Number.isNaN(Number(v)))) return Infinity;
  const R = 6371e3;
  const φ1 = Number(lat1) * Math.PI / 180;
  const φ2 = Number(lat2) * Math.PI / 180;
  const dφ = (Number(lat2) - Number(lat1)) * Math.PI / 180;
  const dλ = (Number(lon2) - Number(lon1)) * Math.PI / 180;
  const a = Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function getThresholdForCountry(countryRaw: string | undefined) {
  if (!countryRaw) return null;
  const c = countryRaw.toUpperCase();
  if (c.includes('GHANA')) return COUNTRY_THRESHOLDS.GH;
  if (c.includes('MOZ') || c.includes('MOZAM')) return COUNTRY_THRESHOLDS.MZ;
  if (c.includes('MALAWI')) return COUNTRY_THRESHOLDS.MW;
  if (c.includes('RWANDA')) return COUNTRY_THRESHOLDS.RW;
  if (c.includes('TANZ') || c.includes('TZ')) return COUNTRY_THRESHOLDS.TZ;
  return null;
}

export interface QcIssue {
  idx: number;
  message: string;
  cols: string[];
}

export interface QcRowOutcome {
  idx: number;
  surveyType: string;
  status: 'pass' | 'fail';
  approval: 'Approved' | 'Not Approved' | 'Canceled';
  flagCount: number;
  flagCodes: string[];
  issues: string;
  cols: Set<string>;
  rowObj: SheetRowWithIdx;
}

export interface QcRunResult {
  cfg: typeof SURVEYS[QcSurveyKey];
  rows: SheetRowWithIdx[];
  perRow: QcRowOutcome[];
  flaggedRows: QcRowOutcome[];
  allErrors: Record<string, QcIssue[]>;
  allAffectedCols: Set<string>;
}

interface SheetRowWithIdx extends SheetRow {
  _rowNumber: number;
  _duration?: number | null;
}

function runMetadataQC(rows: SheetRowWithIdx[], surveyCfg: typeof SURVEYS[QcSurveyKey]) {
  const m = surveyCfg.metaCols;
  const errors: Record<string, QcIssue[]> = {};
  const flags = [
    'High LOI', 'Low LOI', 'Odd Hour', 'Short Gap', 'Interwoven',
    'Clustered Interview', 'Duplicate Phone', 'Duplicate GPS',
  ];
  flags.forEach((f) => { errors[f] = []; });

  rows.forEach((r) => {
    const s = r[m.start];
    const e = r[m.end];
    let dur: number | null = null;
    if (s && e) {
      const ds = new Date(s);
      const de = new Date(e);
      if (!Number.isNaN(ds.getTime()) && !Number.isNaN(de.getTime())) {
        dur = (de.getTime() - ds.getTime()) / (1000 * 60);
      }
    }
    r._duration = dur;
  });

  const durRows = rows.filter((r) => typeof r._duration === 'number' && !Number.isNaN(Number(r._duration)));
  const avgLOI = durRows.length
    ? durRows.reduce((sum, r) => sum + (r._duration || 0), 0) / durRows.length
    : 0;

  const phoneCounts: Record<string, number> = {};
  const gpsKeyMap: Record<string, SheetRowWithIdx[]> = {};
  const sessions: Record<string, Record<string, SheetRowWithIdx[]>> = {};

  rows.forEach((r) => {
    const phone = String(r[m.respondent_phone] || '').trim();
    if (phone) phoneCounts[phone] = (phoneCounts[phone] || 0) + 1;

    const did = r[m.deviceid];
    const startVal = r[m.start];
    if (did && startVal) {
      const t = new Date(startVal);
      if (!Number.isNaN(t.getTime())) {
        const d = t.toISOString().split('T')[0];
        sessions[did] = sessions[did] || {};
        sessions[did][d] = sessions[did][d] || [];
        sessions[did][d].push(r);
      }
    }

    const lat = parseFloat(String(r[m.gps_lat] ?? ''));
    const lon = parseFloat(String(r[m.gps_lon] ?? ''));
    if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
      const key = `${lat.toFixed(6)},${lon.toFixed(6)}`;
      gpsKeyMap[key] = gpsKeyMap[key] || [];
      gpsKeyMap[key].push(r);
    }
  });

  Object.keys(sessions).forEach((did) => {
    Object.keys(sessions[did]).forEach((d) => {
      sessions[did][d].sort((a, b) => new Date(String(a[m.start])).getTime() - new Date(String(b[m.start])).getTime());
    });
  });

  Object.entries(gpsKeyMap).forEach(([key, arr]) => {
    if (arr.length > 1) {
      arr.forEach((r) => {
        errors['Duplicate GPS'].push({
          idx: r._rowNumber,
          message: `Duplicate GPS coordinates ${key} also used in rows ${
            arr.map((o) => o._rowNumber).filter((n) => n !== r._rowNumber).join(', ')
          }`,
          cols: [m.gps_lat, m.gps_lon],
        });
      });
    }
  });

  rows.forEach((r) => {
    const rowIdx = r._rowNumber;

    if (avgLOI > 0 && typeof r._duration === 'number') {
      const lowT = META_QC_CONFIG.low_loi_multiplier * avgLOI;
      const highT = META_QC_CONFIG.high_loi_multiplier * avgLOI;
      if (r._duration < lowT) {
        errors['Low LOI'].push({
          idx: rowIdx,
          message: `LOI ${r._duration.toFixed(2)} min < ${lowT.toFixed(2)} (avg ${avgLOI.toFixed(2)})`,
          cols: [m.start, m.end],
        });
      }
      if (r._duration > highT) {
        errors['High LOI'].push({
          idx: rowIdx,
          message: `LOI ${r._duration.toFixed(2)} min > ${highT.toFixed(2)} (avg ${avgLOI.toFixed(2)})`,
          cols: [m.start, m.end],
        });
      }
    }

    const s = r[m.start];
    if (s) {
      const t = new Date(s);
      if (!Number.isNaN(t.getTime())) {
        const h = t.getHours();
        if (h < META_QC_CONFIG.odd_hour_end || h >= META_QC_CONFIG.odd_hour_start) {
          errors['Odd Hour'].push({
            idx: rowIdx,
            message: `Interview at ${h}:00 (timestamp ${t.toISOString()})`,
            cols: [m.start],
          });
        }
      }
    }

    const phone = String(r[m.respondent_phone] || '').trim();
    if (phone && phoneCounts[phone] > 1) {
      errors['Duplicate Phone'].push({
        idx: rowIdx,
        message: `Phone ${phone} appears ${phoneCounts[phone]} times`,
        cols: [m.respondent_phone],
      });
    }
  });

  Object.keys(sessions).forEach((did) => {
    Object.keys(sessions[did]).forEach((d) => {
      const arr = sessions[did][d];
      for (let i = 1; i < arr.length; i++) {
        const prev = arr[i - 1];
        const curr = arr[i];
        const prevEnd = new Date(String(prev[m.end]));
        const currStart = new Date(String(curr[m.start]));
        if (Number.isNaN(prevEnd.getTime()) || Number.isNaN(currStart.getTime())) continue;
        const diffMin = (currStart.getTime() - prevEnd.getTime()) / (1000 * 60);
        const currIdx = curr._rowNumber;
        const prevIdx = prev._rowNumber;
        if (diffMin < 0) {
          errors['Interwoven'].push({
            idx: currIdx,
            message: `Overlap with previous interview (rows ${prevIdx} → ${currIdx}) by ${Math.abs(Math.round(diffMin))} min`,
            cols: [m.start, m.end, m.deviceid],
          });
        } else if (diffMin < META_QC_CONFIG.short_gap_threshold) {
          errors['Short Gap'].push({
            idx: currIdx,
            message: `Short gap of ${diffMin.toFixed(1)} minutes from row ${prevIdx} on device ${did}`,
            cols: [m.start, m.end, m.deviceid],
          });
        }
      }
    });
  });

  rows.forEach((r) => {
    const lat1 = parseFloat(String(r[m.gps_lat] ?? ''));
    const lon1 = parseFloat(String(r[m.gps_lon] ?? ''));
    if (Number.isNaN(lat1) || Number.isNaN(lon1)) return;
    const enumId = (r[m.enumerator_id] || 'Unknown').toString();
    const clusterWith: number[] = [];
    rows.forEach((other) => {
      if (other === r) return;
      if ((other[m.enumerator_id] || 'Unknown').toString() !== enumId) return;
      const lat2 = parseFloat(String(other[m.gps_lat] ?? ''));
      const lon2 = parseFloat(String(other[m.gps_lon] ?? ''));
      if (Number.isNaN(lat2) || Number.isNaN(lon2)) return;
      if (META_QC_CONFIG.cluster_time_window > 0) {
        const t1 = new Date(String(r[m.start]));
        const t2 = new Date(String(other[m.start]));
        const dt = Math.abs(t1.getTime() - t2.getTime()) / (1000 * 60);
        if (dt > META_QC_CONFIG.cluster_time_window) return;
      }
      const dMeters = calculateDistanceMeters(lat1, lon1, lat2, lon2);
      if (dMeters <= META_QC_CONFIG.cluster_radius_meters) {
        clusterWith.push(other._rowNumber);
      }
    });
    if (clusterWith.length > 0) {
      errors['Clustered Interview'].push({
        idx: r._rowNumber,
        message: `Clustered with rows ${clusterWith.join(', ')} within ${META_QC_CONFIG.cluster_radius_meters}m. Enumerator ${enumId}`,
        cols: [m.gps_lat, m.gps_lon, m.enumerator_id],
      });
    }
  });

  return { errors };
}

function runNumericQC(rows: SheetRowWithIdx[], surveyCfg: typeof SURVEYS[QcSurveyKey], allErrors: Record<string, QcIssue[]>) {
  const countryCol = surveyCfg.countryCol;

  const ensureFlagBucket = (name: string) => {
    if (!allErrors[name]) allErrors[name] = [];
  };

  const pushFlag = (name: string, idx: number, message: string, cols?: string[]) => {
    ensureFlagBucket(name);
    allErrors[name].push({ idx, message, cols: cols || [] });
  };

  rows.forEach((r) => {
    const idx = r._rowNumber;
    const country = r[countryCol] as string | undefined;
    const th = getThresholdForCountry(country);

    if (surveyCfg.key === 'FARMER') {
      const v = parseFloat(String(r['D6'] ?? r['Age of respondent'] ?? ''));
      if (!Number.isNaN(v) && v < 18) {
        pushFlag('Age < 18 (Farmer)', idx, `Age ${v} < 18`, ['D6', 'Age of respondent']);
      }
    }
    if (surveyCfg.key === 'YOUTH') {
      const v = parseFloat(String(r['D3'] ?? r['Age (Youth screening)'] ?? ''));
      if (!Number.isNaN(v) && (v < 18 || v > 35)) {
        pushFlag('Age outside 18–35 (Youth)', idx, `Age ${v} outside 18–35`, ['D3', 'Age (Youth screening)']);
      }
    }

    if (surveyCfg.key === 'FARMER') {
      const v = parseFloat(String(r['E14'] ?? r['Household size'] ?? ''));
      if (!Number.isNaN(v) && v > 20) {
        pushFlag('Household size > 20', idx, `Household size ${v} > 20`, ['E14', 'Household size']);
      }
    }

    if (!th) return;

    const good = parseFloat(String(r['DF3.3'] ?? ''));
    if (!Number.isNaN(good) && good > th.goodDayHigh) {
      pushFlag('Good month pay very high', idx, `Daily pay good month ${good} > ${th.goodDayHigh} ${th.code}`, ['DF3.3']);
    }
    const bad = parseFloat(String(r['DF4.3'] ?? ''));
    if (!Number.isNaN(bad) && bad > th.badDayHigh) {
      pushFlag('Bad month pay very high', idx, `Daily pay bad month ${bad} > ${th.badDayHigh} ${th.code}`, ['DF4.3']);
    }

    if (!Number.isNaN(good) && good < th.dayLow) {
      pushFlag('Daily pay very low', idx, `Good month daily pay ${good} < ${th.dayLow} ${th.code}`, ['DF3.3']);
    }
    if (!Number.isNaN(bad) && bad < th.dayLow) {
      pushFlag('Daily pay very low', idx, `Bad month daily pay ${bad} < ${th.dayLow} ${th.code}`, ['DF4.3']);
    }

    const week = parseFloat(String(r['DF4.4'] ?? ''));
    if (!Number.isNaN(week) && week > th.weekHigh) {
      pushFlag('Weekly income out of range', idx, `Weekly income ${week} > ${th.weekHigh} ${th.code}`, ['DF4.4']);
    }
    if (!Number.isNaN(week) && week < th.weekLow) {
      pushFlag('Weekly income out of range', idx, `Weekly income ${week} < ${th.weekLow} ${th.code}`, ['DF4.4']);
    }

    const month = parseFloat(String(r['DF2'] ?? ''));
    if (!Number.isNaN(month) && month > th.monthHigh) {
      pushFlag('Monthly income out of range', idx, `Monthly income ${month} > ${th.monthHigh} ${th.code}`, ['DF2']);
    }
    if (!Number.isNaN(month) && month < th.monthLow) {
      pushFlag('Monthly income out of range', idx, `Monthly income ${month} < ${th.monthLow} ${th.code}`, ['DF2']);
    }

    const lump = Math.max(parseFloat(String(r['DF1.2'] ?? '')), parseFloat(String(r['DF5.2'] ?? '')));
    if (!Number.isNaN(lump)) {
      if (lump > th.lumpHigh) {
        pushFlag('Seasonal amount out of range', idx, `Seasonal / lump sum ${lump} > ${th.lumpHigh} ${th.code}`, ['DF1.2', 'DF5.2']);
      } else if (lump < th.lumpLow) {
        pushFlag('Seasonal amount out of range', idx, `Seasonal / lump sum ${lump} < ${th.lumpLow} ${th.code}`, ['DF1.2', 'DF5.2']);
      }
    }

    const area = parseFloat(String(r['FM6'] ?? ''));
    const unit = String(r['FM7'] ?? '').toLowerCase();
    if (!Number.isNaN(area) && unit) {
      let ha = Number.NaN;
      if (unit.includes('acre')) ha = area * 0.40468564197;
      else if (unit.includes('hect')) ha = area;
      else if (unit.includes('square') || unit.includes('sqm') || unit.includes('metre')) ha = area / 10000;
      if (!Number.isNaN(ha) && (ha <= 0 || ha > 15)) {
        pushFlag('Cultivated land unrealistic', idx, `Plot size ${ha.toFixed(2)} ha outside (0, 15]`, ['FM6', 'FM7']);
      }
    }

    const crop = (r['FM26_crop'] || r['Crop'] || '').toString().toLowerCase();
    const harvestKg = parseFloat(String(r['FM26'] ?? ''));
    const plotHa = parseFloat(String(r['FM26_ha'] ?? ''));
    if (!Number.isNaN(harvestKg) && !Number.isNaN(plotHa) && plotHa > 0) {
      const yld = harvestKg / plotHa;
      const cols = ['FM26'];
      if (crop.includes('maize')) {
        if (yld > 6000) pushFlag('Yield maize > 6000kg/ha', idx, `Maize yield ${yld.toFixed(1)} kg/ha > 6000`, cols);
      } else if (crop.includes('soy')) {
        if (yld > 2500) pushFlag('Yield soybean > 2500kg/ha', idx, `Soybean yield ${yld.toFixed(1)} kg/ha > 2500`, cols);
      } else if (crop.includes('rice')) {
        if (yld > 5000) pushFlag('Yield rice > 5000kg/ha', idx, `Rice yield ${yld.toFixed(1)} kg/ha > 5000`, cols);
      } else {
        if (yld > 6000) pushFlag('Yield other crop > 6000kg/ha', idx, `Other crop yield ${yld.toFixed(1)} kg/ha > 6000`, cols);
      }
    }
    if (!Number.isNaN(harvestKg) && harvestKg === 0 && crop) {
      pushFlag('Zero harvest but crop selected', idx, 'Crop selected but harvest = 0', ['FM26']);
    }

    if (country && country.toLowerCase().includes('rwa')) {
      const birds = parseFloat(String(r['FM27.1'] ?? ''));
      if (!Number.isNaN(birds) && birds > 5000) {
        pushFlag('Poultry birds sold > 5000', idx, `Poultry birds sold ${birds} > 5000`, ['FM27.1']);
      }
      const eggPrice = parseFloat(String(r['FM27.4'] ?? ''));
      const eggQty = parseFloat(String(r['FM27.5'] ?? ''));
      if (!Number.isNaN(eggPrice) && !Number.isNaN(eggQty)) {
        const annual = eggPrice * eggQty * 52;
        if (annual > 15000000) {
          pushFlag('Annual egg revenue > 15m RWF', idx, `Annual egg revenue ${annual.toLocaleString()} > 15,000,000`, ['FM27.4', 'FM27.5']);
        }
      }
    }

    const sale = parseFloat(String(r['FM28'] ?? ''));
    if (!Number.isNaN(sale)) {
      if (sale > th.saleHigh) {
        pushFlag('Crop sale very high', idx, `Crop sales value ${sale} > ${th.saleHigh} ${th.code}`, ['FM28']);
      } else if (sale < th.saleLow) {
        pushFlag('Crop sale very low', idx, `Crop sales value ${sale} < ${th.saleLow} ${th.code}`, ['FM28']);
      }
    }
  });
}

export function runQcEngine(rows: SheetRow[], surveyKey: QcSurveyKey): QcRunResult {
  const cfg = SURVEYS[surveyKey];
  const rowsWithIdx: SheetRowWithIdx[] = rows.map((row, idx) => ({
    ...row,
    _rowNumber: Number((row as SheetRowWithIdx)._rowNumber) || idx + 2,
  }));

  const metaResult = runMetadataQC(rowsWithIdx, cfg);
  const allErrors: Record<string, QcIssue[]> = {};
  Object.keys(metaResult.errors).forEach((name) => {
    allErrors[name] = metaResult.errors[name].slice();
  });

  runNumericQC(rowsWithIdx, cfg, allErrors);

  const perRow = new Map<number, { flags: Set<string>; issues: string[]; cols: Set<string> }>();
  rowsWithIdx.forEach((r) => {
    perRow.set(r._rowNumber, { flags: new Set(), issues: [], cols: new Set() });
  });

  Object.entries(allErrors).forEach(([flagName, list]) => {
    list.forEach((e) => {
      const bucket = perRow.get(e.idx);
      if (!bucket) return;
      const code = normalizeToFlagName(flagName);
      bucket.flags.add(code);
      bucket.issues.push(`${flagName}: ${e.message}`);
      (e.cols || []).forEach((c) => bucket.cols.add(c));
    });
  });

  const forceCol = cfg.metaCols.forceApproval;
  const perRowOutput: QcRowOutcome[] = [];
  const allAffectedCols = new Set<string>();

  rowsWithIdx.forEach((r) => {
    const idx = r._rowNumber;
    const bucket = perRow.get(idx);
    if (!bucket) return;
    const flagArr = Array.from(bucket.flags);
    bucket.cols.forEach((c) => allAffectedCols.add(c));

    let status: QcRowOutcome['status'] = 'pass';
    let approval: QcRowOutcome['approval'] = 'Approved';
    if (flagArr.length > 0) {
      status = 'fail';
      approval = 'Not Approved';
    }

    const fasRaw = String(r[forceCol] || '').trim().toLowerCase();
    if (fasRaw === 'approve' || fasRaw === 'approved') {
      approval = 'Approved';
    } else if (['cancel', 'canceled', 'cancelled'].includes(fasRaw)) {
      approval = 'Canceled';
    }

    perRowOutput.push({
      idx,
      surveyType: cfg.surveyType,
      status,
      approval,
      flagCount: flagArr.length,
      flagCodes: flagArr,
      issues: bucket.issues.join(' | '),
      cols: bucket.cols,
      rowObj: r,
    });
  });

  const flaggedRows = perRowOutput.filter((r) => r.flagCount > 0);
  return { cfg, rows: rowsWithIdx, perRow: perRowOutput, flaggedRows, allErrors, allAffectedCols };
}

export interface QualityMetrics {
  submissionQuality: { name: string; approved: number; notApproved: number }[];
  errorBreakdown: { errorType: string; relatedVariables: string; count: number }[];
  interviewerStats: { name: string; totalInterviews: number; approved: number }[];
}

export function deriveQualityMetrics(result: QcRunResult): QualityMetrics {
  const enumeratorKey = result.cfg.metaCols.enumerator_id;
  const approvalByInterviewer: Record<string, { name: string; approved: number; notApproved: number; totalInterviews: number }> = {};

  result.perRow.forEach((row) => {
    const interviewer = (row.rowObj[enumeratorKey] || 'Unknown').toString() || 'Unknown';
    if (!approvalByInterviewer[interviewer]) {
      approvalByInterviewer[interviewer] = { name: interviewer, approved: 0, notApproved: 0, totalInterviews: 0 };
    }
    approvalByInterviewer[interviewer].totalInterviews += 1;
    if (row.approval === 'Approved') {
      approvalByInterviewer[interviewer].approved += 1;
    } else {
      approvalByInterviewer[interviewer].notApproved += 1;
    }
  });

  const applicableFlags = QC_FLAG_DEFINITIONS.filter((def) => def.surveys.includes('ALL') || def.surveys.includes(result.cfg.key));
  const errorBreakdown = applicableFlags.map((def) => ({
    errorType: def.name,
    relatedVariables: (def.variables || []).join(', '),
    count: result.allErrors[def.name]?.length || 0,
  }));

  return {
    submissionQuality: Object.values(approvalByInterviewer),
    interviewerStats: Object.values(approvalByInterviewer).map(({ name, approved, notApproved, totalInterviews }) => ({
      name,
      approved,
      totalInterviews,
      notApproved,
    })),
    errorBreakdown,
  };
}
