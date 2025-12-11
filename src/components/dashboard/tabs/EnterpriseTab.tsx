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
  const safeInterviewerStats = useMemo(() => interviewerStats ?? [], [interviewerStats]);
  const safeKpis = useMemo(() => {
    if (!kpis) {
      return {
        totalInterviews: 0,
        approved: 0,
        notApproved: 0,
        approvalRate: 0,
        totalFlags: 0,
        avgFlagsPerInterview: 0,
        percentDuplicatePhone: 0,
        percentLOIIssues: 0,
        percentHardViolations: 0,
        ageOutsideYouthCount: 0,
        ageOutsideYouthPercent: 0,
      } as const;
    }

    return {
      totalInterviews: kpis.totalInterviews ?? 0,
      approved: kpis.approved ?? 0,
      notApproved: kpis.notApproved ?? 0,
      approvalRate: kpis.approvalRate ?? 0,
      totalFlags: kpis.totalFlags ?? 0,
      avgFlagsPerInterview: kpis.avgFlagsPerInterview ?? 0,
      percentDuplicatePhone: kpis.percentDuplicatePhone ?? 0,
      percentLOIIssues: kpis.percentLOIIssues ?? 0,
      percentHardViolations: kpis.percentHardViolations ?? 0,
      ageOutsideYouthCount: kpis.ageOutsideYouthCount ?? 0,
      ageOutsideYouthPercent: kpis.ageOutsideYouthPercent ?? 0,
    } as const;
  }, [kpis]);

  const getSubmissionCountry = (submission: EnterpriseData) => {
    const rawCountry = (submission as Record<string, unknown>).A1_cal;
    return typeof rawCountry === "string" && rawCountry.trim()
      ? rawCountry
      : submission.country;
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

  const filteredInterviewerStats = useMemo(() => {
    if (countryFilter === "all") return safeInterviewerStats;
    const enumeratorsInCountry = new Set(
      filteredSubmissions.map((submission) => submission.enumerator).filter(Boolean)
    );
    if (!enumeratorsInCountry.size) return [];
    return safeInterviewerStats.filter((stat) => enumeratorsInCountry.has(stat.enumeratorId));
  }, [countryFilter, filteredSubmissions, safeInterviewerStats]);

  const submissionsByEnumerator = useMemo(() => {
    return filteredSubmissions.reduce<Record<string, number>>((acc, submission) => {
      if (!submission.enumerator) return acc;
      acc[submission.enumerator] = (acc[submission.enumerator] || 0) + 1;
      return acc;
    }, {});
  }, [filteredSubmissions]);

  const filteredFlagTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredInterviewerStats.forEach((stat) => {
      const countryCount = submissionsByEnumerator[stat.enumeratorId];
      const ratio =
        countryFilter === "all" || !stat.totalSubmissions
          ? 1
          : Math.min((countryCount || 0) / stat.totalSubmissions, 1);

      Object.entries(stat.flagsByKpi ?? {}).forEach(([kpiCode, count]) => {
        const scaledCount = Math.round(count * ratio);
        totals[kpiCode] = (totals[kpiCode] || 0) + scaledCount;
      });
    });
    return totals;
  }, [countryFilter, filteredInterviewerStats, submissionsByEnumerator]);

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
    const noFilteredData = countryFilter !== "all" && !hasSubmissionData;
    const hasInterviewerStats = filteredInterviewerStats.length > 0;
    const shouldUseStatsForTotals = countryFilter === "all" && hasInterviewerStats;

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

    // UPDATED: Prefer submissions for total/approved/notApproved/approvalRate if available
    const totalInterviews = shouldUseStatsForTotals
      ? totalsFromStats.totalSubmissions
      : hasSubmissionData
        ? filteredSubmissions.length
        : safeKpis.totalInterviews;

    const approved = shouldUseStatsForTotals
      ? totalsFromStats.approved
      : hasSubmissionData
        ? approvedFromSubmissions
        : safeKpis.approved;

    const notApproved = shouldUseStatsForTotals
      ? totalsFromStats.failed
      : hasSubmissionData
        ? notApprovedFromSubmissions
        : safeKpis.notApproved;

    const approvalRate = totalInterviews ? approved / totalInterviews : 0;

    // For flags, keep preferring QC data (since not in submissions), but fall back appropriately
    const totalFlags = hasFlagData
      ? totalFlagsFromFlags
      : shouldUseStatsForTotals
        ? totalsFromStats.totalFlags
        : hasSubmissionData
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
  }, [countryFilter, filteredFlagTotals, filteredInterviewerStats, filteredSubmissions, safeKpis]);

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
        flagNames={flagNameByCode}
      />

      <ProductivityRankings data={productivityData} variant="enterprise" />

      <ErrorBreakdown data={errorBreakdownData} variant="enterprise" />
    </div>
  );
}
