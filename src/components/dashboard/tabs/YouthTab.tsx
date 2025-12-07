// src/components/dashboard/tabs/YouthTab.tsx
import { useMemo, useState } from 'react';
import {
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  GraduationCap,
  ClipboardCheck,
  Lightbulb,
} from 'lucide-react';
import {
  fieldLabels,
  generateInterviewerStats,
  generateSubmissionQuality,
  errorBreakdownData,
  type YouthData,
} from '@/data/mockData';
import { useSheetData } from '@/hooks/useSheetData';
import { useQCData } from '@/hooks/useQCData';
import { mapYouthRow } from '@/lib/mappings';
import { mergeWithQC } from '@/lib/mergeQCData';
import { KPICard } from '../KPICard';
import { DonutChart } from '../DonutChart';
import { DataTable } from '../DataTable';
import { StatusBadge } from '../StatusBadge';
import { ProgressPanels } from '../ProgressPanels';
import { ProductivityRankings } from '../ProductivityRankings';
import { SubmissionQualityChart } from '../SubmissionQualityChart';
import { ErrorBreakdown } from '../ErrorBreakdown';
import { YouthInsights } from '../insights/YouthInsights';

type SubTab = 'qc' | 'insights';

const youthSheetId = import.meta.env.VITE_SHEET_ID_YOUTH as string | undefined;
const youthDataConfig = youthSheetId
  ? {
      sheetId: youthSheetId,
      gid: import.meta.env.VITE_SHEET_GID_YOUTH_DATA as string,
    }
  : undefined;

const youthQCConfig = youthSheetId
  ? {
      sheetId: youthSheetId,
      gidDetail: import.meta.env.VITE_SHEET_GID_YOUTH_QC_DETAIL as string,
      gidSummary: import.meta.env.VITE_SHEET_GID_YOUTH_QC_SUMMARY as string,
      gidEnum: import.meta.env.VITE_SHEET_GID_YOUTH_ENUM as string,
    }
  : undefined;

