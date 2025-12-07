// src/components/dashboard/tabs/FarmerTab.tsx
import { useMemo, useState } from 'react';
import {
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Wheat,
  ClipboardCheck,
  Lightbulb,
} from 'lucide-react';
import {
  fieldLabels,
  generateInterviewerStats,
  generateSubmissionQuality,
  errorBreakdownData,
  type FarmerData,
} from '@/data/mockData';
import { useSheetData } from '@/hooks/useSheetData';
import { useQCData } from '@/hooks/useQCData';
import { mapFarmerRow } from '@/lib/mappings';
import { mergeWithQC } from '@/lib/mergeQCData';
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

const farmerSheetId = import.meta.env.VITE_SHEET_ID_FARMERS as string | undefined;
const farmerDataConfig = farmerSheetId
  ? {
      sheetId: farmerSheetId,
      gid: import.meta.env.VITE_SHEET_GID_FARMERS_DATA as string,
    }
  : undefined;

const farmerQCConfig = farmerSheetId
  ? {
      sheetId: farmerSheetId,
      gidDetail: import.meta.env.VITE_SHEET_GID_FARMERS_QC_DETAIL as string,
      gidSummary: import.meta.env.VITE_SHEET_GID_FARMERS_QC_SUMMARY as string,
      gidEnum: import.meta.env.VITE_SHEET_GID_FARMERS_ENUM as string,
    }
  : undefined;

