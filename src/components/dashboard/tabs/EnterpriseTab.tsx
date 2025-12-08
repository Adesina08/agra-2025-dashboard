import { useState, useMemo } from 'react';
import { Building2, TrendingUp, CheckCircle, Clock, XCircle, DollarSign, ClipboardCheck, Lightbulb } from 'lucide-react';
import { EnterpriseData, fieldLabels, generateInterviewerStats, generateSubmissionQuality, errorBreakdownData } from '@/data/mockData';
import { KPICard } from '../KPICard';
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
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KPICard
              title="Total Enterprises"
              value={stats.total}
              icon={Building2}
              variant="enterprise"
              trend={{ value: 8.3, isPositive: true }}
            />
            <KPICard
              title="Approved"
              value={stats.approved}
              subtitle={`${((stats.approved / stats.safeTotal) * 100).toFixed(1)}%`}
              icon={CheckCircle}
              variant="enterprise"
            />
            <KPICard
              title="Pending"
              value={stats.pending}
              subtitle={`${((stats.pending / stats.safeTotal) * 100).toFixed(1)}%`}
              icon={Clock}
              variant="enterprise"
            />
            <KPICard
              title="Rejected"
              value={stats.rejected}
              subtitle={`${((stats.rejected / stats.safeTotal) * 100).toFixed(1)}%`}
              icon={XCircle}
              variant="enterprise"
            />
            <KPICard
              title="Total Revenue"
              value={`$${(stats.totalRevenue / 1000000).toFixed(1)}M`}
              icon={DollarSign}
              variant="enterprise"
            />
            <KPICard
              title="Avg Employees"
              value={stats.avgEmployees.toFixed(0)}
              icon={TrendingUp}
              variant="enterprise"
            />
          </div>

          <ProgressPanels
            achieved={stats.total}
            target={targetInterviews}
            approvals={[
              { label: 'Approved', value: stats.approved, color: '#22c55e' },
              { label: 'Pending', value: stats.pending, color: '#facc15' },
              { label: 'Rejected', value: stats.rejected, color: '#ef4444' },
            ]}
            accentColor="#f59e0b"
            remainderColor="#fb923c"
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
