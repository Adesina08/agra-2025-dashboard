import * as React from "react";
import { fetchPublicSheetValues } from "@/lib/publicSheet";

export interface UseSheetValuesResult {
  values: string[][] | null;
  loading: boolean;
  error: string | null;
}

export function useSheetValues(
  sheetId: string,
  tabName: string
): UseSheetValuesResult {
  const [values, setValues] = React.useState<string[][] | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const v = await fetchPublicSheetValues(sheetId, tabName);
        if (!cancelled) {
          setValues(v);
          setLoading(false);
        }
      } catch (err: unknown) {
        console.error("[useSheetValues] Error:", err);
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load sheet values";
          setError(message);
          setLoading(false);
        }
      }
    }

    if (sheetId && tabName) {
      load();
    } else {
      setValues(null);
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [sheetId, tabName]);

  return { values, loading, error };
}