export function FarmerTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('qc');

  const {
    data: farmerRaw,
    loading: farmerLoading,
    error: farmerError,
  } = useSheetData<FarmerData>(farmerDataConfig, mapFarmerRow);

  const {
    qcDetail,
    qcSummary,
    enumPerformance,
    loading: qcLoading,
    error: qcError,
  } = useQCData(farmerQCConfig);

  const farmerData = useMemo(
    () => mergeWithQC(farmerRaw, qcDetail),
    [farmerRaw, qcDetail]
  );

  const loading = farmerLoading || qcLoading;
  const error = farmerError || qcError;

  const stats = useMemo(() => {
    const total = farmerData.length;
    if (!total) {
      return {
        total: 0,
        approved: 0,
        pending: 0,
        notApproved: 0,
        male: 0,
        female: 0,
        avgFarmSize: 0,
      };
    }

    const approved = farmerData.filter((f) => f.status === 'Approved').length;
    const pending = farmerData.filter((f) => f.status === 'Pending').length;
    const notApproved = farmerData.filter(
      (f) => f.status !== 'Approved' && f.status !== 'Pending'
    ).length;
    const male = farmerData.filter((f) => f.gender === 'Male').length;
    const female = farmerData.filter((f) => f.gender === 'Female').length;
    const avgFarmSize =
      farmerData.reduce((sum, f) => sum + (f.farmSize || 0), 0) / total;

    return { total, approved, pending, notApproved, male, female, avgFarmSize };
  }, [farmerData]);

  const targetInterviews = 5000;

  const genderData = [
    { name: 'Male', value: stats.male, color: '#22c55e' },
    { name: 'Female', value: stats.female, color: '#a855f7' },
  ];

  const interviewerStats = useMemo(() => {
    if (enumPerformance.length) {
      return enumPerformance.map((perf) => ({
        name: perf.enumeratorID || 'Unknown',
        totalInterviews: perf.totalSubmissions,
        approved: Math.max(0, perf.totalSubmissions - perf.totalFlags),
      }));
    }
    return generateInterviewerStats(farmerData);
  }, [enumPerformance, farmerData]);
  const submissionQuality = useMemo(
    () => generateSubmissionQuality(farmerData),
    [farmerData]
  );

  const qcErrorBreakdown = useMemo(
    () =>
      qcSummary.length
        ? qcSummary.map((item) => ({
            errorType: item.flagName || item.kpi,
            relatedVariables: `${item.category} | ${item.type}`,
            count: item.count,
          }))
        : errorBreakdownData.farmer,
    [qcSummary]
  );

  const columns = [
    { key: 'id' as const, label: 'ID', sortable: true },
    {
      key: 'farmerName' as const,
      label: fieldLabels.farmer.farmerName,
      sortable: true,
    },
    {
      key: 'region' as const,
      label: fieldLabels.farmer.region,
      sortable: true,
    },
    {
      key: 'district' as const,
      label: fieldLabels.farmer.district,
      sortable: true,
    },
    {
      key: 'gender' as const,
      label: fieldLabels.farmer.gender,
      sortable: true,
    },
    {
      key: 'cropType' as const,
      label: fieldLabels.farmer.cropType,
      sortable: true,
    },
    {
      key: 'farmSize' as const,
      label: fieldLabels.farmer.farmSize,
      sortable: true,
    },
    {
      key: 'status' as const,
      label: fieldLabels.farmer.status,
      sortable: true,
      render: (value: string) => <StatusBadge status={value as any} />,
    },
    {
      key: 'submissionDate' as const,
      label: fieldLabels.farmer.submissionDate,
      sortable: true,
    },
  ];

  const subTabs = [
    { id: 'qc' as const, label: 'QC', icon: ClipboardCheck },
    { id: 'insights' as const, label: 'Insights', icon: Lightbulb },
  ];

  if (loading) {
    return <div className="animate-pulse text-sm text-muted-foreground">Loading farmer data…</div>;
  }

  if (error) {
    return (
      <div className="text-sm text-red-500">
        Failed to load Farmer sheet: {error}
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
              subtitle={
                stats.total
                  ? `${((stats.approved / stats.total) * 100).toFixed(1)}%`
                  : '0%'
              }
              icon={CheckCircle}
              variant="farmer"
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
              variant="farmer"
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
              variant="farmer"
            />
            <KPICard
              title="Avg. Farm Size"
              value={`${stats.avgFarmSize.toFixed(1)} ha`}
              subtitle="Across all approved farms"
              icon={Wheat}
              variant="farmer"
            />
            <KPICard
              title="Growth"
              value="14.2%"
              subtitle="MoM increase"
              icon={TrendingUp}
              variant="farmer"
            />
          </div>

          {/* Progress & Quality Panels */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <ProgressPanels
                achieved={stats.total}
                target={targetInterviews}
                approvals={[
                  { label: 'Approved', value: stats.approved, color: '#22c55e' },
                  { label: 'Not Approved', value: stats.notApproved, color: '#ef4444' },
                  { label: 'Pending', value: stats.pending, color: '#eab308' },
                ]}
                accentColor="#22c55e"
                remainderColor="#22c55e20"
              />
            </div>

            <div className="minimal-card">
              <h3 className="text-sm font-medium text-foreground mb-1">Gender Distribution</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Balance across male and female respondents
              </p>
              <div className="h-48">
                <DonutChart data={genderData} variant="farmer" />
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="minimal-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-foreground">Farmer Submissions</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Live data synced from the Farmer survey sheet
                </p>
              </div>
              <div className="text-xs text-muted-foreground">Updated automatically</div>
            </div>
            <DataTable data={farmerData} columns={columns} />
          </div>

          {/* Charts & Stats */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <SubmissionQualityChart
                data={submissionQuality}
                variant="farmer"
                title="Enumerator Submission Quality"
              />
            </div>
            <ProductivityRankings
              data={interviewerStats}
              variant="farmer"
              title="Top Enumerator Performance"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <ErrorBreakdown
              data={qcErrorBreakdown}
              variant="farmer"
              title="Top Validation Flags"
            />
            <div className="minimal-card">
              <h3 className="text-sm font-medium text-foreground mb-3">Insights & Recommendations</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Automated insights based on the latest QC results
              </p>
              <FarmerInsights data={farmerData} />
            </div>
          </div>
        </>
      ) : (
        <FarmerInsights data={farmerData} detailed />
      )}
    </div>
  );
}
