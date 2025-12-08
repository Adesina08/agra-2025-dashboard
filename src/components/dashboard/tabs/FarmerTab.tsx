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
      {/* Row 1 – Snapshot KPIs */}
      <section className="space-y-4">
        <SectionHeader
          eyebrow="Farmer Snapshot"
          title="Key quality indicators for farmer interviews"
          description="Monitor total interviews, approval outcomes, and QC flag burden across the farmer segment."
          accent="farmer"
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
                : 0
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
            subtitle="Average number of QC flags per completed interview"
            icon={FlagTriangleRight}
            variant="farmer"
          />
        </div>
      </section>

      {/* Row 2 – Quality & Error patterns (two side-by-side cards) */}
      <section className="space-y-4">
        <SectionHeader
          eyebrow="Approvals & QC Patterns"
          title="Submission quality and error distribution"
          description="Understand where approvals are falling through and which QC checks are most frequently triggered."
          accent="farmer"
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SubmissionQualityChart data={submissionChartData} variant="farmer" />
          <ErrorBreakdown data={errorBreakdownData} variant="farmer" />
        </div>
      </section>

      {/* Row 3 – Enumerator productivity */}
      <section className="space-y-4">
        <SectionHeader
          eyebrow="Enumerator Performance"
          title="Productivity and approval outcomes by enumerator"
          description="Review throughput and approval rates across field staff to identify coaching opportunities."
          accent="farmer"
        />
        <ProductivityRankings data={productivityData} variant="farmer" />
      </section>
    </div>
  );
}
