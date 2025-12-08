import { useMemo, useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SubTab = 'qc' | 'insights';

interface EnterpriseTabProps {
  data: EnterpriseData[];
  isLoading?: boolean;
}

export function EnterpriseTab({ data, isLoading = false }: EnterpriseTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('qc');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');

  const countries = useMemo(() => {
    const set = new Set<string>();
    data.forEach((d) => {
      const c = (d.country || '').trim();
      if (c) set.add(c);
    });
    return Array.from(set).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    if (selectedCountry === 'all') return data;
    return data.filter((d) => (d.country || '').trim() === selectedCountry);
  }, [data, selectedCountry]);

  const stats = useMemo(() => {
    const total = filteredData.length;
    const approved = filteredData.filter((x) => x.status === 'Approved').length;
    const pending = filteredData.filter((x) => x.status === 'Pending').length;
    const rejected = filteredData.filter((x) => x.status === 'Rejected').length;
    const male = filteredData.filter((x) => x.gender?.toLowerCase() === 'male').length;
    const female = filteredData.filter((x) => x.gender?.toLowerCase() === 'female').length;
    const avgEmployees =
      total > 0
        ? filteredData.reduce((sum, x) => sum + (x.employeesCount || 0), 0) / total
        : 0;

    return { total, approved, pending, rejected, male, female, avgEmployees };
  }, [filteredData]);

  const genderData = [
    { name: 'Male Owners', value: stats.male, color: '#f59e0b' },
    { name: 'Female Owners', value: stats.female, color: '#ec4899' },
  ];

  const interviewerStats = useMemo(() => generateInterviewerStats(filteredData), [filteredData]);
  const submissionQuality = useMemo(() => generateSubmissionQuality(filteredData), [filteredData]);

  const columns = [
    { key: 'id' as const, label: 'ID', sortable: true },
    { key: 'name' as const, label: fieldLabels.enterprise.name, sortable: true },
    { key: 'sector' as const, label: fieldLabels.enterprise.sector, sortable: true },
    { key: 'country' as const, label: fieldLabels.enterprise.country, sortable: true },
    { key: 'region' as const, label: fieldLabels.enterprise.region, sortable: true },
    { key: 'district' as const, label: fieldLabels.enterprise.district, sortable: true },
    { key: 'gender' as const, label: fieldLabels.enterprise.gender, sortable: true },
    { key: 'employeesCount' as const, label: fieldLabels.enterprise.employeesCount, sortable: true },
    {
      key: 'annualTurnover' as const,
      label: fieldLabels.enterprise.annualTurnover,
      sortable: true,
      render: (value: number) => `$${(value || 0).toLocaleString()}`
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
      {/* Sub-tabs + Filters */}
      <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-2 flex-wrap">
        <div className="flex gap-2">
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

        <div className="flex items-center gap-2">
          <span className="text-xs md:text-sm text-muted-foreground">Country</span>
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-[190px] h-9 text-sm md:text-[0.95rem]">
              <SelectValue placeholder="All countries" />
            </SelectTrigger>
            <SelectContent className="text-sm">
              <SelectItem value="all">All countries</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeSubTab === 'qc' ? (
        <>
          <div className="w-full bg-card/95 px-4 py-3 rounded-lg border text-xs md:text-sm font-medium flex flex-wrap gap-3">
            <span>Total Enterprises: {stats.total}</span> |
            <span>Approved: {stats.approved}</span> |
            <span>Pending: {stats.pending}</span> |
            <span>Rejected: {stats.rejected}</span> |
            <span>Male-owned: {stats.male}</span> |
            <span>Female-owned: {stats.female}</span> |
            <span>Avg Employees: {stats.avgEmployees.toFixed(1)}</span>
          </div>

          <ProgressPanels
            achieved={stats.total}
            target={stats.total || 1}
            genderData={[
              { label: 'Male', value: stats.male, color: '#3b82f6' },
              { label: 'Female', value: stats.female, color: '#ec4899' },
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
            data={filteredData}
            columns={columns}
            title="Enterprise Submissions"
            variant="enterprise"
            isLoading={isLoading}
          />
        </>
      ) : (
        <EnterpriseInsights data={filteredData} />
      )}
    </div>
  );
}
