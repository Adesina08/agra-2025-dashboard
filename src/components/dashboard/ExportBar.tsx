import { useMemo } from "react";
import { Download, CheckCircle, XCircle, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SheetRow } from "@/lib/googleSheets";
import { exportAgraData, type Segment, type ExportType } from "@/lib/exportAgraDashboard";

interface ExportBarProps {
  rows: SheetRow[];
  segment: Segment;
}

export function ExportBar({ rows, segment }: ExportBarProps) {
  const hasRows = useMemo(() => Array.isArray(rows) && rows.length > 0, [rows]);

  const handleExport = (type: ExportType) => {
    if (!hasRows) return;
    exportAgraData(rows, { type, segment });
  };

  return (
    <div className="border-t border-border/60 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm">
        <div className="text-[11px] text-muted-foreground">
          Export the current segment&apos;s survey data as CSV.
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => handleExport("all")}
            variant="default"
            size="sm"
            className="w-full gap-2 sm:w-auto"
            disabled={!hasRows}
          >
            <Download className="h-4 w-4" />
            Export All Data
          </Button>

          <Button
            onClick={() => handleExport("approved")}
            variant="outline"
            size="sm"
            className="w-full gap-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500/10 sm:w-auto"
            disabled={!hasRows}
          >
            <CheckCircle className="h-4 w-4" />
            Export Approved Data
          </Button>

          <Button
            onClick={() => handleExport("notApproved")}
            variant="outline"
            size="sm"
            className="w-full gap-2 border-red-500 text-red-500 hover:bg-red-500/10 sm:w-auto"
            disabled={!hasRows}
          >
            <XCircle className="h-4 w-4" />
            Export Not Approved Data
          </Button>

          <Button
            onClick={() => handleExport("errorFlags")}
            variant="outline"
            size="sm"
            className="w-full gap-2 border-amber-500 text-amber-500 hover:bg-amber-500/10 sm:w-auto"
            disabled={!hasRows}
          >
            <Flag className="h-4 w-4" />
            Export Error Flags
          </Button>
        </div>
      </div>
    </div>
  );
}
