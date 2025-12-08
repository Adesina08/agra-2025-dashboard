import {
  CheckCircle2,
  ClipboardCheck,
  FlagTriangleRight,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { useFarmerQcData } from "@/hooks/useSegmentQcData";
import { KPICard } from "../KPICard";
import { SubmissionQualityChart } from "../SubmissionQualityChart";
import { ErrorBreakdown } from "../ErrorBreakdown";
import { ProductivityRankings } from "../ProductivityRankings";
import { SectionHeader } from "../SectionHeader";

function formatPercent(value: number | null | undefined, digits = 1) {
  if (value == null) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

export function FarmerTab() {
  const { loading, error, submissionQuality, errorBreakdown, interviewerStats, kpis } =
    useFarmerQcData();

  if (loading) return <div>Loading Farmer QC…</div>;
  if (error || !submissionQuality || !errorBreakdown || !interviewerStats || !kpis) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        Unable to load Farmer QC data. Please check your QC sheets configuration.
      </div>
    );
  }

  const submissionChartData = interviewerStats.map((stat) => ({
    interviewer: stat.name,
    approved: stat.approved,
    notApproved: stat.notApproved,
  }));

  const errorBreakdownData = errorBreakdown.map((item) => ({
    name: item.errorType,
    value: item.count,
    category: item.category,
    type: item.type,
    percentOfInterviews: item.percentOfInterviews,
  }));

  const productivityData = interviewerStats.map((stat) => ({
    interviewer: stat.name,
    totalInterviews: stat.totalInterviews,
    approved: stat.approved,
    notApproved: stat.notApproved,
    approvalRate: stat.approvalRate,
  }));

  return (
    <div className="space-y-8">
      {/* Row 1 – Summary KPIs */}
      <section className="space-y-3">
        <SectionHeader
          title="Farmer Snapshot"
          subtitle="Key quality indicators for farmer interviews – coverage, approvals, and QC flags."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KPICard
            title="Total Interviews"
            value={submissionQuality.totalInterviews}
            icon={ClipboardCheck}
            subtitle="All completed farmer interviews"
            variant="farmer"
          />
          <KPICard
            title="Approved"
            value={submissionQuality.approved}
            subtitle={formatPercent(submissionQuality.approvalRate) + " approval rate"}
            icon={CheckCircle2}
            variant="farmer"
          />
          <KPICard
            title="Not Approved"
            value={submissionQuality.notApproved}
            subtitle={formatPercent(
              submissionQuality.totalInterviews
                ? submissionQuality.notApproved / submissionQuality.totalInterviews
                : 0,
            )}
            icon={XCircle}
            variant="farmer"
          />
          <KPICard
            title="Total Flags"
            value={kpis.totalFlags}
            subtitle={`${submissionQuality.hardFlags.toLocaleString()} hard / ${submissionQuality.softFlags.toLocaleString()} soft`}
            icon={TriangleAlert}
            variant="farmer"
          />
          <KPICard
            title="Avg Flags / Interview"
            value={kpis.avgFlagsPerInterview.toFixed(2)}
            subtitle="Average QC flags per completed interview"
            icon={FlagTriangleRight}
            variant="farmer"
          />
        </div>
      </section>

      {/* Row 2 – Quality & error patterns */}
      <section className="space-y-3">
        <SectionHeader
          title="Approvals & Error Patterns"
          subtitle="Explore approval vs non-approval by interviewer and which QC flags trigger most often."
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SubmissionQualityChart data={submissionChartData} variant="farmer" />
          <ErrorBreakdown data={errorBreakdownData} variant="farmer" />
        </div>
      </section>

      {/* Row 3 – Enumerator productivity */}
      <section className="space-y-3">
        <SectionHeader
          title="Enumerator Productivity"
          subtitle="Compare farmer interview throughput and approval outcomes across enumerators."
        />
        <ProductivityRankings data={productivityData} variant="farmer" />
      </section>
    </div>
  );
}
