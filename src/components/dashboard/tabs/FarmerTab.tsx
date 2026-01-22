import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, FlagTriangleRight, TriangleAlert, XCircle, FileCheck } from "lucide-react";
import { type UseSegmentQcDataResult } from "@/hooks/useSegmentQcData";
import { KPICard } from "../KPICard";
import { SubmissionQualityChart } from "../SubmissionQualityChart";
import { ErrorBreakdown } from "../ErrorBreakdown";
import { ProductivityRankings } from "../ProductivityRankings";
import { FarmerData } from "@/data/mockData";
import { SubmissionMap } from "../SubmissionMap"; // NEW IMPORT
import { KPI_BY_CODE } from "@/data/kpiDefinitions";
import { CountryFilter } from "../CountryFilter";
import { farmerQuotaConfig } from "@/data/quotaData";
import { QuotaSection } from "../QuotaSection";
import { SheetRow } from "@/lib/googleSheets";

function formatPercent(value: number | null | undefined, digits = 1) {
  if (value == null) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

// Helper function to get column value (case-insensitive, handles whitespace)
const getColumnValue = (row: SheetRow, columnName: string): unknown => {
  if (row[columnName] !== undefined && row[columnName] !== null && row[columnName] !== '') {
    return row[columnName];
  }
  const lowerKey = columnName.toLowerCase().trim();
  for (const [key, value] of Object.entries(row)) {
    const trimmedKey = key.trim().toLowerCase();
    if (trimmedKey === lowerKey) {
      return value;
    }
  }
  return undefined;
};

const isBlank = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  const str = String(value).trim();
  return str === '' || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined';
};

// Helper function to get country from raw row (matches Farmer normalizer logic)
const getCountryFromRawRow = (row: SheetRow): string => {
  const country = getColumnValue(row, 'dccot') || 
                  getColumnValue(row, 'country') || 
                  getColumnValue(row, 'dcountry');
  return country ? String(country).trim() : 'Unknown country';
};

interface FarmerTabProps {
  submissions?: FarmerData[];
  rawData?: SheetRow[];
  rawUnfilteredData?: SheetRow[];
  qcData: UseSegmentQcDataResult;
}

