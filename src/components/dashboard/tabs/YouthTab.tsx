import { useMemo, useState } from "react";
import { ClipboardCheck, CheckCircle2, FlagTriangleRight, TriangleAlert, XCircle } from "lucide-react";
import { type UseSegmentQcDataResult } from "@/hooks/useSegmentQcData";
import { KPICard } from "../KPICard";
import { SubmissionQualityChart } from "../SubmissionQualityChart";
import { ErrorBreakdown } from "../ErrorBreakdown";
import { ProductivityRankings } from "../ProductivityRankings";
import { YouthData } from "@/data/mockData";
import { SubmissionMap } from "../SubmissionMap";
import { KPI_BY_CODE } from "@/data/kpiDefinitions";
import { QuotaTracker } from "../QuotaTracker";
import { cn } from "@/lib/utils";

function formatPercent(value: number | null | undefined, digits = 1) {
  if (value == null) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

interface YouthTabProps {
  submissions?: YouthData[];
  qcData: UseSegmentQcDataResult;
}

export function YouthTab({ submissions = [], qcData }: YouthTabProps) {
  const { loading, error, submissionQuality, errorBreakdown, interviewerStats, kpis } = qcData;
  const [mode, setMode] = useState<"youth_work" | "youth_outreach">("youth_work");

  const filteredData = useMemo(() => {
    return submissions.filter((entry) => {
      const label = entry.programLabel?.toLowerCase();
      if (!label) return true;
      return mode === "youth_work" ? label.includes("work") : label.includes("outreach");
    });
  }, [mode, submissions]);

  if (loading) return <div>Loading Youth QC…</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!submissionQuality || !errorBreakdown || !interviewerStats || !kpis) {
    return <div>No Youth QC data.</div>;
  }

  const firstCountryLabel = submissions[0]?.country ?? submissions[0]?.programLabel;
  const countryLabel = firstCountryLabel ?? "All countries";

  const submissionChartData = interviewerStats.map((i) => ({
    name: i.enumeratorId,
    approved: i.approvedInterviews,
    notApproved: i.failedInterviews,
    flagsByKpi: i.flagsByKpi,
  }));

  const productivityData = interviewerStats.map((i) => ({
    name: i.enumeratorId,
    totalInterviews: i.totalSubmissions,
    approved: i.approvedInterviews,
  }));

  const errorBreakdownData = errorBreakdown.map((e) => {
    const kpi = KPI_BY_CODE[e.kpiCode];
    return {
      errorType: `${e.kpiCode} • ${e.errorType}`,
      relatedVariables: kpi?.variables ?? '—',
      count: e.count,
    };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Country: <span className="font-semibold text-foreground">{countryLabel}</span>
        </span>

        <div className="inline-flex rounded-full border border-border/60 bg-background/40 p-1 text-xs">
          <button
            className={cn(
              "px-3 py-1 rounded-full",
              mode === "youth_work" ? "bg-background shadow-sm" : "text-muted-foreground"
            )}
            onClick={() => setMode("youth_work")}
          >
            Youth in Work
          </button>
          <button
            className={cn(
              "px-3 py-1 rounded-full",
              mode === "youth_outreach" ? "bg-background shadow-sm" : "text-muted-foreground"
            )}
            onClick={() => setMode("youth_outreach")}
          >
            Outreach
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KPICard
          title="Total Interviews"
          value={kpis.totalInterviews}
          icon={ClipboardCheck}
          subtitle={formatPercent(kpis.approvalRate, 1) + " approval"}
          variant="youth"
        />
        <KPICard
          title="Approved"
          value={kpis.approved}
          icon={CheckCircle2}
          subtitle={`${submissionQuality.approvalRate > 0 ? formatPercent(submissionQuality.approvalRate) : "0%"}`}
          variant="youth"
        />
        <KPICard
          title="Not Approved"
          value={kpis.notApproved}
          icon={XCircle}
          variant="youth"
        />
        <KPICard
          title="Total Flags"
          value={kpis.totalFlags}
          icon={TriangleAlert}
          subtitle={`${submissionQuality.hardFlags.toLocaleString()} hard / ${submissionQuality.softFlags.toLocaleString()} soft`}
          variant="youth"
        />
        <KPICard
          title="Avg Flags / Interview"
          value={kpis.avgFlagsPerInterview.toFixed(2)}
          icon={FlagTriangleRight}
          variant="youth"
        />
      </div>

      <div className="space-y-6">
        <QuotaTracker
          variant="youth"
          program={mode}
          country={firstCountryLabel}
          data={filteredData}
        />
        <SubmissionQualityChart data={submissionChartData} variant="youth" />
        <ErrorBreakdown data={errorBreakdownData} variant="youth" />
      </div>

      <SubmissionMap
        submissions={filteredData}
        title="Live Youth Submission Map"
        variant="youth"
      />

      <ProductivityRankings data={productivityData} variant="youth" />
    </div>
  );
}
