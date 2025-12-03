import { useMemo } from 'react';
import { Building2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { enterpriseData, fieldLabels } from '@/data/mockData';
import { KPICard } from '../KPICard';
import { DonutChart } from '../DonutChart';
import { BarChartComponent } from '../BarChartComponent';
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
    
    return { total, approved, pending, rejected, male, female };
  }, []);

  const genderData = [
    { name: 'Male', value: stats.male, color: 'hsl(var(--enterprise-primary))' },
    { name: 'Female', value: stats.female, color: 'hsl(var(--accent))' },
  ];

  const businessTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    enterpriseData.forEach(e => { counts[e.businessType] = (counts[e.businessType] || 0) + 1; });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, []);

  const columns = [
    { key: 'id' as const, label: 'ID', sortable: true },
    { key: 'enterpriseName' as const, label: fieldLabels.enterprise.enterpriseName, sortable: true },
    { key: 'businessType' as const, label: fieldLabels.enterprise.businessType, sortable: true },
    { key: 'region' as const, label: fieldLabels.enterprise.region, sortable: true },
    { key: 'gender' as const, label: fieldLabels.enterprise.gender, sortable: true },
    { 
      key: 'status' as const, 
      label: fieldLabels.enterprise.status, 
      sortable: true,
      render: (value: string) => <StatusBadge status={value as any} />
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard title="Total" value={stats.total} icon={Building2} />
        <KPICard title="Approved" value={stats.approved} icon={CheckCircle} />
        <KPICard title="Pending" value={stats.pending} icon={Clock} />
        <KPICard title="Rejected" value={stats.rejected} icon={XCircle} />
      </div>

      <ProgressPanels
        achieved={stats.total}
        target={2200}
        approvals={[
          { label: 'Approved', value: stats.approved, color: '#22c55e' },
          { label: 'Pending', value: stats.pending, color: '#f97316' },
          { label: 'Rejected', value: stats.rejected, color: '#ef4444' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DonutChart data={genderData} title="Owner Gender" />
        <BarChartComponent data={businessTypeData} title="Business Type" color="hsl(var(--enterprise-primary))" />
      </div>

      <DataTable data={enterpriseData} columns={columns} title="Submissions" />
    </div>
  );
}
