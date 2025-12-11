import { useMemo, useState } from "react";
import {
  ClipboardCheck,
  CheckCircle2,
  FlagTriangleRight,
  TriangleAlert,
  XCircle,
} from "lucide-react";

import { type UseSegmentQcDataResult } from "@/hooks/useSegmentQcData";
import { KPICard } from "../KPICard";
import { SubmissionQualityChart } from "../SubmissionQualityChart";
import { ErrorBreakdown } from "../ErrorBreakdown";
import { ProductivityRankings } from "../ProductivityRankings";
import { YouthData } from "@/data/mockData";
import { SubmissionMap } from "../SubmissionMap";
import { KPI_BY_CODE } from "@/data/kpiDefinitions";
import { CountryFilter } from "../CountryFilter";
import {
  youthInWorkQuotaConfig,
  youthOutreachQuotaConfig,
} from "@/data/quotaData";
import { QuotaSection } from "../QuotaSection";
import { cn } from "@/lib/utils";

function formatPercent(value: number | null | undefined, digits = 1) {
  if (value == null) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

const normalizeString = (value?: string | null) =>
  value?.trim().toLowerCase() || "";

const getYouthEnumeratorId = (submission: YouthData) => {
  const record = submission as Record<string, any>;

  const rawCaseId = record.caseid ?? record.CASEID;
  if (typeof rawCaseId === "string" && rawCaseId.trim()) {
    return rawCaseId.trim();
  }

  const rawEnumerator = record.enumerator ?? record.Enumerator;
  if (typeof rawEnumerator === "string" && rawEnumerator.trim()) {
    return rawEnumerator.trim();
  }

  return submission.enumerator;
};

interface YouthTabProps {
  submissions?: YouthData[];
  qcData: UseSegmentQcDataResult;
}

export function YouthTab({ submissions = [], qcData }: YouthTabProps) {
  const {
    loading,
    error,
    submissionQuality,
    errorBreakdown,
    interviewerStats,
    kpis,
  } = qcData;

  const [countryFilter, setCountryFilter] = useState("all");
  const [quotaView, setQuotaView] = useState<"work" | "outreach">("work");

  const quotaTabs = useMemo(
    () => [
      {
        key: "work" as const,
        label: "Youth in Work",
        config: youthInWorkQuotaConfig,
      },
      {
        key: "outreach" as const,
        label: "Outreach",
        config: youthOutreachQuotaConfig,
      },
    ],
    []
  );

  const hasData = !!(
    submissionQuality &&
    errorBreakdown &&
    interviewerStats &&
    kpis
  );

  const safeInterviewerStats = useMemo(
    () =>
      (interviewerStats ?? []).map((stat) => ({
        ...stat,
        approvedInterviews: stat.approvedInterviews ?? 0,
        failedInterviews: stat.failedInterviews ?? 0,
        totalSubmissions: stat.totalSubmissions ?? 0,
        totalFlags: stat.totalFlags ?? 0,
        flagsByKpi: stat.flagsByKpi ?? {},
      })),
    [interviewerStats]
  );

  const safeKpis = useMemo(
    () =>
      kpis ?? {
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
      },
    [kpis]
  );

  const getSubmissionCountry = (submission: YouthData) => {
    const record = submission as Record<string, any>;
    const rawCountry = record.w1;

    return typeof rawCountry === "string" && rawCountry.trim()
      ? rawCountry
      : submission.country;
  };

  // ✅ Only keep Youth rows where status_com === 1
  const validSubmissions = useMemo(
    () =>
      submissions.filter((submission) => {
        const record = submission as Record<string, any>;
        const value = record["status_com"];

        if (value == null) return false;
        if (typeof value === "number") return value === 1;
        if (typeof value === "string") return value.trim() === "1";
        return false;
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

    quotaTabs.forEach(({ config }) => {
      Object.keys(config.countries).forEach((country) => unique.add(country));
    });

    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [quotaTabs, validSubmissions]);

  const filteredSubmissions = useMemo(() => {
    if (countryFilter === "all") return validSubmissions;

    const targetCountry = normalizeString(countryFilter);

    return validSubmissions.filter((submission) => {
      const country = normalizeString(getSubmissionCountry(submission));
      return country === targetCountry;
    });
  }, [countryFilter, validSubmissions]);

  const filteredInterviewerStats = useMemo(() => {
    if (countryFilter === "all") return safeInterviewerStats;

    const targetCountry = normalizeString(countryFilter);

    const statsWithCountry = safeInterviewerStats.filter(
      (stat) => normalizeString(stat.country) === targetCountry
    );

    if (statsWithCountry.length) return statsWithCountry;

    // Fallback: derive enumerators in-country from submissions
    const enumeratorsInCountry = new Set(
      filteredSubmissions
        .map((submission) => normalizeString(getYouthEnumeratorId(submission)))
        .filter(Boolean)
    );

    if (!enumeratorsInCountry.size) return [];

    return safeInterviewerStats.filter((stat) =>
      enumeratorsInCountry.has(normalizeString(stat.enumeratorId))
    );
  }, [countryFilter, filteredSubmissions, safeInterviewerStats]);

  const filteredFlagTotals = useMemo(() => {
    const totals: Record<string, number> = {};

    filteredInterviewerStats.forEach((stat) => {
      Object.entries(stat.flagsByKpi ?? {}).forEach(([kpiCode, count]) => {
        totals[kpiCode] = (totals[kpiCode] || 0) + (count ?? 0);
      });
    });

    return totals;
  }, [filteredInterviewerStats]);

  const flagNameByCode = useMemo(() => {
    const map: Record<string, string> = {};

    (errorBreakdown ?? []).forEach((item) => {
      if (item.kpiCode) {
        map[item.kpiCode] =
          item.errorType ||
          KPI_BY_CODE[item.kpiCode]?.flagName ||
          item.kpiCode;
      }
    });

    Object.keys(filteredFlagTotals).forEach((code) => {
      map[code] =
        map[code] || KPI_BY_CODE[code]?.flagName || (code as string);
    });

    return map;
  }, [errorBreakdown, filteredFlagTotals]);

  const derivedKpis = useMemo(() => {
    // Derive KPIs directly from filtered submissions and interviewer stats.
    // This always respects the country filter and the youth validation rule
    // (status_com === 1) so only valid youth interviews are counted.

    const getApprovalStatus = (submission: YouthData) => {
      const record = submission as Record<string, any>;
      const rawStatus = record["QC Approval Status"];

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
      (submission) =>
        normalizeStatus(getApprovalStatus(submission)) === "approved"
    ).length;

    const notApprovedFromSubmissions = filteredSubmissions.filter(
      (submission) =>
        normalizeStatus(getApprovalStatus(submission)) === "not approved"
    ).length;

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
      {
        totalSubmissions: 0,
        approved: 0,
        failed: 0,
        totalFlags: 0,
      }
    );

    const hasInterviewerStats = filteredInterviewerStats.length > 0;
    const hasSubmissionData = filteredSubmissions.length > 0;
    const hasFlagData = Object.keys(filteredFlagTotals).length > 0;

    const noFilteredData =
      countryFilter !== "all" &&
      !hasInterviewerStats &&
      !hasSubmissionData &&
      !hasFlagData;

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

    const totalFlags = hasFlagData
      ? totalFlagsFromFlags
      : hasInterviewerStats
      ? totalsFromStats.totalFlags
      : noFilteredData
      ? 0
      : safeKpis.totalFlags;

    const avgFlagsPerInterview = totalInterviews
      ? totalFlags / totalInterviews
      : 0;

    return {
      totalInterviews,
      approved,
      notApproved,
      approvalRate,
      totalFlags,
      avgFlagsPerInterview,
      percentDuplicatePhone: safeKpis.percentDuplicatePhone,
      percentLOIIssues: safeKpis.percentLOIIssues,
      percentHardViolations: safeKpis.percentHardViolations,
      ageOutsideYouthCount: safeKpis.ageOutsideYouthCount,
      ageOutsideYouthPercent: safeKpis.ageOutsideYouthPercent,
    } as const;
  }, [
    countryFilter,
    filteredFlagTotals,
    filteredInterviewerStats,
    filteredSubmissions,
    safeKpis,
  ]);

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
        errorType: `${
          kpiCode ? `${kpiCode} • ` : ""
        }${item.errorType || kpiCode || "Flag"}`,
        relatedVariables: kpi?.variables ?? "—",
        count: item.count ?? 0,
      };
    });
  }, [errorBreakdown, filteredFlagTotals]);

  // ---------- Render states ----------

  if (loading && !hasData) {
    return <div>Loading Youth QC…</div>;
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        Error: {String(error)}
      </div>
    );
  }

  if (!hasData) {
    return <div>No Youth QC data.</div>;
  }

  // ---------- Main render ----------

  const activeQuotaConfig =
    quotaTabs.find((tab) => tab.key === quotaView)?.config ??
    youthInWorkQuotaConfig;

  const submissionMapPoints = filteredSubmissions.map((s) => ({
    latitude: s.latitude ?? 0,
    longitude: s.longitude ?? 0,
    region: s.region,
    district: s.district,
    status: s.status,
    id: s.id,
    enumerator: s.enumerator,
  }));

  return (
    <div className="space-y-6">
      {/* Header + country filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Youth QC Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">
            Track interview quality for youth respondents across countries.
          </p>
        </div>

        <CountryFilter
          value={countryFilter}
          onChange={setCountryFilter}
          submissions={validSubmissions}
          getSubmissionCountry={getSubmissionCountry}
          availableCountries={availableCountries}
        />
      </div>

      {/* Quota tabs */}
      <div className="flex flex-wrap gap-2 rounded-lg border bg-muted/40 p-1 text-xs sm:text-sm">
        {quotaTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setQuotaView(tab.key)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 font-medium transition-colors",
              quotaView === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KPICard
          label="Total interviews"
          value={derivedKpis.totalInterviews.toLocaleString()}
          icon={ClipboardCheck}
          variant="youth"
        />
        <KPICard
          label="Approved"
          value={derivedKpis.approved.toLocaleString()}
          icon={CheckCircle2}
          variant="youth"
        />
        <KPICard
          label="Not approved"
          value={derivedKpis.notApproved.toLocaleString()}
          icon={XCircle}
          variant="youth"
        />
        <KPICard
          label="Approval rate"
          value={
            derivedKpis.totalInterviews
              ? formatPercent(derivedKpis.approvalRate)
              : "0%"
          }
          icon={ClipboardCheck}
          variant="youth"
        />
        <KPICard
          label="Avg flags / interview"
          value={derivedKpis.avgFlagsPerInterview.toFixed(2)}
          icon={FlagTriangleRight}
          variant="youth"
        />
      </div>

      {/* Quota status */}
      <QuotaSection
        config={activeQuotaConfig}
        title={
          quotaView === "work"
            ? "Youth in work quota status"
            : "Outreach quota status"
        }
      />

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SubmissionQualityChart
            data={submissionChartData}
            variant="youth"
          />

          <ErrorBreakdown
            data={errorBreakdownData}
            title="Flag breakdown by KPI"
            subtitle={flagSubtitle}
          />
        </div>

        <div className="space-y-6">
          <ProductivityRankings
            data={productivityData}
            title="Interviewer productivity"
          />
        </div>
      </div>

      {/* Map */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">
          Submission locations
        </h3>
        <p className="text-xs text-muted-foreground">
          Shows only validated youth interviews (status_com = 1).
        </p>
        <SubmissionMap submissions={submissionMapPoints} />
      </div>
    </div>
  );
}
