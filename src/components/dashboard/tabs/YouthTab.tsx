import { useMemo, useState } from "react";
import { ClipboardCheck, CheckCircle2, FlagTriangleRight, TriangleAlert, XCircle } from "lucide-react";
import { KPICard } from "../KPICard";
import { SubmissionQualityChart } from "../SubmissionQualityChart";
import { ErrorBreakdown } from "../ErrorBreakdown";
import { ProductivityRankings } from "../ProductivityRankings";
import { YouthData } from "@/data/mockData";
import { SubmissionMap } from "../SubmissionMap"; // NEW IMPORT
import { CountryFilter } from "../CountryFilter";
import { youthInWorkQuotaConfig, youthOutreachQuotaConfig } from "@/data/quotaData";
import { QuotaSection } from "../QuotaSection";
import { cn } from "@/lib/utils";

function formatPercent(value: number | null | undefined, digits = 1) {
  if (value == null) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

const normalizeString = (value?: string | null) => value?.trim().toLowerCase() || "";

const getYouthEnumeratorId = (submission: YouthData) => {
  const record = submission as Record<string, unknown>;
  const rawCaseId = record.caseid ?? record.CASEID;
  if (typeof rawCaseId === "string" && rawCaseId.trim()) {
    return rawCaseId;
  }

  return submission.enumerator;
};

interface YouthTabProps {
  submissions?: YouthData[];
}

const normalizeStatus = (status?: string | null) => {
  const value = (status ?? "").toString().trim().toLowerCase();
  if (!value) return "";
  if (value.includes("not approved")) return "not approved";
  if (value.includes("approved")) return "approved";
  return value;
};

const getApprovalStatus = (submission: YouthData) => {
  const record = submission as Record<string, unknown>;
  const rawQcStatus = record["QC Approval Status"] ?? submission.qcApprovalStatus;
  const statusValue = typeof rawQcStatus === "string" && rawQcStatus.trim()
    ? rawQcStatus
    : submission.status;

  return normalizeStatus(statusValue as string | undefined);
};

export function YouthTab({ submissions = [] }: YouthTabProps) {
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [quotaView, setQuotaView] = useState<"work" | "outreach">("work");

  const quotaTabs = useMemo(
    () => [
      { key: "work" as const, label: "Youth in Work", config: youthInWorkQuotaConfig },
      { key: "outreach" as const, label: "Outreach", config: youthOutreachQuotaConfig },
    ],
    []
  );

  const getSubmissionCountry = (submission: YouthData) => {
    const record = submission as Record<string, unknown>;
    const rawCountry = record.w1 ?? record.country ?? submission.rawCountry;
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
    quotaTabs.forEach(({ config }) => {
      Object.keys(config.countries).forEach((country) => unique.add(country));
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [quotaTabs, submissions]);

  const filteredSubmissions = useMemo(() => {
    if (countryFilter === "all") return submissions;

    const targetCountry = normalizeString(countryFilter);
    return submissions.filter((submission) => {
      const country = normalizeString(getSubmissionCountry(submission));
      return country === targetCountry;
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
      const enumeratorId = getYouthEnumeratorId(submission) || "Unknown";
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
    return <div>No Youth submissions available.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <CountryFilter
        countries={availableCountries}
        selected={countryFilter}
        onChange={setCountryFilter}
        variant="youth"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KPICard
          title="Total Interviews"
          value={derivedKpis.totalInterviews}
          icon={ClipboardCheck}
          subtitle={formatPercent(derivedKpis.approvalRate, 1) + " approval"}
          variant="youth"
        />
        <KPICard
          title="Approved"
          value={derivedKpis.approved}
          icon={CheckCircle2}
          subtitle={`${derivedKpis.approvalRate > 0 ? formatPercent(derivedKpis.approvalRate) : "0%"}`}
          variant="youth"
        />
        <KPICard
          title="Not Approved"
          value={derivedKpis.notApproved}
          icon={XCircle}
          variant="youth"
        />
        <KPICard
          title="Total Flags"
          value={derivedKpis.totalFlags}
          icon={TriangleAlert}
          subtitle="Using main sheet data"
          variant="youth"
        />
        <KPICard
          title="Avg Flags / Interview"
          value={derivedKpis.avgFlagsPerInterview.toFixed(2)}
          icon={FlagTriangleRight}
          variant="youth"
        />
      </div>

      <QuotaSection
        variant="youth"
        submissions={submissions}
        selectedCountry={countryFilter}
        config={quotaTabs.find((tab) => tab.key === quotaView)?.config ?? youthInWorkQuotaConfig}
        title="Youth quota status"
        workFocus={quotaView === "work" ? "Youth in Work" : "Outreach"}
        controls={
          <div className="flex flex-wrap gap-2">
            {quotaTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setQuotaView(tab.key)}
                className={cn(
                  "px-3 py-2 text-sm font-semibold rounded-lg border transition-colors",
                  quotaView === tab.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:bg-muted"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        }
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
        title="Live Youth Submission Map"
        variant="youth"
      />

      <SubmissionQualityChart
        data={submissionChartData}
        variant="youth"
      />

      <ProductivityRankings data={productivityData} variant="youth" />

      <ErrorBreakdown data={errorBreakdownData} variant="youth" />
    </div>
  );
}
