import { useMemo } from 'react';
import { GraduationCap, CheckCircle, Clock, XCircle } from 'lucide-react';
import { youthData, fieldLabels } from '@/data/mockData';
import { KPICard } from '../KPICard';
import { DonutChart } from '../DonutChart';
import { BarChartComponent } from '../BarChartComponent';
import { DataTable } from '../DataTable';
import { StatusBadge } from '../StatusBadge';
import { ProgressPanels } from '../ProgressPanels';

export function YouthTab() {
  const stats = useMemo(() => {
    const total = youthData.length;
    const approved = youthData.filter(y => y.status === 'Approved').length;
    const pending = youthData.filter(y => y.status === 'Pending').length;
    const rejected = youthData.filter(y => y.status === 'Rejected').length;
    const male = youthData.filter(y => y.gender === 'Male').length;
    const female = youthData.filter(y => y.gender === 'Female').length;

    return { total, approved, pending, rejected, male, female };
  }, []);

  const genderData = [
    { name: 'Male', value: stats.male, color: 'hsl(var(--youth-primary))' },
    { name: 'Female', value: stats.female, color: 'hsl(var(--accent))' },
  ];

  const educationData = useMemo(() => {
    const counts: Record<string, number> = {};
    youthData.forEach(y => { counts[y.educationLevel] = (counts[y.educationLevel] || 0) + 1; });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, []);

  const columns = [
    { key: 'id' as const, label: 'ID', sortable: true },
    { key: 'youthName' as const, label: fieldLabels.youth.youthName, sortable: true },
    { key: 'region' as const, label: fieldLabels.youth.region, sortable: true },
    { key: 'gender' as const, label: fieldLabels.youth.gender, sortable: true },
    { key: 'educationLevel' as const, label: fieldLabels.youth.educationLevel, sortable: true },
    { 
      key: 'status' as const, 
      label: fieldLabels.youth.status, 
      sortable: true,
      render: (value: string) => <StatusBadge status={value as any} />
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard title="Total" value={stats.total} icon={GraduationCap} />
        <KPICard title="Approved" value={stats.approved} icon={CheckCircle} />
        <KPICard title="Pending" value={stats.pending} icon={Clock} />
        <KPICard title="Rejected" value={stats.rejected} icon={XCircle} />
      </div>

      <ProgressPanels
        achieved={stats.total}
        target={3000}
        approvals={[
          { label: 'Approved', value: stats.approved, color: '#22c55e' },
          { label: 'Pending', value: stats.pending, color: '#f97316' },
          { label: 'Rejected', value: stats.rejected, color: '#ef4444' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DonutChart data={genderData} title="Gender Distribution" />
        <BarChartComponent data={educationData} title="Education Level" color="hsl(var(--youth-primary))" />
      </div>

      <DataTable data={youthData} columns={columns} title="Submissions" />
    </div>
  );
}
