// src/components/dashboard/tabs/YouthTab.tsx
import { useMemo, useState } from 'react';
import {
  GraduationCap,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Briefcase,
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
import { mapYouthRow } from '@/lib/mappings';
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

const youthSheetId = import.meta.env.VITE_SHEET_ID_YOUTH as string;

export function YouthTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('qc');

  const {
    data: youthData,
    loading,
    error,
  } = useSheetData<YouthData>(youthSheetId, mapYouthRow);

  const stats = useMemo(() => {
    const total = youthData.length;
    if (!total) {
      return {
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        male: 0,
        female: 0,
        trained: 0,
        employed: 0,
      };
    }

    const approved = youthData.filter((y) => y.status === 'Approved')
      .length;
    const pending = youthData.filter((y) => y.status === 'Pending').length;
    const rejected = youthData.filter((y) => y.status === 'Rejected')
      .length;
    const male = youthData.filter((y) => y.gender === 'Male').length;
    const female = youthData.filter((y) => y.gender === 'Female').length;
    const trained = youthData.filter((y) => y.trainingCompleted).length;
    const employed = youthData.filter(
      (y) =>
        y.employmentStatus === 'Employed' ||
        y.employmentStatus === 'Self-employed'
    ).length;

    return {
      total,
      approved,
      pending,
      rejected,
      male,
      female,
      trained,
      employed,
    };
  }, [youthData]);

  const targetInterviews = 3000;

  const genderData = [
    { name: 'Male', value: stats.male, color: '#06b6d4' },
    { name: 'Female', value: stats.female, color: '#f472b6' },
  ];

  const interviewerStats = useMemo(
    () => generateInterviewerStats(youthData),
    [youthData]
  );
  const submissionQuality = useMemo(
    () => generateSubmissionQuality(youthData),
    [youthData]
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
      key: 'gender' as const,
      label: fieldLabels.youth.gender,
      sortable: true,
    },
    {
      key: 'ageGroup' as const,
      label: fieldLabels.youth.ageGroup,
      sortable: true,
    },
    {
      key: 'educationLevel' as const,
      label: fieldLabels.youth.educationLevel,
      sortable: true,
    },
    {
      key: 'employmentStatus' as const,
      label: fieldLabels.youth.employmentStatus,
      sortable: true,
    },
    {
      key: 'trainingCompleted' as const,
      label: fieldLabels.youth.trainingCompleted,
      sortable: true,
      render: (value: boolean) => (
        <span className={value ? 'text-green-400' : 'text-muted-foreground'}>
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'status' as const,
      label: fieldLabels.youth.status,
      sortable: true,
      render: (value: string) => <StatusBadge status={value as any} />,
    },
  ];

  const subTabs = [
    { id: 'qc' as const, label: 'QC', icon: ClipboardCheck },
    { id: 'insights' as const, label: 'Insights', icon: Lightbulb },
  ];

  if (loading) {
    return (
      <div className="animate-pulse text-sm text-muted-foreground">
        Loading youth data…
      </div>
    );
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
                ? 'bg-violet-500/10 text-violet-500 border-b-2 border-violet-500'
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
              icon={GraduationCap}
              variant="youth"
              trend={{ value: 15.7, isPositive: true }}
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
              title="Rejected"
              value={stats.rejected}
              subtitle={
                stats.total
                  ? `${((stats.rejected / stats.total) * 100).toFixed(1)}%`
                  : '0%'
              }
              icon={XCircle}
              variant="youth"
            />
            <KPICard
              title="Training Completed"
              value={
                stats.total
                  ? `${((stats.trained / stats.total) * 100).toFixed(0)}%`
                  : '0%'
              }
              icon={GraduationCap}
              variant="youth"
            />
            <KPICard
              title="Employment Rate"
              value={
                stats.total
                  ? `${((stats.employed / stats.total) * 100).toFixed(0)}%`
                  : '0%'
              }
              icon={Briefcase}
              variant="youth"
              trend={{ value: 5.2, isPositive: true }}
            />
          </div>

          <ProgressPanels
            achieved={stats.total}
            target={targetInterviews}
            approvals={[
              { label: 'Approved', value: stats.approved, color: '#22c55e' },
              { label: 'Pending', value: stats.pending, color: '#fde047' },
              { label: 'Rejected', value: stats.rejected, color: '#ef4444' },
            ]}
            accentColor="#0ea5e9"
            remainderColor="#38bdf8"
          />

          {/* Productivity Rankings */}
          <ProductivityRankings data={interviewerStats} variant="youth" />

          {/* Submission Quality & Error Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SubmissionQualityChart
              data={submissionQuality}
              variant="youth"
            />
            <ErrorBreakdown
              data={errorBreakdownData.youth}
              variant="youth"
            />
          </div>

          {/* Charts Row */}
          <DonutChart
            data={genderData}
            title="Gender Distribution"
            variant="youth"
          />

          {/* Data Table */}
          <DataTable
            data={youthData}
            columns={columns}
            title="Youth Submissions"
            variant="youth"
          />
        </>
      ) : (
        <YouthInsights />
      )}
    </div>
  );
}
