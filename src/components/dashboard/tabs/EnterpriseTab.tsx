import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, Factory, FlagTriangleRight, TriangleAlert, XCircle } from "lucide-react";
import { type UseSegmentQcDataResult } from "@/hooks/useSegmentQcData";
import { EnterpriseData } from "@/data/mockData";
import { KPICard } from "../KPICard";
import { SubmissionQualityChart } from "../SubmissionQualityChart";
import { ErrorBreakdown } from "../ErrorBreakdown";
import { ProductivityRankings } from "../ProductivityRankings";
import { KPI_BY_CODE } from "@/data/kpiDefinitions";
import { SubmissionMap } from "../SubmissionMap";
import { CountryFilter } from "../CountryFilter";

function formatPercent(value: number | null | undefined, digits = 1) {
  if (value == null) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

interface EnterpriseTabProps {
  submissions?: EnterpriseData[];
  qcData: UseSegmentQcDataResult;
}

export function EnterpriseTab({ qcData, submissions = [] }: EnterpriseTabProps) {
  const { loading, error, submissionQuality, errorBreakdown, interviewerStats, kpis } = qcData;
  const [countryFilter, setCountryFilter] = useState<string>("all");

  const hasData = !!(submissionQuality && errorBreakdown && interviewerStats && kpis);
  const safeInterviewerStats = useMemo(() =>
    (interviewerStats ?? []).map((stat) => ({
      ...stat,
      approvedInterviews: stat.approvedInterviews ?? 0,
      failedInterviews: stat.failedInterviews ?? 0,
      totalSubmissions: stat.totalSubmissions ?? 0,
      totalFlags: stat.totalFlags ?? 0,
      flagsByKpi: stat.flagsByKpi ?? {},
    })), [interviewerStats]
  );

  const safeKpis = useMemo(() => {
    if (!kpis) {
      return {
        totalInterviews: 0,
        approved: 0,
        notApproved: 0,
        approvalRate: 0,
        totalFlags: 0,
        avgFlagsPerInterview: 0,
        percentDuplicatePhone: null,
        percentLOIIssues: null,
        percentHardViolations: null,
        ageOutsideYouthCount: null,
        ageOutsideYouthPercent: null,
      };
    }
    return kpis;
  }, [kpis]);

  const getSubmissionCountry = (submission: EnterpriseData) => {
    const rawCountry = (submission as Record<string, unknown>).A1_cal;
    return typeof rawCountry === "string" && rawCountry.trim()
      ? rawCountry
      : submission.country;
  };

  // ✅ Only keep Enterprise rows where F1_Q is NOT blank
  const validSubmissions = useMemo(
    () =>
      submissions.filter((submission) => {
        const value = (submission as Record<string, unknown>)["F1_Q"];
        if (value == null) return false;
        if (typeof value === "string") return value.trim() !== "";
        return true;
      }),
    [submissions]
  );

  const availableCountries = useMemo(() => {
    const unique = new Set(
      validSubmissions
        .map((submission) => getSubmissionCountry(submission)?.trim())
        .filter(
          (country): country is string =>
            !!country && !country.toLowerCase().startsWith("unknown")
        )
    );

    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [validSubmissions]);

  const filteredSubmissions = useMemo(() => {
    if (countryFilter === "all") return validSubmissions;
    return validSubmissions.filter((submission) => {
      const country = getSubmissionCountry(submission);
      return country?.toLowerCase() === countryFilter.toLowerCase();
    });
  }, [countryFilter, validSubmissions]);

  const filteredInterviewerStats = useMemo(() => {
    const normalize = (value?: string | null) => value?.trim().toLowerCase() || "";

    if (countryFilter === "all") return safeInterviewerStats;
    const targetCountry = normalize(countryFilter);

    const statsWithCountry = safeInterviewerStats.filter(
      (stat) => normalize(stat.country) === targetCountry
    );
    if (statsWithCountry.length) return statsWithCountry;

    const enumeratorsInCountry = new Set(
      filteredSubmissions
        .map((submission) => normalize(submission.enumerator))
        .filter(Boolean)
    );
    if (!enumeratorsInCountry.size) return [];

    return safeInterviewerStats.filter((stat) =>
      enumeratorsInCountry.has(normalize(stat.enumeratorId))
    );
  }, [countryFilter, filteredSubmissions, safeInterviewerStats]);

  const filteredFlagTotals = useMemo(() => {
    if (!submissionQuality?.flagTotals) return {};

    if (countryFilter === "all") {
      return submissionQuality.flagTotals;
    }

    if (!filteredInterviewerStats.length) return submissionQuality.flagTotals;

    const totals: Record<string, number> = {};
    filteredInterviewerStats.forEach((stat) => {
      Object.entries(stat.flagsByKpi ?? {}).forEach(([kpiCode, count]) => {
        totals[kpiCode] = (totals[kpiCode] || 0) + (count ?? 0);
      });
    });
    return totals;
  }, [countryFilter, filteredInterviewerStats, submissionQuality]);

  const flagNameByCode = useMemo(() => {
    const map: Record<string, string> = {};
    (errorBreakdown ?? []).forEach((item) => {
      if (item.kpiCode) {
        map[item.kpiCode] = item.errorType || KPI_BY_CODE[item.kpiCode]?.flagName || item.kpiCode;
      }
    });
    Object.keys(filteredFlagTotals).forEach((code) => {
      map[code] = map[code] || KPI_BY_CODE[code]?.flagName || code;
    });
    return map;
  }, [errorBreakdown, filteredFlagTotals]);

  const derivedKpis = useMemo(() => {
    // Derive KPIs directly from filtered submissions and interviewer stats.
    // This always respects the country filter and the F1_Q validation rule
    // so only valid enterprise interviews are counted.
    const getApprovalStatus = (submission: EnterpriseData) => {
      const rawStatus = (submission as Record<string, unknown>)["QC Approval Status"];
      return typeof rawStatus === "string" && rawStatus.trim()
        ? rawStatus
        : submission.status;
    };

    const normalizeStatus = (status: string | undefined | null) => {
      const s = status?.trim().toLowerCase();
      if (!s) return "";
      if (s === "approved") return "approved";
      if (s === "not approved" || s === "not_approved") return "not approved";
      return s;
    };

    const approvedFromSubmissions = filteredSubmissions.filter(
      (submission) => normalizeStatus(getApprovalStatus(submission)) === "approved"
    ).length;
    const notApprovedFromSubmissions = filteredSubmissions.filter(
      (submission) => normalizeStatus(getApprovalStatus(submission)) === "not approved"
    ).length;

    const hasSubmissionData = filteredSubmissions.length > 0;
    const hasInterviewerStats = filteredInterviewerStats.length > 0;
    const noFilteredData =
      countryFilter !== "all" && !hasSubmissionData && !hasInterviewerStats;

    const totalsFromStats = filteredInterviewerStats.reduce(
      (acc, stat) => ({
        totalSubmissions: acc.totalSubmissions + stat.totalSubmissions,
        approved: acc.approved + stat.approvedInterviews,
        failed: acc.failed + stat.failedInterviews,
        totalFlags: acc.totalFlags + stat.totalFlags,
      }),
      { totalSubmissions: 0, approved: 0, failed: 0, totalFlags: 0 }
    );

    const hasFlagData = Object.keys(filteredFlagTotals).length > 0;
    const totalFlagsFromFlags = Object.values(filteredFlagTotals).reduce(
      (sum, count) => sum + count,
      0
    );

    // Prefer QC interviewer stats when available, then submission data, then unfiltered rollups
    const totalInterviews = hasInterviewerStats
      ? totalsFromStats.totalSubmissions
      : hasSubmissionData
        ? filteredSubmissions.length
        : noFilteredData
          ? 0
          : safeKpis.totalInterviews;

    const approved = hasInterviewerStats
      ? totalsFromStats.approved
      : hasSubmissionData
        ? approvedFromSubmissions
        : noFilteredData
          ? 0
          : safeKpis.approved;

    const notApproved = hasInterviewerStats
      ? totalsFromStats.failed
      : hasSubmissionData
        ? notApprovedFromSubmissions
        : noFilteredData
          ? 0
          : safeKpis.notApproved;

    const approvalRate = totalInterviews ? approved / totalInterviews : 0;

    // For flags, keep preferring QC data (since not in submissions), but fall back appropriately
    const totalFlags = hasFlagData
      ? totalFlagsFromFlags
      : hasInterviewerStats
        ? totalsFromStats.totalFlags
        : noFilteredData
          ? 0
          : safeKpis.totalFlags;
    const avgFlagsPerInterview = totalInterviews ? totalFlags / totalInterviews : 0;

    return {
      totalInterviews,
      approved,
      notApproved,
      approvalRate,
      totalFlags,
      avgFlagsPerInterview,
    };
  }, [countryFilter, filteredSubmissions, filteredInterviewerStats, filteredFlagTotals, safeKpis]);

  const submissionChartData = safeInterviewerStats.map((i) => ({
    name: i.enumeratorId,
    approved: i.approvedInterviews,
    notApproved: i.failedInterviews,
    flagsByKpi: i.flagsByKpi,
  }));

  const productivityData = safeInterviewerStats.map((i) => ({
    name: i.enumeratorId,
    totalInterviews: i.totalSubmissions,
    approved: i.approvedInterviews,
  }));

  const flagCountsByType = useMemo(
    () =>
      Object.entries(filteredFlagTotals).reduce(
        (acc, [kpiCode, count]) => {
          const type = KPI_BY_CODE[kpiCode]?.type?.toUpperCase();
          if (type === "HARD") {
            acc.hard += count;
          } else {
            acc.soft += count;
          }
          return acc;
        },
        { hard: 0, soft: 0 }
      ),
    [filteredFlagTotals]
  );

  const flagSubtitle =
    flagCountsByType.hard + flagCountsByType.soft > 0
      ? `${flagCountsByType.hard.toLocaleString()} hard / ${flagCountsByType.soft.toLocaleString()} soft`
      : undefined;

  const errorBreakdownData = useMemo(() => {
    const entries = Object.entries(filteredFlagTotals);
    if (entries.length) {
      return entries.map(([kpiCode, count]) => {
        const kpi = KPI_BY_CODE[kpiCode];
        return {
          errorType: `${kpiCode} • ${kpi?.flagName ?? "Flag"}`,
          relatedVariables: kpi?.variables ?? "—",
          count,
        };
      });
    }

    if (!errorBreakdown?.length) return [];

    return errorBreakdown.map((item) => {
      const kpiCode = item.kpiCode || "";
      const kpi = KPI_BY_CODE[kpiCode];
      return {
        errorType: `${kpiCode ? `${kpiCode} • ` : ""}${item.errorType || kpiCode || "Flag"}`,
        relatedVariables: kpi?.variables ?? "—",
        count: item.count ?? 0,
      };
    });
  }, [errorBreakdown, filteredFlagTotals]);

  if (loading && !hasData) return <div>Loading Enterprise QC…</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!hasData) {
    return <div>No Enterprise QC data.</div>;
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
          subtitle={`${formatPercent(1 - (derivedKpis.approvalRate ?? 0))} not approved`}
          variant="enterprise"
        />
        <KPICard
          title="Total Flags"
          value={derivedKpis.totalFlags}
          icon={TriangleAlert}
          subtitle={flagSubtitle}
          variant="enterprise"
        />
        <KPICard
          title="Avg Flags / Interview"
          value={derivedKpis.avgFlagsPerInterview.toFixed(2)}
          icon={FlagTriangleRight}
          variant="enterprise"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-2">
          <SubmissionQualityChart
            data={submissionChartData}
            variant="enterprise"
            flagNames={flagNameByCode}
          />

          <ProductivityRankings data={productivityData} variant="enterprise" />

          <ErrorBreakdown data={errorBreakdownData} variant="enterprise" />
        </div>

        {/* Map with Markers - Updates with country filter */}
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
        />
      </div>
    </div>
  );
}
