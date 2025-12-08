import { useState, useMemo } from 'react';
import { ClipboardCheck, Lightbulb } from 'lucide-react';
import { EnterpriseData, fieldLabels, generateInterviewerStats, generateSubmissionQuality, errorBreakdownData } from '@/data/mockData';
import { DonutChart } from '../DonutChart';
import { DataTable } from '../DataTable';
import { StatusBadge } from '../StatusBadge';
import { ProgressPanels } from '../ProgressPanels';
import { ProductivityRankings } from '../ProductivityRankings';
import { SubmissionQualityChart } from '../SubmissionQualityChart';
import { ErrorBreakdown } from '../ErrorBreakdown';
import { EnterpriseInsights } from '../insights/EnterpriseInsights';

type SubTab = 'qc' | 'insights';

interface EnterpriseTabProps {
  data: EnterpriseData[];
  isLoading?: boolean;
}

export function EnterpriseTab({ data, isLoading = false }: EnterpriseTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('qc');

  const stats = useMemo(() => {
    const total = data.length;
    const safeTotal = total || 1;
    const approved = data.filter(e => e.status === 'Approved').length;
    const pending = data.filter(e => e.status === 'Pending').length;
    const rejected = data.filter(e => e.status === 'Rejected').length;
    const male = data.filter(e => e.gender === 'Male').length;
    const female = data.filter(e => e.gender === 'Female').length;
    const totalRevenue = data.reduce((sum, e) => sum + e.annualRevenue, 0);
    const avgEmployees = total ? data.reduce((sum, e) => sum + e.employees, 0) / total : 0;

    return { total, safeTotal, approved, pending, rejected, male, female, totalRevenue, avgEmployees };
  }, [data]);

  const targetInterviews = 2200;

  const genderData = [
    { name: 'Male Owners', value: stats.male, color: '#f59e0b' },
    { name: 'Female Owners', value: stats.female, color: '#ec4899' },
  ];

  const interviewerStats = useMemo(() => generateInterviewerStats(data), [data]);
  const submissionQuality = useMemo(() => generateSubmissionQuality(data), [data]);

  const columns = [
    { key: 'id' as const, label: 'ID', sortable: true },
    { key: 'enterpriseName' as const, label: fieldLabels.enterprise.enterpriseName, sortable: true },
    { key: 'businessType' as const, label: fieldLabels.enterprise.businessType, sortable: true },
    { key: 'region' as const, label: fieldLabels.enterprise.region, sortable: true },
    { key: 'gender' as const, label: fieldLabels.enterprise.gender, sortable: true },
    { key: 'employees' as const, label: fieldLabels.enterprise.employees, sortable: true },
    { 
      key: 'annualRevenue' as const, 
      label: fieldLabels.enterprise.annualRevenue, 
      sortable: true,
      render: (value: number) => `$${value.toLocaleString()}`
    },
    { 
      key: 'status' as const, 
      label: fieldLabels.enterprise.status, 
      sortable: true,
      render: (value: string) => <StatusBadge status={value as any} />
    },
    { key: 'submissionDate' as const, label: fieldLabels.enterprise.submissionDate, sortable: true },
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
                ? 'bg-amber-500/10 text-amber-500 border-b-2 border-amber-500'
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
                <span className="font-semibold">Total Enterprises:</span>{' '}
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
                <span className="font-semibold">Approval Rate:</span>{' '}
                {stats.safeTotal
                  ? `${((stats.approved / stats.safeTotal) * 100).toFixed(1)}%`
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
            accentColor="#f59e0b"
            remainderColor="#6b7280"
          />

          {/* Productivity Rankings */}
          <ProductivityRankings data={interviewerStats} variant="enterprise" />

          {/* Submission Quality & Error Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SubmissionQualityChart data={submissionQuality} variant="enterprise" />
            <ErrorBreakdown data={errorBreakdownData.enterprise} variant="enterprise" />
          </div>

          {/* Charts Row */}
          <DonutChart
            data={genderData}
            title="Owner Gender Distribution"
            variant="enterprise"
          />

          {/* Data Table */}
          <DataTable
            data={data}
            columns={columns}
            title="Enterprise Submissions"
            variant="enterprise"
            isLoading={isLoading}
          />
        </>
      ) : (
        <EnterpriseInsights />
      )}
    </div>
  );
}
