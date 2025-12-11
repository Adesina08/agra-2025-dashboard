import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, FlagTriangleRight, TriangleAlert, XCircle } from "lucide-react";
import { KPICard } from "../KPICard";
import { SubmissionQualityChart } from "../SubmissionQualityChart";
import { ErrorBreakdown } from "../ErrorBreakdown";
import { ProductivityRankings } from "../ProductivityRankings";
import { FarmerData } from "@/data/mockData";
import { SubmissionMap } from "../SubmissionMap"; // NEW IMPORT
import { CountryFilter } from "../CountryFilter";
import { farmerQuotaConfig } from "@/data/quotaData";
import { QuotaSection } from "../QuotaSection";

function formatPercent(value: number | null | undefined, digits = 1) {
  if (value == null) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

const normalizeString = (value?: string | null) => value?.trim().toLowerCase() || "";

const getFarmerEnumeratorId = (submission: FarmerData) => {
  const record = submission as Record<string, unknown>;
  const rawUsername = record.username ?? record.USERNAME;
  if (typeof rawUsername === "string" && rawUsername.trim()) {
    return rawUsername;
  }

  return submission.enumerator;
};

interface FarmerTabProps {
  submissions?: FarmerData[];
}

const normalizeStatus = (status?: string | null) => {
  const value = (status ?? "").toString().trim().toLowerCase();
  if (!value) return "";
  if (value.includes("not approved")) return "not approved";
  if (value.includes("approved")) return "approved";
  return value;
};

const getApprovalStatus = (submission: FarmerData) => {
  const record = submission as Record<string, unknown>;
  const rawQcStatus = record["QC Approval Status"] ?? submission.qcApprovalStatus;
  const statusValue = typeof rawQcStatus === "string" && rawQcStatus.trim()
    ? rawQcStatus
    : submission.status;

  return normalizeStatus(statusValue as string | undefined);
};

export function FarmerTab({ submissions = [] }: FarmerTabProps) {
  const [countryFilter, setCountryFilter] = useState<string>("all");

  const getSubmissionCountry = (submission: FarmerData) => {
    const record = submission as Record<string, unknown>;
    const rawCountry = record.dccot ?? record.country ?? submission.rawCountry;
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
    Object.keys(farmerQuotaConfig.countries).forEach((country) => unique.add(country));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    if (countryFilter === "all") return submissions;
    return submissions.filter((submission) => {
      const country = getSubmissionCountry(submission);
      return normalizeString(country) === normalizeString(countryFilter);
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
      const enumeratorId = getFarmerEnumeratorId(submission) || "Unknown";
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
    return <div>No Farmer submissions available.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <CountryFilter
        countries={availableCountries}
        selected={countryFilter}
        onChange={setCountryFilter}
        variant="farmer"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KPICard
          title="Total Interviews"
          value={derivedKpis.totalInterviews}
          icon={ClipboardCheck}
          subtitle={formatPercent(derivedKpis.approvalRate, 1) + " approval"}
          variant="farmer"
        />
        <KPICard
          title="Approved"
          value={derivedKpis.approved}
          icon={CheckCircle2}
          subtitle={`${derivedKpis.approvalRate > 0 ? formatPercent(derivedKpis.approvalRate) : "0%"}`}
          variant="farmer"
        />
        <KPICard
          title="Not Approved"
          value={derivedKpis.notApproved}
          icon={XCircle}
          variant="farmer"
        />
        <KPICard
          title="Total Flags"
          value={derivedKpis.totalFlags}
          icon={TriangleAlert}
          subtitle="Using main sheet data"
          variant="farmer"
        />
        <KPICard
          title="Avg Flags / Interview"
          value={derivedKpis.avgFlagsPerInterview.toFixed(2)}
          icon={FlagTriangleRight}
          variant="farmer"
        />
      </div>

      <QuotaSection
        variant="farmer"
        submissions={submissions}
        selectedCountry={countryFilter}
        config={farmerQuotaConfig}
        title="Farmer quota status"
      />

      {/* NEW: Real Map with Markers - Updates with country filter */}
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
        title="Live Farmer Submission Map"
        variant="farmer"
      />

      <SubmissionQualityChart
        data={submissionChartData}
        variant="farmer"
      />

      <ProductivityRankings data={productivityData} variant="farmer" />

      <ErrorBreakdown data={errorBreakdownData} variant="farmer" />
    </div>
  );
}
