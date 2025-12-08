import { useState, useMemo } from 'react';
import { ClipboardCheck, Lightbulb } from 'lucide-react';
import { FarmerData, generateInterviewerStats, generateSubmissionQuality, errorBreakdownData } from '@/data/mockData';
import { ProgressPanels } from '../ProgressPanels';
import { ProductivityRankings } from '../ProductivityRankings';
import { SubmissionQualityChart } from '../SubmissionQualityChart';
import { ErrorBreakdown } from '../ErrorBreakdown';
import { FarmerInsights } from '../insights/FarmerInsights';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SubTab = 'qc' | 'insights';

interface FarmerTabProps {
  data: FarmerData[];
  isLoading?: boolean;
  isLive?: boolean;
}

export function FarmerTab({ data, isLoading = false }: FarmerTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('qc');

  const [selectedCountry, setSelectedCountry] = useState<string>('all');

  // 🔹 derive unique list of countries from normalized data
  const countries = useMemo(() => {
    const set = new Set<string>();
    data.forEach((f) => {
      const c = (f.country || '').trim();
      if (c) set.add(c);
    });
    return Array.from(set).sort();
  }, [data]);

  // 🔹 apply country filter
  const filteredData = useMemo(() => {
    if (selectedCountry === 'all') return data;
    return data.filter((f) => (f.country || '').trim() === selectedCountry);
  }, [data, selectedCountry]);

  const stats = useMemo(() => {
    const total = filteredData.length;
    const safeTotal = total || 1;
    const approved = filteredData.filter(f => f.status === 'Approved').length;
    const pending = filteredData.filter(f => f.status === 'Pending').length;
    const rejected = filteredData.filter(f => f.status === 'Rejected').length;
    const male = filteredData.filter(f => f.gender === 'Male').length;
    const female = filteredData.filter(f => f.gender === 'Female').length;
    const avgFarmSize = total ? filteredData.reduce((sum, f) => sum + f.farmSize, 0) / total : 0;

    return { total, safeTotal, approved, pending, rejected, male, female, avgFarmSize };
  }, [filteredData]);

  const targetInterviews = 5000;

  const interviewerStats = useMemo(() => generateInterviewerStats(filteredData), [filteredData]);
  const submissionQuality = useMemo(() => generateSubmissionQuality(filteredData), [filteredData]);

  const subTabs = [
    { id: 'qc' as const, label: 'QC', icon: ClipboardCheck },
    { id: 'insights' as const, label: 'Insights', icon: Lightbulb },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Sub-tabs + Country Filter */}
      <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-2 flex-wrap">
        <div className="flex gap-2">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm md:text-[0.95rem] font-medium rounded-t-lg transition-all ${
                activeSubTab === tab.id
                  ? 'bg-emerald-500/15 text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-foreground/70 hover:text-foreground hover:bg-muted/70'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* 🔹 Country Filter */}
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
          {/* Single KPI Card for QC */}
          <div className="minimal-card flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              QC KPIs
            </p>
            <p className="text-sm text-foreground flex flex-wrap gap-x-2 gap-y-1">
              <span>
                <span className="font-semibold">Total Farmers:</span>{' '}
                {stats.total.toLocaleString()}
              </span>
              <span>|</span>
              <span>
                <span className="font-semibold">Approved:</span>{' '}
                {stats.approved.toLocaleString()}
              </span>
              <span>|</span>
              <span>
                <span className="font-semibold">Pending:</span>{' '}
                {stats.pending.toLocaleString()}
              </span>
              <span>|</span>
              <span>
                <span className="font-semibold">Rejected:</span>{' '}
                {stats.rejected.toLocaleString()}
              </span>
              <span>|</span>
              <span>
                <span className="font-semibold">Avg Farm Size:</span>{' '}
                {stats.avgFarmSize.toFixed(1)} Ha
              </span>
              <span>|</span>
              <span>
                <span className="font-semibold">Approval Rate:</span>{' '}
                {stats.safeTotal
                  ? `${((stats.approved / stats.safeTotal) * 100).toFixed(1)}%`
                  : '0%'}
              </span>
            </p>
          </div>

          <ProgressPanels
            achieved={stats.total}
            target={targetInterviews}
            genderData={[
              { label: 'Male', value: stats.male, color: '#3b82f6' },
              { label: 'Female', value: stats.female, color: '#ec4899' },
            ]}
            accentColor="#22c55e"
            remainderColor="#6b7280"
          />

          {/* Productivity Rankings */}
          <ProductivityRankings data={interviewerStats} variant="farmer" />

          {/* Submission Quality & Error Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SubmissionQualityChart data={submissionQuality} variant="farmer" />
            <ErrorBreakdown data={errorBreakdownData.farmer} variant="farmer" />
          </div>
        </>
      ) : (
        <FarmerInsights data={filteredData} />
      )}
    </div>
  );
}
