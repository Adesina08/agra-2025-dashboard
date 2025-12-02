import { useMemo } from 'react';
import { Building2, TrendingUp, CheckCircle, Clock, XCircle, DollarSign } from 'lucide-react';
import { enterpriseData, fieldLabels } from '@/data/mockData';
import { KPICard } from '../KPICard';
import { DonutChart } from '../DonutChart';
import { BarChartComponent } from '../BarChartComponent';
import { LineChartComponent } from '../LineChartComponent';
import { MapPlaceholder } from '../MapPlaceholder';
import { DataTable } from '../DataTable';
import { StatusBadge } from '../StatusBadge';
import { ProgressPanels } from '../ProgressPanels';

export function EnterpriseTab() {
  const stats = useMemo(() => {
    const total = enterpriseData.length;
    const approved = enterpriseData.filter(e => e.status === 'Approved').length;
    const pending = enterpriseData.filter(e => e.status === 'Pending').length;
    const rejected = enterpriseData.filter(e => e.status === 'Rejected').length;
    const male = enterpriseData.filter(e => e.gender === 'Male').length;
    const female = enterpriseData.filter(e => e.gender === 'Female').length;
    const totalRevenue = enterpriseData.reduce((sum, e) => sum + e.annualRevenue, 0);
    const avgEmployees = enterpriseData.reduce((sum, e) => sum + e.employees, 0) / total;
    
    return { total, approved, pending, rejected, male, female, totalRevenue, avgEmployees };
  }, []);

  const targetInterviews = 2200;

  const genderData = [
    { name: 'Male Owners', value: stats.male, color: '#f59e0b' },
    { name: 'Female Owners', value: stats.female, color: '#ec4899' },
  ];

  const businessTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    enterpriseData.forEach(e => { counts[e.businessType] = (counts[e.businessType] || 0) + 1; });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, []);

  const submissionTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      date: month,
      value: Math.floor(Math.random() * 60 + 20),
    }));
  }, []);

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

  return (
    <div className="space-y-6 animate-fade-in">
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
          subtitle={`${((stats.approved / stats.total) * 100).toFixed(1)}%`}
          icon={CheckCircle}
          variant="enterprise"
        />
        <KPICard
          title="Pending"
          value={stats.pending}
          subtitle={`${((stats.pending / stats.total) * 100).toFixed(1)}%`}
          icon={Clock}
          variant="enterprise"
        />
        <KPICard
          title="Rejected"
          value={stats.rejected}
          subtitle={`${((stats.rejected / stats.total) * 100).toFixed(1)}%`}
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DonutChart
          data={genderData}
          title="Owner Gender Distribution"
          variant="enterprise"
        />
        <BarChartComponent
          data={businessTypeData}
          title="Enterprises by Business Type"
          color="#f59e0b"
          variant="enterprise"
        />
        <MapPlaceholder
          data={enterpriseData.map(e => ({
            latitude: e.latitude,
            longitude: e.longitude,
            region: e.region,
            status: e.status,
          }))}
          title="Geographic Distribution"
          variant="enterprise"
        />
      </div>

      {/* Trend Chart */}
      <LineChartComponent
        data={submissionTrend}
        title="Monthly Submission Trend"
        color="#f59e0b"
      />

      {/* Data Table */}
      <DataTable
        data={enterpriseData}
        columns={columns}
        title="Enterprise Submissions"
        variant="enterprise"
      />
    </div>
  );
}
