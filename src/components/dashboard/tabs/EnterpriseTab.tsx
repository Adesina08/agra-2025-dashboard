// src/components/dashboard/tabs/EnterpriseTab.tsx
import { useMemo, useState } from 'react';
import {
  Building2,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  ClipboardCheck,
  Lightbulb,
} from 'lucide-react';
import {
  fieldLabels,
  generateInterviewerStats,
  generateSubmissionQuality,
  errorBreakdownData,
  type EnterpriseData,
} from '@/data/mockData';
import { useSheetData } from '@/hooks/useSheetData';
import { useQCData } from '@/hooks/useQCData';
import { mapEnterpriseRow } from '@/lib/mappings';
import { mergeWithQC } from '@/lib/mergeQCData';
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

const enterpriseSheetId = import.meta.env.VITE_SHEET_ID_ENTERPRISE as
  | string
  | undefined;

const enterpriseDataConfig = enterpriseSheetId
  ? {
      sheetId: enterpriseSheetId,
      gid: import.meta.env.VITE_SHEET_GID_ENTERPRISE_DATA as string,
    }
  : undefined;

const enterpriseQCConfig = enterpriseSheetId
  ? {
      sheetId: enterpriseSheetId,
      gidDetail: import.meta.env.VITE_SHEET_GID_ENTERPRISE_QC_DETAIL as string,
      gidSummary: import.meta.env.VITE_SHEET_GID_ENTERPRISE_QC_SUMMARY as string,
      gidEnum: import.meta.env.VITE_SHEET_GID_ENTERPRISE_ENUM as string,
    }
  : undefined;

