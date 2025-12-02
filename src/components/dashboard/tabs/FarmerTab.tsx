import { useMemo } from 'react';
import { Users, TrendingUp, CheckCircle, Clock, XCircle, Wheat } from 'lucide-react';
import { farmerData, fieldLabels } from '@/data/mockData';
import { KPICard } from '../KPICard';
import { DonutChart } from '../DonutChart';
import { BarChartComponent } from '../BarChartComponent';
import { LineChartComponent } from '../LineChartComponent';
import { MapPlaceholder } from '../MapPlaceholder';
import { DataTable } from '../DataTable';
import { StatusBadge } from '../StatusBadge';
import { ProgressPanels } from '../ProgressPanels';

export function FarmerTab() {
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

  const regionData = useMemo(() => {
    const counts: Record<string, number> = {};
    farmerData.forEach(f => { counts[f.region] = (counts[f.region] || 0) + 1; });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, []);

  const submissionTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      date: month,
      value: Math.floor(Math.random() * 150 + 50),
    }));
  }, []);

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

  return (
    <div className="space-y-6 animate-fade-in">
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DonutChart
          data={genderData}
          title="Gender Distribution"
          variant="farmer"
        />
        <BarChartComponent
          data={regionData}
          title="Submissions by Region"
          color="#22c55e"
          variant="farmer"
        />
        <MapPlaceholder
          data={farmerData.map(f => ({
            latitude: f.latitude,
            longitude: f.longitude,
            region: f.region,
            status: f.status,
          }))}
          title="Geographic Distribution"
          variant="farmer"
        />
      </div>

      {/* Trend Chart */}
      <LineChartComponent
        data={submissionTrend}
        title="Monthly Submission Trend"
        color="#22c55e"
      />

      {/* Data Table */}
      <DataTable
        data={farmerData}
        columns={columns}
        title="Farmer Submissions"
        variant="farmer"
      />
    </div>
  );
}
