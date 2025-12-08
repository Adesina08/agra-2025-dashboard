import * as React from "react";
import {
  QC_SHEETS_CONFIG,
  SurveySegment,
} from "@/config/qcSheets";
import {
  buildQcDataFromSheets,
  BuiltQcData,
} from "@/lib/buildQcDataFromSheets";
import { useSheetValues } from "@/hooks/useSheetValues";

export interface UseSegmentQcDataResult extends Partial<BuiltQcData> {
  loading: boolean;
  error: string | null;
}

export function useSegmentQcData(segment: SurveySegment): UseSegmentQcDataResult {
  const cfg = QC_SHEETS_CONFIG[segment];

  const summary = useSheetValues(cfg.sheetId, cfg.summaryTab);
  const enums = useSheetValues(cfg.sheetId, cfg.enumTab);
  const detail = useSheetValues(cfg.sheetId, cfg.detailTab);

  const loading = summary.loading || enums.loading || detail.loading;
  const error = summary.error || enums.error || detail.error;

  const built = React.useMemo(() => {
    if (!summary.values || !enums.values || !detail.values) return null;

    return buildQcDataFromSheets(
      segment,
      summary.values,
      enums.values,
      detail.values,
      cfg.surveyTypeLabel
    );
  }, [segment, summary.values, enums.values, detail.values, cfg.surveyTypeLabel]);

  if (!built) {
    return {
      loading,
      error,
    };
  }

  return {
    loading,
    error,
    ...built,
  };
}

// Thin wrappers for each section
export function useYouthQcData() {
  return useSegmentQcData("youth");
}

export function useFarmerQcData() {
  return useSegmentQcData("farmer");
}

export function useEnterpriseQcData() {
  return useSegmentQcData("enterprise");
}
