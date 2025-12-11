import React, { useMemo, useState } from "react";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  TriangleAlert,
  FlagTriangleRight,
} from "lucide-react";

import { KPICard } from "../KPICard";
import { CountryFilter } from "../CountryFilter";
import { SegmentLayout } from "../SegmentLayout";
import { ErrorBreakdownCard } from "../ErrorBreakdownCard";
import { SubmissionQualityCard } from "../SubmissionQualityCard";
import { InterviewerProductivityCard } from "../InterviewerProductivityCard";
import { FlagsByTypeCard } from "../FlagsByTypeCard";
import { LoadingState } from "../LoadingState";
import { ErrorState } from "../ErrorState";

import type { YouthData } from "../../../types/youth";
import type { UseSegmentQcDataResult } from "../../../hooks/useSegmentQcData";
import type { InterviewerStats } from "../../../lib/buildQcDataFromSheets";

function normalizeString(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

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

  const [countryFilter, setCountryFilter] = useState<string>("all");

  const safeInterviewerStats: InterviewerStats[] = useMemo(
    () => interviewerStats ?? [],
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

  // --- Country helpers ------------------------------------------------------

  const getSubmissionCountry = (submission: YouthData) => {
    // In your youth sheet, w1 is the canonical country column
    const rawCountry = (submission as Record<string, unknown>)["w1"];
    if (typeof rawCountry === "string" && rawCountry.trim()) {
      return rawCountry;
    }
    return submission.country;
  };

  const filteredSubmissions = useMemo(() => {
    if (countryFilter === "all") return submissions;
    const target = normalizeString(countryFilter);
    return submissions.filter((submission) => {
      const country = getSubmissionCountry(submission);
      return normalizeString(country) === target;
    });
  }, [countryFilter, submissions]);

  const filteredInterviewerStats = useMemo(() => {
    if (countryFilter === "all") return safeInterviewerStats;

    const targetCountry = normalizeString(countryFilter);

    const statsWithCountry = safeInterviewerStats.filter(
      (stat) => normalizeString(stat.country) === targetCountry
    );
    if (statsWithCountry.length) return statsWithCountry;

    const enumeratorsInCountry = new Set(
      filteredSubmissions
        .map((submission) => normalizeString(submission.enumerator))
        .filter(Boolean)
    );

    if (!enumeratorsInCountry.size) return [];

    return safeInterviewerStats.filter((stat) =>
      enumeratorsInCountry.has(normalizeString(stat.enumeratorId))
    );
  }, [countryFilter, filteredSubmissions, safeInterviewerStats]);

  const filteredFlagTotals = useMemo(() => {
    if (countryFilter === "all") return submissionQuality?.flagTotals ?? null;

    if (!submissionQuality?.flagTotals) return null;
    if (!filteredInterviewerStats.length) return null;

    const flagsByInterviewerId = new Map<string, number>();

    for (const stat of filteredInterviewerStats) {
      flagsByInterviewerId.set(stat.interviewerId, stat.totalFlags);
    }

    const totalFlags = Array.from(flagsByInterviewerId.values()).reduce(
      (sum, count) => sum + (count ?? 0),
      0
    );

    return {
      ...submissionQuality.flagTotals,
      totalFlags,
    };
  }, [countryFilter, submissionQuality, filteredInterviewerStats]);

  // --- KPI derivation from QC Approval Status -------------------------------

  const derivedKpis = useMemo(() => {
    const getApprovalStatus = (submission: YouthData) => {
      const rawStatus = (submission as Record<string, unknown>)[
        "QC Approval Status"
      ];
      if (typeof rawStatus === "string" && rawStatus.trim()) {
        return rawStatus;
      }
      return submission.status;
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
      (submission) =>
        normalizeStatus(getApprovalStatus(submission)) === "not approved"
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

    const totalFlags = hasInterviewerStats
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
      // Keep youth-specific KPI fields from safeKpis for any charts/insights using them
      percentDuplicatePhone: safeKpis.percentDuplicatePhone,
      percentLOIIssues: safeKpis.percentLOIIssues,
      percentHardViolations: safeKpis.percentHardViolations,
      ageOutsideYouthCount: safeKpis.ageOutsideYouthCount,
      ageOutsideYouthPercent: safeKpis.ageOutsideYouthPercent,
    } as const;
  }, [
    countryFilter,
    filteredSubmissions,
    filteredInterviewerStats,
    safeKpis,
  ]);

  const formatPercent = (value: number | null | undefined, decimals = 0) => {
    if (value == null || Number.isNaN(value)) return "0%";
    return `${(value * 100).toFixed(decimals)}%`;
  };

  const flagSubtitle =
    derivedKpis.totalFlags && derivedKpis.totalInterviews
      ? `${derivedKpis.totalFlags} flags across ${derivedKpis.totalInterviews} interviews`
      : "Flags across all interviews";

  if (loading) {
    return <LoadingState segment="youth" />;
  }

  if (error) {
    return (
      <ErrorState
        segment="youth"
        message="Unable to load youth dashboard data."
      />
    );
  }

  return (
    <SegmentLayout
      segment="youth"
      countryFilter={
        <CountryFilter
          value={countryFilter}
          onChange={setCountryFilter}
          submissions={submissions}
          getSubmissionCountry={getSubmissionCountry}
        />
      }
    >
      {/* KPI summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
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
          subtitle={
            derivedKpis.approvalRate > 0
              ? formatPercent(derivedKpis.approvalRate)
              : "0%"
          }
          variant="youth"
        />
        <KPICard
          title="Not Approved"
          value={derivedKpis.notApproved}
          icon={XCircle}
          subtitle={`${formatPercent(
            1 - (derivedKpis.approvalRate ?? 0)
          )} not approved`}
          variant="youth"
        />
        <KPICard
          title="Total Flags"
          value={derivedKpis.totalFlags}
          icon={TriangleAlert}
          subtitle={flagSubtitle}
          variant="youth"
        />
        <KPICard
          title="Avg Flags / Interview"
          value={derivedKpis.avgFlagsPerInterview.toFixed(2)}
          icon={FlagTriangleRight}
          variant="youth"
        />
      </div>

      {/* Rest of the dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-2">
          <SubmissionQualityCard
            segment="youth"
            submissionQuality={submissionQuality}
            filteredFlagTotals={filteredFlagTotals}
          />
          <ErrorBreakdownCard
            segment="youth"
            errorBreakdown={errorBreakdown}
          />
        </div>
        <div className="space-y-6">
          <InterviewerProductivityCard
            segment="youth"
            interviewerStats={filteredInterviewerStats}
          />
          <FlagsByTypeCard
            segment="youth"
            submissionQuality={submissionQuality}
            filteredFlagTotals={filteredFlagTotals}
          />
        </div>
      </div>
    </SegmentLayout>
  );
}
