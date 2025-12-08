import { CheckCircle2, ClipboardCheck, Factory, FlagTriangleRight, TriangleAlert, XCircle } from "lucide-react";
import { useEnterpriseQcData } from "@/hooks/useSegmentQcData";
import { KPICard } from "../KPICard";
import { SubmissionQualityChart } from "../SubmissionQualityChart";
import { ErrorBreakdown } from "../ErrorBreakdown";
import { ProductivityRankings } from "../ProductivityRankings";

function formatPercent(value: number | null | undefined, digits = 1) {
  if (value == null) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

export function EnterpriseTab() {
  const { loading, error, submissionQuality, errorBreakdown, interviewerStats, kpis } = useEnterpriseQcData();

  if (loading) return <div>Loading Enterprise QC…</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!submissionQuality || !errorBreakdown || !interviewerStats || !kpis) {
    return <div>No Enterprise QC data.</div>;
  }

  const submissionChartData = interviewerStats.map((i) => ({
    name: i.enumeratorId,
    approved: i.approvedInterviews,
    notApproved: i.failedInterviews,
  }));

  const productivityData = interviewerStats.map((i) => ({
    name: i.enumeratorId,
    totalInterviews: i.totalSubmissions,
    approved: i.approvedInterviews,
  }));

  const errorBreakdownData = errorBreakdown.map((e) => ({
    errorType: e.errorType,
    relatedVariables: `${e.type} • ${e.category} • ${e.kpiCode}`,
    count: e.count,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KPICard
          title="Total Interviews"
          value={kpis.totalInterviews}
          icon={Factory}
          subtitle={formatPercent(kpis.approvalRate, 1) + " approval"}
          variant="enterprise"
        />
        <KPICard
          title="Approved"
          value={kpis.approved}
          icon={CheckCircle2}
          subtitle={`${submissionQuality.approvalRate > 0 ? formatPercent(submissionQuality.approvalRate) : "0%"}`}
          variant="enterprise"
        />
        <KPICard
          title="Not Approved"
          value={kpis.notApproved}
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
          icon={FlagTriangleRight}
          variant="enterprise"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubmissionQualityChart data={submissionChartData} variant="enterprise" />
        <ErrorBreakdown data={errorBreakdownData} variant="enterprise" />
      </div>

      <ProductivityRankings data={productivityData} variant="enterprise" />
    </div>
  );
}
