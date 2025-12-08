import { useMemo, useState } from 'react';
import { ClipboardCheck, Lightbulb } from 'lucide-react';
import { YouthData, fieldLabels, generateInterviewerStats, generateSubmissionQuality, errorBreakdownData } from '@/data/mockData';
import { DonutChart } from '../DonutChart';
import { DataTable } from '../DataTable';
import { StatusBadge } from '../StatusBadge';
import { ProgressPanels } from '../ProgressPanels';
import { ProductivityRankings } from '../ProductivityRankings';
import { SubmissionQualityChart } from '../SubmissionQualityChart';
import { ErrorBreakdown } from '../ErrorBreakdown';
import { YouthInsights } from '../insights/YouthInsights';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SubTab = 'qc' | 'insights';

interface YouthTabProps {
  data: YouthData[];
  isLoading?: boolean;
}

export function YouthTab({ data, isLoading = false }: YouthTabProps) {
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
    const male = filteredData.filter((x) => x.gender?.toLowerCase() === 'male').length;
    const female = filteredData.filter((x) => x.gender?.toLowerCase() === 'female').length;
    const youthShare =
      total > 0 ? (filteredData.filter((x) => x.isYouth).length / total) * 100 : 0;

    return { total, approved, male, female, youthShare };
  }, [filteredData]);

  const genderData = [
    { name: 'Male', value: stats.male, color: '#06b6d4' },
    { name: 'Female', value: stats.female, color: '#f472b6' },
  ];

  const interviewerStats = useMemo(() => generateInterviewerStats(filteredData), [filteredData]);
  const submissionQuality = useMemo(() => generateSubmissionQuality(filteredData), [filteredData]);

  const columns = [
    { key: 'id' as const, label: 'ID', sortable: true },
    { key: 'respondentName' as const, label: fieldLabels.youth.respondentName, sortable: true },
    { key: 'country' as const, label: fieldLabels.youth.country, sortable: true },
    { key: 'region' as const, label: fieldLabels.youth.region, sortable: true },
    { key: 'district' as const, label: fieldLabels.youth.district, sortable: true },
    { key: 'gender' as const, label: fieldLabels.youth.gender, sortable: true },
    { key: 'ageGroup' as const, label: fieldLabels.youth.ageGroup, sortable: true },
    { key: 'youthInWork' as const, label: fieldLabels.youth.youthInWork, sortable: true },
    {
      key: 'youthAttitudeScore' as const,
      label: 'Attitude Score',
      sortable: true,
      render: (value?: number) => (value != null ? value.toFixed(1) : '—'),
    },
    {
      key: 'status' as const,
      label: fieldLabels.youth.status,
      sortable: true,
      render: (value: string) => <StatusBadge status={value as any} />
    },
  ];

  const subTabs = [
    { id: 'qc' as const, label: 'QC', icon: ClipboardCheck },
    { id: 'insights' as const, label: 'Insights', icon: Lightbulb },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-2 flex-wrap">
        <div className="flex gap-2">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
                activeSubTab === tab.id
                  ? 'bg-violet-500/10 text-violet-500 border-b-2 border-violet-500'
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
            <span>Total Youth: {stats.total}</span> |
            <span>Approved: {stats.approved}</span> |
            <span>Male: {stats.male}</span> |
            <span>Female: {stats.female}</span> |
            <span>Youth (defined): {stats.youthShare.toFixed(1)}%</span>
          </div>

          <ProgressPanels
            achieved={stats.total}
            target={stats.total || 1}
            genderData={[
              { label: 'Male', value: stats.male, color: '#3b82f6' },
              { label: 'Female', value: stats.female, color: '#ec4899' },
            ]}
            accentColor="#0ea5e9"
            remainderColor="#38bdf8"
          />

          {/* Productivity Rankings */}
          <ProductivityRankings data={interviewerStats} variant="youth" />

          {/* Submission Quality & Error Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SubmissionQualityChart data={submissionQuality} variant="youth" />
            <ErrorBreakdown data={errorBreakdownData.youth} variant="youth" />
          </div>

          {/* Charts Row */}
          <DonutChart
            data={genderData}
            title="Gender Distribution"
            variant="youth"
          />

          {/* Data Table */}
          <DataTable
            data={filteredData}
            columns={columns}
            title="Youth Submissions"
            variant="youth"
            isLoading={isLoading}
          />
        </>
      ) : (
        <YouthInsights data={filteredData} />
      )}
    </div>
  );
}