function FarmerTab({ submissions = [], rawData = [], rawUnfilteredData = [], qcData }: FarmerTabProps) {
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

  const getSubmissionCountry = (submission: FarmerData) => {
    return submission.country;
  };

  const availableCountries = useMemo(() => {
    const safeSubmissions = submissions ?? [];
    const unique = new Set(
      safeSubmissions
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
    const safeSubmissions = submissions ?? [];
    if (countryFilter === "all") return safeSubmissions;
    return safeSubmissions.filter((submission) => {
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

  // Count all non-blank QC Approval Status rows from unfiltered raw data (Total Submissions)
  // Respects country filter when a country is selected
  const totalSubmissionsCount = useMemo(() => {
    const safeRawUnfilteredData = rawUnfilteredData ?? [];
    return safeRawUnfilteredData.filter((row) => {
      // Filter by country if a country is selected
      if (countryFilter !== 'all') {
        const rowCountry = getCountryFromRawRow(row);
        if (rowCountry?.toLowerCase() !== countryFilter.toLowerCase()) {
          return false;
        }
      }
      
      const qcStatus = getColumnValue(row, 'QC Approval Status') || 
                       getColumnValue(row, 'qc_approval_status') || 
                       getColumnValue(row, 'QC Approval status');
      return !isBlank(qcStatus);
    }).length;
  }, [rawUnfilteredData, countryFilter]);

  // Count all non-blank QC Approval Status rows from filtered raw data (Valid Submissions)
  // Respects country filter when a country is selected
  const validSubmissionsCount = useMemo(() => {
    const safeRawData = rawData ?? [];
    return safeRawData.filter((row) => {
      // Filter by country if a country is selected
      if (countryFilter !== 'all') {
        const rowCountry = getCountryFromRawRow(row);
        if (rowCountry?.toLowerCase() !== countryFilter.toLowerCase()) {
          return false;
        }
      }
      
      const qcStatus = getColumnValue(row, 'QC Approval Status') || 
                       getColumnValue(row, 'qc_approval_status') || 
                       getColumnValue(row, 'QC Approval status');
      return !isBlank(qcStatus);
    }).length;
  }, [rawData, countryFilter]);

  const derivedKpis = useMemo(() => {

    // Filter out 'Pending' (blank) statuses for Valid Submissions
    const validSubmissions = filteredSubmissions.filter((s) => s.status !== "Pending");

    const approvedFromSubmissions = validSubmissions.filter(
      (submission) => submission.status === "Approved"
    ).length;
    // Count both "Rejected" status and any status that is not "Approved" or "Pending"
    const notApprovedFromSubmissions = validSubmissions.filter(
      (submission) => submission.status === "Rejected" || (submission.status !== "Approved" && submission.status !== "Pending")
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
      { totalSubmissions: 0, approved: 0, failed: 0, totalFlags: 0 }
    );

    const hasInterviewerStats = filteredInterviewerStats.length > 0;
    const hasSubmissionData = filteredSubmissions.length > 0;
    const hasFlagData = Object.keys(filteredFlagTotals).length > 0;
    const noFilteredData =
      countryFilter !== "all" && !hasInterviewerStats && !hasSubmissionData && !hasFlagData;

    // Total Submissions = count of all non-blank QC Approval Status rows from unfiltered data
    const totalSubmissions = hasSubmissionData
      ? totalSubmissionsCount
      : hasInterviewerStats
        ? totalsFromStats.totalSubmissions
        : noFilteredData
          ? 0
          : safeKpis.totalInterviews;
    
    // Valid Submissions = count of all non-blank QC Approval Status rows from filtered data (what was previously Total Interviews)
    const validSubmissionsFromFiltered = hasSubmissionData
      ? validSubmissionsCount
      : hasInterviewerStats
        ? totalsFromStats.totalSubmissions
        : noFilteredData
          ? 0
          : safeKpis.totalInterviews;
    
    // Processed Submissions = count excluding Pending status
    const processedSubmissionsCount = hasSubmissionData
      ? validSubmissions.length
      : hasInterviewerStats
        ? totalsFromStats.totalSubmissions
        : noFilteredData
          ? 0
          : safeKpis.totalInterviews;

    const approved = hasSubmissionData
      ? approvedFromSubmissions
      : hasInterviewerStats
        ? totalsFromStats.approved
        : noFilteredData
          ? 0
          : safeKpis.approved;
    const notApproved = hasSubmissionData
      ? notApprovedFromSubmissions
      : hasInterviewerStats
        ? totalsFromStats.failed
        : noFilteredData
          ? 0
          : safeKpis.notApproved;
    const approvalRate = processedSubmissionsCount ? approved / processedSubmissionsCount : 0;
    const totalFlags = hasFlagData
      ? totalFlagsFromFlags
      : hasInterviewerStats
        ? totalsFromStats.totalFlags
        : noFilteredData
          ? 0
          : safeKpis.totalFlags;
    const avgFlagsPerInterview = processedSubmissionsCount ? totalFlags / processedSubmissionsCount : 0;

    return {
      totalSubmissions,
      validSubmissions: validSubmissionsFromFiltered,
      processedSubmissions: processedSubmissionsCount,
      approved,
      notApproved,
      approvalRate,
      totalFlags,
      avgFlagsPerInterview,
    };
  }, [countryFilter, filteredFlagTotals, filteredInterviewerStats, filteredSubmissions, rawData, rawUnfilteredData, totalSubmissionsCount, validSubmissionsCount, safeKpis]);

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

  if (loading && !hasData) return <div>Loading FM MODULE...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!hasData) {
    return <div>No FM MODULE data.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <CountryFilter
        countries={availableCountries}
        selected={countryFilter}
        onChange={setCountryFilter}
        variant="farmer"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Total Submissions"
          value={derivedKpis.totalSubmissions}
          icon={ClipboardCheck}
          subtitle="All QC Status entries"
          variant="farmer"
        />
        <KPICard
          title="Valid Submissions"
          value={derivedKpis.validSubmissions}
          icon={FileCheck}
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
          subtitle={flagSubtitle}
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
          submissionDate: s.submissionDate,
          gender: s.gender,
          ageGroup: s.ageGroup,
        }))}
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

export { FarmerTab };
export default FarmerTab;