export function EnterpriseTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('qc');

  const {
    data: enterpriseRaw,
    loading: enterpriseLoading,
    error: enterpriseError,
  } = useSheetData<EnterpriseData>(enterpriseDataConfig, mapEnterpriseRow);

  const {
    qcDetail,
    qcSummary,
    enumPerformance,
    loading: qcLoading,
    error: qcError,
  } = useQCData(enterpriseQCConfig);

  const enterpriseData = useMemo(
    () => mergeWithQC(enterpriseRaw, qcDetail),
    [enterpriseRaw, qcDetail]
  );

  const loading = enterpriseLoading || qcLoading;
  const error = enterpriseError || qcError;

  const stats = useMemo(() => {
    const total = enterpriseData.length;
    if (!total) {
      return {
        total: 0,
        approved: 0,
        pending: 0,
        notApproved: 0,
        male: 0,
        female: 0,
        totalRevenue: 0,
        avgEmployees: 0,
      };
    }

    const approved = enterpriseData.filter((e) => e.status === 'Approved').length;
    const pending = enterpriseData.filter((e) => e.status === 'Pending').length;
    const notApproved = enterpriseData.filter(
      (e) => e.status !== 'Approved' && e.status !== 'Pending'
    ).length;
    const male = enterpriseData.filter((e) => e.gender === 'Male').length;
    const female = enterpriseData.filter((e) => e.gender === 'Female').length;

    const totalRevenue = enterpriseData.reduce(
      (sum, e) => sum + (e.annualRevenue || 0),
      0
    );
    const avgEmployees =
      enterpriseData.reduce((sum, e) => sum + (e.employees || 0), 0) / total;

    return {
      total,
      approved,
      pending,
      notApproved,
      male,
      female,
      totalRevenue,
      avgEmployees,
    };
  }, [enterpriseData]);

  const targetInterviews = 2200;

  const genderData = [
    { name: 'Male Owners', value: stats.male, color: '#f59e0b' },
    { name: 'Female Owners', value: stats.female, color: '#ec4899' },
  ];

  const interviewerStats = useMemo(() => {
    if (enumPerformance.length) {
      return enumPerformance.map((perf) => ({
        name: perf.enumeratorID || 'Unknown',
        totalInterviews: perf.totalSubmissions,
        approved: Math.max(0, perf.totalSubmissions - perf.totalFlags),
      }));
    }
    return generateInterviewerStats(enterpriseData);
  }, [enumPerformance, enterpriseData]);
  const submissionQuality = useMemo(
    () => generateSubmissionQuality(enterpriseData),
    [enterpriseData]
  );

  const qcErrorBreakdown = useMemo(
    () =>
      qcSummary.length
        ? qcSummary.map((item) => ({
            errorType: item.flagName || item.kpi,
            relatedVariables: `${item.category} | ${item.type}`,
            count: item.count,
          }))
        : errorBreakdownData.enterprise,
    [qcSummary]
  );

  const columns = [
    { key: 'id' as const, label: 'ID', sortable: true },
    {
      key: 'enterpriseName' as const,
      label: fieldLabels.enterprise.enterpriseName,
      sortable: true,
    },
    {
      key: 'businessType' as const,
      label: fieldLabels.enterprise.businessType,
      sortable: true,
    },
    {
      key: 'region' as const,
      label: fieldLabels.enterprise.region,
      sortable: true,
    },
    {
      key: 'district' as const,
      label: fieldLabels.enterprise.district,
      sortable: true,
    },
    {
      key: 'employees' as const,
      label: fieldLabels.enterprise.employees,
      sortable: true,
    },
    {
      key: 'status' as const,
      label: fieldLabels.enterprise.status,
      sortable: true,
      render: (value: string) => <StatusBadge status={value as any} />,
    },
    {
      key: 'submissionDate' as const,
      label: fieldLabels.enterprise.submissionDate,
      sortable: true,
    },
  ];

  const subTabs = [
    { id: 'qc' as const, label: 'QC', icon: ClipboardCheck },
    { id: 'insights' as const, label: 'Insights', icon: Lightbulb },
  ];

  if (loading) {
    return <div className="animate-pulse text-sm text-muted-foreground">Loading enterprise data…</div>;
  }

  if (error) {
    return (
      <div className="text-sm text-red-500">
        Failed to load Enterprise sheet: {error}
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
              trend={{ value: 8.2, isPositive: true }}
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
              variant="enterprise"
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
              variant="enterprise"
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
              variant="enterprise"
            />
            <KPICard
              title="Total Revenue"
              value={`$${(stats.totalRevenue / 1000).toFixed(1)}k`}
              subtitle="Reported"
              icon={DollarSign}
              variant="enterprise"
            />
            <KPICard
              title="Avg. Employees"
              value={stats.avgEmployees.toFixed(1)}
              subtitle="Per enterprise"
              icon={TrendingUp}
              variant="enterprise"
            />
          </div>

          {/* Progress & Quality Panels */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <ProgressPanels
                achieved={stats.total}
                target={targetInterviews}
                approvals={[
                  { label: 'Approved', value: stats.approved, color: '#f59e0b' },
                  { label: 'Not Approved', value: stats.notApproved, color: '#ef4444' },
                  { label: 'Pending', value: stats.pending, color: '#eab308' },
                ]}
                accentColor="#f59e0b"
                remainderColor="#f59e0b20"
              />
            </div>

            <div className="minimal-card">
              <h3 className="text-sm font-medium text-foreground mb-1">Ownership Gender</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Distribution across male and female-owned enterprises
              </p>
              <div className="h-48">
                <DonutChart data={genderData} variant="enterprise" />
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="minimal-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-foreground">Enterprise Submissions</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Live data synced from the Enterprise survey sheet
                </p>
              </div>
              <div className="text-xs text-muted-foreground">Updated automatically</div>
            </div>
            <DataTable data={enterpriseData} columns={columns} />
          </div>

          {/* Charts & Stats */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <SubmissionQualityChart
                data={submissionQuality}
                variant="enterprise"
                title="Enumerator Submission Quality"
              />
            </div>
            <ProductivityRankings
              data={interviewerStats}
              variant="enterprise"
              title="Top Enumerator Performance"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <ErrorBreakdown
              data={qcErrorBreakdown}
              variant="enterprise"
              title="Top Validation Flags"
            />
            <div className="minimal-card">
              <h3 className="text-sm font-medium text-foreground mb-3">Insights & Recommendations</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Automated insights based on the latest QC results
              </p>
              <EnterpriseInsights data={enterpriseData} />
            </div>
          </div>
        </>
      ) : (
        <EnterpriseInsights data={enterpriseData} detailed />
      )}
    </div>
  );
}
