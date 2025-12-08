import {
  CheckCircle2,
  ClipboardCheck,
  Factory,
  FlagTriangleRight,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { useEnterpriseQcData } from "@/hooks/useSegmentQcData";
import { KPICard } from "../KPICard";
import { SubmissionQualityChart } from "../SubmissionQualityChart";
import { ErrorBreakdown } from "../ErrorBreakdown";
import { ProductivityRankings } from "../ProductivityRankings";
import { SectionHeader } from "../SectionHeader";

function formatPercent(value: number | null | undefined, digits = 1) {
  if (value == null) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

export function EnterpriseTab() {
  const { loading, error, submissionQuality, errorBreakdown, interviewerStats, kpis } =
    useEnterpriseQcData();

  if (loading) return <div>Loading Enterprise QC…</div>;
  if (error || !submissionQuality || !errorBreakdown || !interviewerStats || !kpis) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        Unable to load Enterprise QC data. Please check your QC sheets configuration.
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
          title="Enterprise Snapshot"
          subtitle="Key quality indicators for enterprise interviews – volume, approvals, and QC flags."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KPICard
            title="Total Interviews"
            value={submissionQuality.totalInterviews}
            icon={Factory}
            subtitle="All completed enterprise interviews"
            variant="enterprise"
          />
          <KPICard
            title="Approved"
            value={submissionQuality.approved}
            subtitle={formatPercent(submissionQuality.approvalRate) + " approval rate"}
            icon={CheckCircle2}
            variant="enterprise"
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
            variant="enterprise"
          />
          <KPICard
            title="Total Flags"
            value={kpis.totalFlags}
            subtitle={`${submissionQuality.hardFlags.toLocaleString()} hard / ${submissionQuality.softFlags.toLocaleString()} soft`}
            icon={TriangleAlert}
            variant="enterprise"
          />
          <KPICard
            title="Avg Flags / Interview"
            value={kpis.avgFlagsPerInterview.toFixed(2)}
            subtitle="Average QC flags per completed interview"
            icon={FlagTriangleRight}
            variant="enterprise"
          />
        </div>
      </section>

      {/* Row 2 – Quality & error patterns */}
      <section className="space-y-3">
        <SectionHeader
          title="Approvals & Error Patterns"
          subtitle="Approval vs non-approval by enumerator and QC flag distribution for enterprise respondents."
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SubmissionQualityChart data={submissionChartData} variant="enterprise" />
          <ErrorBreakdown data={errorBreakdownData} variant="enterprise" />
        </div>
      </section>

      {/* Row 3 – Enumerator productivity */}
      <section className="space-y-3">
        <SectionHeader
          title="Enumerator Productivity"
          subtitle="Enterprise interview throughput and approval outcomes by enumerator."
        />
        <ProductivityRankings data={productivityData} variant="enterprise" />
      </section>
    </div>
  );
}