export function YouthTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('qc');

  const {
    data: youthRaw,
    loading: youthLoading,
    error: youthError,
  } = useSheetData<YouthData>(youthDataConfig, mapYouthRow);

  const {
    qcDetail,
    qcSummary,
    enumPerformance,
    loading: qcLoading,
    error: qcError,
  } = useQCData(youthQCConfig);

  const youthData = useMemo(() => mergeWithQC(youthRaw, qcDetail), [youthRaw, qcDetail]);

  const loading = youthLoading || qcLoading;
  const error = youthError || qcError;

  const stats = useMemo(() => {
    const total = youthData.length;
    if (!total) {
      return {
        total: 0,
        approved: 0,
        pending: 0,
        notApproved: 0,
        male: 0,
        female: 0,
        trainingCompleted: 0,
      };
    }

    const approved = youthData.filter((y) => y.status === 'Approved').length;
    const pending = youthData.filter((y) => y.status === 'Pending').length;
    const notApproved = youthData.filter(
      (y) => y.status !== 'Approved' && y.status !== 'Pending'
    ).length;
    const male = youthData.filter((y) => y.gender === 'Male').length;
    const female = youthData.filter((y) => y.gender === 'Female').length;
    const trainingCompleted = youthData.filter((y) => y.trainingCompleted).length;

    return {
      total,
      approved,
      pending,
      notApproved,
      male,
      female,
      trainingCompleted,
    };
  }, [youthData]);

  const targetInterviews = 3500;

  const genderData = [
    { name: 'Male', value: stats.male, color: '#14b8a6' },
    { name: 'Female', value: stats.female, color: '#8b5cf6' },
  ];

  const interviewerStats = useMemo(() => {
    if (enumPerformance.length) {
      return enumPerformance.map((perf) => ({
        name: perf.enumeratorID || 'Unknown',
        totalInterviews: perf.totalSubmissions,
        approved: Math.max(0, perf.totalSubmissions - perf.totalFlags),
      }));
    }
    return generateInterviewerStats(youthData);
  }, [enumPerformance, youthData]);
  const submissionQuality = useMemo(
    () => generateSubmissionQuality(youthData),
    [youthData]
  );

  const qcErrorBreakdown = useMemo(
    () =>
      qcSummary.length
        ? qcSummary.map((item) => ({
            errorType: item.flagName || item.kpi,
            relatedVariables: `${item.category} | ${item.type}`,
            count: item.count,
          }))
        : errorBreakdownData.youth,
    [qcSummary]
  );

  const columns = [
    { key: 'id' as const, label: 'ID', sortable: true },
    {
      key: 'youthName' as const,
      label: fieldLabels.youth.youthName,
      sortable: true,
    },
    {
      key: 'region' as const,
      label: fieldLabels.youth.region,
      sortable: true,
    },
    {
      key: 'district' as const,
      label: fieldLabels.youth.district,
      sortable: true,
    },
    {
      key: 'gender' as const,
      label: fieldLabels.youth.gender,
      sortable: true,
    },
    {
      key: 'educationLevel' as const,
      label: fieldLabels.youth.educationLevel,
      sortable: true,
    },
    {
      key: 'status' as const,
      label: fieldLabels.youth.status,
      sortable: true,
      render: (value: string) => <StatusBadge status={value as any} />,
    },
    {
      key: 'submissionDate' as const,
      label: fieldLabels.youth.submissionDate,
      sortable: true,
    },
  ];

  const subTabs = [
    { id: 'qc' as const, label: 'QC', icon: ClipboardCheck },
    { id: 'insights' as const, label: 'Insights', icon: Lightbulb },
  ];

  if (loading) {
    return <div className="animate-pulse text-sm text-muted-foreground">Loading youth data…</div>;
  }

  if (error) {
    return (
      <div className="text-sm text-red-500">
        Failed to load Youth sheet: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-border/50 pb-2">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
              activeSubTab === tab.id
                ? 'bg-teal-500/10 text-teal-500 border-b-2 border-teal-500'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'qc' ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KPICard
              title="Total Youth"
              value={stats.total}
              icon={Users}
              variant="youth"
              trend={{ value: 18.4, isPositive: true }}
            />
            <KPICard
              title="Approved"
              value={stats.approved}
              subtitle={
                stats.total
                  ? `${((stats.approved / stats.total) * 100).toFixed(1)}%`
                  : '0%'
              }
              icon={CheckCircle}
              variant="youth"
            />
            <KPICard
              title="Pending"
              value={stats.pending}
              subtitle={
                stats.total
                  ? `${((stats.pending / stats.total) * 100).toFixed(1)}%`
                  : '0%'
              }
              icon={Clock}
              variant="youth"
            />
            <KPICard
              title="Not Approved"
              value={stats.notApproved}
              subtitle={
                stats.total
                  ? `${((stats.notApproved / stats.total) * 100).toFixed(1)}%`
                  : '0%'
              }
              icon={XCircle}
              variant="youth"
            />
            <KPICard
              title="Training Completed"
              value={stats.trainingCompleted}
              subtitle={
                stats.total
                  ? `${((stats.trainingCompleted / stats.total) * 100).toFixed(1)}%`
                  : '0%'
              }
              icon={GraduationCap}
              variant="youth"
            />
            <KPICard
              title="Growth"
              value="9.8%"
              subtitle="MoM increase"
              icon={TrendingUp}
              variant="youth"
            />
          </div>

          {/* Progress & Quality Panels */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <ProgressPanels
                achieved={stats.total}
                target={targetInterviews}
                approvals={[
                  { label: 'Approved', value: stats.approved, color: '#14b8a6' },
                  { label: 'Not Approved', value: stats.notApproved, color: '#ef4444' },
                  { label: 'Pending', value: stats.pending, color: '#eab308' },
                ]}
                accentColor="#14b8a6"
                remainderColor="#14b8a620"
              />
            </div>

            <div className="minimal-card">
              <h3 className="text-sm font-medium text-foreground mb-1">Gender Distribution</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Balance across male and female respondents
              </p>
              <div className="h-48">
                <DonutChart data={genderData} variant="youth" />
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="minimal-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-foreground">Youth Submissions</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Live data synced from the Youth survey sheet
                </p>
              </div>
              <div className="text-xs text-muted-foreground">Updated automatically</div>
            </div>
            <DataTable data={youthData} columns={columns} />
          </div>

          {/* Charts & Stats */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <SubmissionQualityChart
                data={submissionQuality}
                variant="youth"
                title="Enumerator Submission Quality"
              />
            </div>
            <ProductivityRankings
              data={interviewerStats}
              variant="youth"
              title="Top Enumerator Performance"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <ErrorBreakdown
              data={qcErrorBreakdown}
              variant="youth"
              title="Top Validation Flags"
            />
            <div className="minimal-card">
              <h3 className="text-sm font-medium text-foreground mb-3">Insights & Recommendations</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Automated insights based on the latest QC results
              </p>
              <YouthInsights data={youthData} />
            </div>
          </div>
        </>
      ) : (
        <YouthInsights data={youthData} detailed />
      )}
    </div>
  );
}
