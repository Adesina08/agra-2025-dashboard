import { useMemo } from 'react';
import { Users, CheckCircle, Clock, XCircle } from 'lucide-react';
import { farmerData, fieldLabels } from '@/data/mockData';
import { KPICard } from '../KPICard';
import { DonutChart } from '../DonutChart';
import { BarChartComponent } from '../BarChartComponent';
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
    
    return { total, approved, pending, rejected, male, female };
  }, []);

  const genderData = [
    { name: 'Male', value: stats.male, color: 'hsl(var(--primary))' },
    { name: 'Female', value: stats.female, color: 'hsl(var(--accent))' },
  ];

  const regionData = useMemo(() => {
    const counts: Record<string, number> = {};
    farmerData.forEach(f => { counts[f.region] = (counts[f.region] || 0) + 1; });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, []);

  const columns = [
    { key: 'id' as const, label: 'ID', sortable: true },
    { key: 'farmerName' as const, label: fieldLabels.farmer.farmerName, sortable: true },
    { key: 'region' as const, label: fieldLabels.farmer.region, sortable: true },
    { key: 'gender' as const, label: fieldLabels.farmer.gender, sortable: true },
    { key: 'cropType' as const, label: fieldLabels.farmer.cropType, sortable: true },
    { 
      key: 'status' as const, 
      label: fieldLabels.farmer.status, 
      sortable: true,
      render: (value: string) => <StatusBadge status={value as any} />
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard title="Total" value={stats.total} icon={Users} />
        <KPICard title="Approved" value={stats.approved} icon={CheckCircle} />
        <KPICard title="Pending" value={stats.pending} icon={Clock} />
        <KPICard title="Rejected" value={stats.rejected} icon={XCircle} />
      </div>

      <ProgressPanels
        achieved={stats.total}
        target={5000}
        approvals={[
          { label: 'Approved', value: stats.approved, color: '#22c55e' },
          { label: 'Pending', value: stats.pending, color: '#f97316' },
          { label: 'Rejected', value: stats.rejected, color: '#ef4444' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DonutChart data={genderData} title="Gender Distribution" />
        <BarChartComponent data={regionData} title="By Region" color="hsl(var(--primary))" />
      </div>

      <DataTable data={farmerData} columns={columns} title="Submissions" />
    </div>
  );
}
