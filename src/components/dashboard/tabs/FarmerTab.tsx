import { useState, useMemo } from 'react';
import { Users, TrendingUp, CheckCircle, Clock, XCircle, Wheat, ClipboardCheck, Lightbulb } from 'lucide-react';
import { farmerData, fieldLabels, generateInterviewerStats, generateSubmissionQuality, errorBreakdownData } from '@/data/mockData';
import { KPICard } from '../KPICard';
import { DonutChart } from '../DonutChart';
import { DataTable } from '../DataTable';
import { StatusBadge } from '../StatusBadge';
import { ProgressPanels } from '../ProgressPanels';
import { ProductivityRankings } from '../ProductivityRankings';
import { SubmissionQualityChart } from '../SubmissionQualityChart';
import { ErrorBreakdown } from '../ErrorBreakdown';
import { FarmerInsights } from '../insights/FarmerInsights';

type SubTab = 'qc' | 'insights';

export function FarmerTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('qc');

  const stats = useMemo(() => {
    const total = farmerData.length;
    const approved = farmerData.filter(f => f.status === 'Approved').length;
    const pending = farmerData.filter(f => f.status === 'Pending').length;
    const rejected = farmerData.filter(f => f.status === 'Rejected').length;
    const male = farmerData.filter(f => f.gender === 'Male').length;
    const female = farmerData.filter(f => f.gender === 'Female').length;
    const avgFarmSize = farmerData.reduce((sum, f) => sum + f.farmSize, 0) / total;
    
    return { total, approved, pending, rejected, male, female, avgFarmSize };
  }, []);

  const targetInterviews = 5000;

  const genderData = [
    { name: 'Male', value: stats.male, color: '#22c55e' },
    { name: 'Female', value: stats.female, color: '#a855f7' },
  ];

  const interviewerStats = useMemo(() => generateInterviewerStats(farmerData), []);
  const submissionQuality = useMemo(() => generateSubmissionQuality(farmerData), []);

  const columns = [
    { key: 'id' as const, label: 'ID', sortable: true },
    { key: 'farmerName' as const, label: fieldLabels.farmer.farmerName, sortable: true },
    { key: 'region' as const, label: fieldLabels.farmer.region, sortable: true },
    { key: 'district' as const, label: fieldLabels.farmer.district, sortable: true },
    { key: 'gender' as const, label: fieldLabels.farmer.gender, sortable: true },
    { key: 'cropType' as const, label: fieldLabels.farmer.cropType, sortable: true },
    { key: 'farmSize' as const, label: fieldLabels.farmer.farmSize, sortable: true },
    { 
      key: 'status' as const, 
      label: fieldLabels.farmer.status, 
      sortable: true,
      render: (value: string) => <StatusBadge status={value as any} />
    },
    { key: 'submissionDate' as const, label: fieldLabels.farmer.submissionDate, sortable: true },
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
                ? 'bg-emerald-500/10 text-emerald-500 border-b-2 border-emerald-500'
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
              title="Total Farmers"
              value={stats.total}
              icon={Users}
              variant="farmer"
              trend={{ value: 12.5, isPositive: true }}
            />
            <KPICard
              title="Approved"
              value={stats.approved}
              subtitle={`${((stats.approved / stats.total) * 100).toFixed(1)}%`}
              icon={CheckCircle}
              variant="farmer"
            />
            <KPICard
              title="Pending"
              value={stats.pending}
              subtitle={`${((stats.pending / stats.total) * 100).toFixed(1)}%`}
              icon={Clock}
              variant="farmer"
            />
            <KPICard
              title="Rejected"
              value={stats.rejected}
              subtitle={`${((stats.rejected / stats.total) * 100).toFixed(1)}%`}
              icon={XCircle}
              variant="farmer"
            />
            <KPICard
              title="Avg Farm Size"
              value={`${stats.avgFarmSize.toFixed(1)} Ha`}
              icon={Wheat}
              variant="farmer"
            />
            <KPICard
              title="Approval Rate"
              value={`${((stats.approved / stats.total) * 100).toFixed(0)}%`}
              icon={TrendingUp}
              variant="farmer"
              trend={{ value: 3.2, isPositive: true }}
            />
          </div>

          <ProgressPanels
            achieved={stats.total}
            target={targetInterviews}
            approvals={[
              { label: 'Approved', value: stats.approved, color: '#22c55e' },
              { label: 'Pending', value: stats.pending, color: '#f97316' },
              { label: 'Rejected', value: stats.rejected, color: '#ef4444' },
            ]}
            accentColor="#3b82f6"
            remainderColor="#0ea5e9"
          />

          {/* Productivity Rankings */}
          <ProductivityRankings data={interviewerStats} variant="farmer" />

          {/* Submission Quality & Error Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SubmissionQualityChart data={submissionQuality} variant="farmer" />
            <ErrorBreakdown data={errorBreakdownData.farmer} variant="farmer" />
          </div>

          {/* Charts Row */}
          <DonutChart
            data={genderData}
            title="Gender Distribution"
            variant="farmer"
          />

          {/* Data Table */}
          <DataTable
            data={farmerData}
            columns={columns}
            title="Farmer Submissions"
            variant="farmer"
          />
        </>
      ) : (
        <FarmerInsights />
      )}
    </div>
  );
}
