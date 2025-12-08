import {
  ClipboardCheck,
  CheckCircle2,
  FlagTriangleRight,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { useYouthQcData } from "@/hooks/useSegmentQcData";
import { KPICard } from "../KPICard";
import { SubmissionQualityChart } from "../SubmissionQualityChart";
import { ErrorBreakdown } from "../ErrorBreakdown";
import { ProductivityRankings } from "../ProductivityRankings";
import { SectionHeader } from "../SectionHeader";

function formatPercent(value: number | null | undefined, digits = 1) {
  if (value == null) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

export function YouthTab() {
  const { loading, error, submissionQuality, errorBreakdown, interviewerStats, kpis } =
    useYouthQcData();

  if (loading) return <div>Loading Youth QC…</div>;
  if (error || !submissionQuality || !errorBreakdown || !interviewerStats || !kpis) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        Unable to load Youth QC data. Please check your QC sheets configuration.
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
          eyebrow="Youth Snapshot"
          title="Key quality indicators for youth interviews"
          description="Understand youth segment coverage, approvals, and QC flag patterns at a glance."
          accent="youth"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KPICard
            title="Total Interviews"
            value={submissionQuality.totalInterviews}
            icon={ClipboardCheck}
            subtitle="All completed youth interviews"
            variant="youth"
          />
          <KPICard
            title="Approved"
            value={submissionQuality.approved}
            subtitle={formatPercent(submissionQuality.approvalRate) + " approval rate"}
            icon={CheckCircle2}
            variant="youth"
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
            subtitle="Average number of QC flags per completed interview"
            icon={FlagTriangleRight}
            variant="youth"
          />
        </div>
      </section>

      {/* Row 2 – Quality & Error patterns */}
      <section className="space-y-4">
        <SectionHeader
          eyebrow="Approvals & QC Patterns"
          title="Submission quality and error distribution"
          description="Inspect youth interview approval vs rejection and the mix of quality control flags."
          accent="youth"
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SubmissionQualityChart data={submissionChartData} variant="youth" />
          <ErrorBreakdown data={errorBreakdownData} variant="youth" />
        </div>
      </section>

      {/* Row 3 – Enumerator productivity */}
      <section className="space-y-4">
        <SectionHeader
          eyebrow="Enumerator Performance"
          title="Productivity and approval outcomes by enumerator"
          description="Compare youth interview productivity and approval rates for each enumerator."
          accent="youth"
        />
        <ProductivityRankings data={productivityData} variant="youth" />
      </section>
    </div>
  );
}
