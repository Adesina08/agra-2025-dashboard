import { useState, useMemo } from 'react';
import { ClipboardCheck, Lightbulb } from 'lucide-react';
import { YouthData, fieldLabels, generateInterviewerStats, generateSubmissionQuality, errorBreakdownData } from '@/data/mockData';
import { DonutChart } from '../DonutChart';
import { DataTable } from '../DataTable';
import { StatusBadge } from '../StatusBadge';
import { ProgressPanels } from '../ProgressPanels';
import { ProductivityRankings } from '../ProductivityRankings';
import { SubmissionQualityChart } from '../SubmissionQualityChart';
import { ErrorBreakdown } from '../ErrorBreakdown';
import { YouthInsights } from '../insights/YouthInsights';

type SubTab = 'qc' | 'insights';

interface YouthTabProps {
  data: YouthData[];
  isLoading?: boolean;
}

export function YouthTab({ data, isLoading = false }: YouthTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('qc');

  const stats = useMemo(() => {
    const total = data.length;
    const safeTotal = total || 1;
    const approved = data.filter(y => y.status === 'Approved').length;
    const pending = data.filter(y => y.status === 'Pending').length;
    const rejected = data.filter(y => y.status === 'Rejected').length;
    const male = data.filter(y => y.gender === 'Male').length;
    const female = data.filter(y => y.gender === 'Female').length;
    const trained = data.filter(y => y.trainingCompleted).length;
    const employed = data.filter(y => y.employmentStatus === 'Employed' || y.employmentStatus === 'Self-employed').length;

    return { total, safeTotal, approved, pending, rejected, male, female, trained, employed };
  }, [data]);

  const targetInterviews = 3000;

  const genderData = [
    { name: 'Male', value: stats.male, color: '#06b6d4' },
    { name: 'Female', value: stats.female, color: '#f472b6' },
  ];

  const interviewerStats = useMemo(() => generateInterviewerStats(data), [data]);
  const submissionQuality = useMemo(() => generateSubmissionQuality(data), [data]);

  const columns = [
    { key: 'id' as const, label: 'ID', sortable: true },
    { key: 'youthName' as const, label: fieldLabels.youth.youthName, sortable: true },
    { key: 'region' as const, label: fieldLabels.youth.region, sortable: true },
    { key: 'gender' as const, label: fieldLabels.youth.gender, sortable: true },
    { key: 'ageGroup' as const, label: fieldLabels.youth.ageGroup, sortable: true },
    { key: 'educationLevel' as const, label: fieldLabels.youth.educationLevel, sortable: true },
    { key: 'employmentStatus' as const, label: fieldLabels.youth.employmentStatus, sortable: true },
    { 
      key: 'trainingCompleted' as const, 
      label: fieldLabels.youth.trainingCompleted, 
      sortable: true,
      render: (value: boolean) => (
        <span className={value ? 'text-green-400' : 'text-muted-foreground'}>
          {value ? 'Yes' : 'No'}
        </span>
      )
    },
    { 
      key: 'status' as const, 
      label: fieldLabels.youth.status, 
      sortable: true,
      render: (value: string) => <StatusBadge status={value as any} />
    },
  ];

  const subTabs = [
    { id: 'qc' as const, label: 'QC', icon: ClipboardCheck },
    { id: 'insights' as const, label: 'Insights', icon: Lightbulb },
  ];

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
          <div className="minimal-card flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              QC KPIs
            </p>
            <p className="text-sm text-foreground flex flex-wrap gap-x-2 gap-y-1">
              <span>
                <span className="font-semibold">Total Youth:</span>{' '}
                {stats.total.toLocaleString()}
              </span>
              <span>|</span>
              <span>
                <span className="font-semibold">Approved:</span>{' '}
                {stats.approved.toLocaleString()}
              </span>
              <span>|</span>
              <span>
                <span className="font-semibold">Pending:</span>{' '}
                {stats.pending.toLocaleString()}
              </span>
              <span>|</span>
              <span>
                <span className="font-semibold">Rejected:</span>{' '}
                {stats.rejected.toLocaleString()}
              </span>
              <span>|</span>
              <span>
                <span className="font-semibold">Training Completed:</span>{' '}
                {stats.safeTotal
                  ? `${((stats.trained / stats.safeTotal) * 100).toFixed(0)}%`
                  : '0%'}
              </span>
              <span>|</span>
              <span>
                <span className="font-semibold">Employment Rate:</span>{' '}
                {stats.safeTotal
                  ? `${((stats.employed / stats.safeTotal) * 100).toFixed(0)}%`
                  : '0%'}
              </span>
            </p>
          </div>

          <ProgressPanels
            achieved={stats.total}
            target={targetInterviews}
            genderData={[
              { label: 'Male', value: stats.male, color: '#3b82f6' },
              { label: 'Female', value: stats.female, color: '#ec4899' },
            ]}
            accentColor="#6366f1"
            remainderColor="#6b7280"
          />

          {/* Productivity Rankings */}
          <ProductivityRankings data={interviewerStats} variant="youth" />

          {/* Submission Quality & Error Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SubmissionQualityChart data={submissionQuality} variant="youth" />
            <ErrorBreakdown data={errorBreakdownData.youth} variant="youth" />
          </div>

          {/* Charts Row */}
          <DonutChart
            data={genderData}
            title="Gender Distribution"
            variant="youth"
          />

          {/* Data Table */}
          <DataTable
            data={data}
            columns={columns}
            title="Youth Submissions"
            variant="youth"
            isLoading={isLoading}
          />
        </>
      ) : (
        <YouthInsights />
      )}
    </div>
  );
}
