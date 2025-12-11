import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, Factory, FlagTriangleRight, TriangleAlert, XCircle } from "lucide-react";
import { EnterpriseData } from "@/data/mockData";
import { KPICard } from "../KPICard";
import { SubmissionQualityChart } from "../SubmissionQualityChart";
import { ErrorBreakdown } from "../ErrorBreakdown";
import { ProductivityRankings } from "../ProductivityRankings";
import { SubmissionMap } from "../SubmissionMap";
import { CountryFilter } from "../CountryFilter";

function formatPercent(value: number | null | undefined, digits = 1) {
  if (value == null) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

interface EnterpriseTabProps {
  submissions?: EnterpriseData[];
}

const normalizeStatus = (status?: string | null) => {
  const value = (status ?? "").toString().trim().toLowerCase();
  if (!value) return "";
  if (value.includes("not approved")) return "not approved";
  if (value.includes("approved")) return "approved";
  return value;
};

const getApprovalStatus = (submission: EnterpriseData) => {
  const record = submission as Record<string, unknown>;
  const rawQcStatus = record["QC Approval Status"] ?? submission.qcApprovalStatus;
  const statusValue = typeof rawQcStatus === "string" && rawQcStatus.trim()
    ? rawQcStatus
    : submission.status;

  return normalizeStatus(statusValue as string | undefined);
};

export function EnterpriseTab({ submissions = [] }: EnterpriseTabProps) {
  const [countryFilter, setCountryFilter] = useState<string>("all");

  const getSubmissionCountry = (submission: EnterpriseData) => {
    const record = submission as Record<string, unknown>;
    const rawCountry = record.A1_cal ?? record.country ?? submission.rawCountry;
    if (typeof rawCountry === "string" && rawCountry.trim()) {
      return rawCountry;
    }

    return submission.country;
  };

  const availableCountries = useMemo(() => {
    const unique = new Set(
      submissions
        .map((submission) => getSubmissionCountry(submission)?.trim())
        .filter(
          (country): country is string =>
            !!country && !country.toLowerCase().startsWith("unknown")
        )
    );

    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    if (countryFilter === "all") return submissions;
    return submissions.filter((submission) => {
      const country = getSubmissionCountry(submission);
      return country?.toLowerCase() === countryFilter.toLowerCase();
    });
  }, [countryFilter, submissions]);

  const derivedKpis = useMemo(() => {
    const approved = filteredSubmissions.filter(
      (submission) => getApprovalStatus(submission) === "approved"
    ).length;
    const notApproved = filteredSubmissions.filter(
      (submission) => getApprovalStatus(submission) === "not approved"
    ).length;

    const totalInterviews = filteredSubmissions.length;
    const approvalRate = totalInterviews ? approved / totalInterviews : 0;

    return {
      totalInterviews,
      approved,
      notApproved,
      approvalRate,
      totalFlags: 0,
      avgFlagsPerInterview: 0,
    };
  }, [filteredSubmissions]);

  const submissionChartData = useMemo(() => {
    const stats = new Map<string, { approved: number; notApproved: number }>();

    filteredSubmissions.forEach((submission) => {
      const enumeratorId = submission.enumerator || "Unknown";
      const status = getApprovalStatus(submission);
      const existing = stats.get(enumeratorId) ?? { approved: 0, notApproved: 0 };

      if (status === "approved") {
        existing.approved += 1;
      } else {
        existing.notApproved += 1;
      }

      stats.set(enumeratorId, existing);
    });

    return Array.from(stats.entries()).map(([name, counts]) => ({
      name,
      approved: counts.approved,
      notApproved: counts.notApproved,
    }));
  }, [filteredSubmissions]);

  const productivityData = useMemo(
    () =>
      submissionChartData.map((item) => ({
        name: item.name,
        totalInterviews: item.approved + item.notApproved,
        approved: item.approved,
      })),
    [submissionChartData]
  );

  const errorBreakdownData: { errorType: string; relatedVariables: string; count: number }[] = [];

  if (!submissions.length) {
    return <div>No Enterprise submissions available.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <CountryFilter
        countries={availableCountries}
        selected={countryFilter}
        onChange={setCountryFilter}
        variant="enterprise"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KPICard
          title="Total Interviews"
          value={derivedKpis.totalInterviews}
          icon={Factory}
          subtitle={formatPercent(derivedKpis.approvalRate, 1) + " approval"}
          variant="enterprise"
        />
        <KPICard
          title="Approved"
          value={derivedKpis.approved}
          icon={CheckCircle2}
          subtitle={`${derivedKpis.approvalRate > 0 ? formatPercent(derivedKpis.approvalRate) : "0%"}`}
          variant="enterprise"
        />
        <KPICard
          title="Not Approved"
          value={derivedKpis.notApproved}
          icon={XCircle}
          variant="enterprise"
        />
        <KPICard
          title="Total Flags"
          value={derivedKpis.totalFlags}
          icon={TriangleAlert}
          subtitle="Using main sheet data"
          variant="enterprise"
        />
        <KPICard
          title="Avg Flags / Interview"
          value={derivedKpis.avgFlagsPerInterview.toFixed(2)}
          icon={FlagTriangleRight}
          variant="enterprise"
        />
      </div>

      <SubmissionMap
        submissions={filteredSubmissions.map(s => ({
          latitude: s.latitude ?? 0,
          longitude: s.longitude ?? 0,
          region: s.region,
          district: s.district,
          status: s.status,
          id: s.id,
          enumerator: s.enumerator,
        }))}
        title="Live Enterprise Submission Map"
        variant="enterprise"
      />

      <SubmissionQualityChart
        data={submissionChartData}
        variant="enterprise"
      />

      <ProductivityRankings data={productivityData} variant="enterprise" />

      <ErrorBreakdown data={errorBreakdownData} variant="enterprise" />
    </div>
  );
}
