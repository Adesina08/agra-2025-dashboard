import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, FlagTriangleRight, TriangleAlert, XCircle } from "lucide-react";
import { type UseSegmentQcDataResult } from "@/hooks/useSegmentQcData";
import { KPICard } from "../KPICard";
import { SubmissionQualityChart } from "../SubmissionQualityChart";
import { ErrorBreakdown } from "../ErrorBreakdown";
import { ProductivityRankings } from "../ProductivityRankings";
import { FarmerData } from "@/data/mockData";
import { SubmissionMap } from "../SubmissionMap";
import { KPI_BY_CODE } from "@/data/kpiDefinitions";
import { CountryFilter } from "../CountryFilter";

function formatPercent(value: number | null | undefined, digits = 1) {
  if (value == null) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

interface FarmerTabProps {
  submissions?: FarmerData[];
  qcData: UseSegmentQcDataResult;
}

export function FarmerTab({ submissions = [], qcData }: FarmerTabProps) {
  const { loading, error, submissionQuality, errorBreakdown, interviewerStats, kpis } = qcData;
  const [countryFilter, setCountryFilter] = useState<string>("all");

  const hasData = !!(submissionQuality && errorBreakdown && interviewerStats && kpis);
  const safeInterviewerStats = useMemo(() => interviewerStats ?? [], [interviewerStats]);
  const safeKpis = useMemo(
    () =>
      kpis ??
      ({
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
      } as const),
    [kpis]
  );

  const availableCountries = useMemo(() => {
    const unique = new Set(
      submissions
        .map((submission) => submission.country?.trim())
        .filter(
          (country): country is string =>
            !!country && !country.toLowerCase().startsWith("unknown")
        )
    );
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    if (countryFilter === "all") return submissions;
    return submissions.filter(
      (submission) => submission.country?.toLowerCase() === countryFilter.toLowerCase()
    );
  }, [countryFilter, submissions]);

  const filteredInterviewerStats = useMemo(() => {
    if (countryFilter === "all") return safeInterviewerStats;
    const enumeratorsInCountry = new Set(
      filteredSubmissions.map((submission) => submission.enumerator).filter(Boolean)
    );
    if (!enumeratorsInCountry.size) return [];
    return safeInterviewerStats.filter((stat) => enumeratorsInCountry.has(stat.enumeratorId));
  }, [countryFilter, filteredSubmissions, safeInterviewerStats]);

  const filteredFlagTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredInterviewerStats.forEach((stat) => {
      Object.entries(stat.flagsByKpi ?? {}).forEach(([kpiCode, count]) => {
        totals[kpiCode] = (totals[kpiCode] || 0) + count;
      });
    });
    return totals;
  }, [filteredInterviewerStats]);

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
    const approvedFromSubmissions = filteredSubmissions.filter(
      (submission) => submission.status?.toLowerCase() === "approved"
    ).length;
    const notApprovedFromSubmissions = filteredSubmissions.length - approvedFromSubmissions;

    const totalFlagsFromFlags = Object.values(filteredFlagTotals).reduce(
      (sum, value) => sum + value,
      0
    );

    const totalsFromStats = filteredInterviewerStats.reduce(
      (acc, stat) => {
        acc.totalSubmissions += stat.totalSubmissions;
        acc.approved += stat.approvedInterviews;
        acc.failed += stat.failedInterviews;
        acc.totalFlags += stat.totalFlags;
        return acc;
      },
      { totalSubmissions: 0, approved: 0, failed: 0, totalFlags: 0 }
    );

    const totalInterviews = totalsFromStats.totalSubmissions || filteredSubmissions.length || safeKpis.totalInterviews;
    const approved = totalsFromStats.approved || approvedFromSubmissions || safeKpis.approved;
    const notApproved =
      totalsFromStats.failed || notApprovedFromSubmissions || safeKpis.notApproved;
    const approvalRate = totalInterviews ? approved / totalInterviews : safeKpis.approvalRate;
    const totalFlags = totalFlagsFromFlags || totalsFromStats.totalFlags || safeKpis.totalFlags;
    const avgFlagsPerInterview =
      totalsFromStats.totalSubmissions > 0
        ? totalFlags / totalsFromStats.totalSubmissions
        : safeKpis.avgFlagsPerInterview;

    return {
      totalInterviews,
      approved,
      notApproved,
      approvalRate,
      totalFlags,
      avgFlagsPerInterview,
    };
  }, [filteredFlagTotals, filteredInterviewerStats, filteredSubmissions, safeKpis]);

  const submissionChartData = filteredInterviewerStats.map((i) => ({
    name: i.enumeratorId,
    approved: i.approvedInterviews,
    notApproved: i.failedInterviews,
    flagsByKpi: i.flagsByKpi,
  }));

  const productivityData = filteredInterviewerStats.map((i) => ({
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

  const errorBreakdownData = useMemo(() => {
    const entries = Object.entries(filteredFlagTotals);
    if (!entries.length) return [];

    return entries.map(([kpiCode, count]) => {
      const kpi = KPI_BY_CODE[kpiCode];
      return {
        errorType: `${kpiCode} • ${kpi?.flagName ?? "Flag"}`,
        relatedVariables: kpi?.variables ?? "—",
        count,
      };
    });
  }, [filteredFlagTotals]);

  if (loading && !hasData) return <div>Loading Farmer QC…</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!hasData) {
    return <div>No Farmer QC data.</div>;
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
          subtitle={`${flagCountsByType.hard.toLocaleString()} hard / ${flagCountsByType.soft.toLocaleString()} soft`}
          variant="farmer"
        />
        <KPICard
          title="Avg Flags / Interview"
          value={derivedKpis.avgFlagsPerInterview.toFixed(2)}
          icon={FlagTriangleRight}
          variant="farmer"
        />
      </div>

      <SubmissionMap
        submissions={filteredSubmissions}
        title="Live Farmer Submission Map"
        variant="farmer"
      />

      <SubmissionQualityChart
        data={submissionChartData}
        variant="farmer"
        flagNames={flagNameByCode}
      />

      <ProductivityRankings data={productivityData} variant="farmer" />

      <ErrorBreakdown data={errorBreakdownData} variant="farmer" />
    </div>
  );
}
