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
      {/* Row 1 – Snapshot KPIs */}
      <section className="space-y-4">
        <SectionHeader
          eyebrow="Enterprise Snapshot"
          title="Key quality indicators for enterprise interviews"
          description="Track total enterprise interviews, approvals, and the QC flag profile across respondents."
          accent="enterprise"
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
                : 0
            )}
            icon={XCircle}
            variant="enterprise"
          />
          <KPICard
            title="Total Flags"
            value={kpis.totalFlags}
            icon={TriangleAlert}
            subtitle={`${submissionQuality.hardFlags.toLocaleString()} hard / ${submissionQuality.softFlags.toLocaleString()} soft`}
            variant="enterprise"
          />
          <KPICard
            title="Avg Flags / Interview"
            value={kpis.avgFlagsPerInterview.toFixed(2)}
            subtitle="Average number of QC flags per completed interview"
            icon={FlagTriangleRight}
            variant="enterprise"
          />
        </div>
      </section>

      {/* Row 2 – Quality & Error patterns */}
      <section className="space-y-4">
        <SectionHeader
          eyebrow="Approvals & QC Patterns"
          title="Submission quality and error distribution"
          description="See how approvals differ across enterprise interviewers and which QC checks trigger most often."
          accent="enterprise"
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SubmissionQualityChart data={submissionChartData} variant="enterprise" />
          <ErrorBreakdown data={errorBreakdownData} variant="enterprise" />
        </div>
      </section>

      {/* Row 3 – Enumerator productivity */}
      <section className="space-y-4">
        <SectionHeader
          eyebrow="Enumerator Performance"
          title="Productivity and approval outcomes by enumerator"
          description="Compare enterprise interviewers on volume, approvals, and rejection patterns."
          accent="enterprise"
        />
        <ProductivityRankings data={productivityData} variant="enterprise" />
      </section>
    </div>
  );
}
