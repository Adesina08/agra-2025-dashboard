import { useState, useMemo } from 'react';
import { Users, TrendingUp, CheckCircle, Clock, XCircle, Wheat, ClipboardCheck, Lightbulb } from 'lucide-react';
import { FarmerData, generateInterviewerStats, generateSubmissionQuality, errorBreakdownData } from '@/data/mockData';
import { KPICard } from '../KPICard';
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
      <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-2 flex-wrap">
        <div className="flex gap-2">
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

        {/* 🔹 Country Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Country</span>
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-[180px] h-9 text-sm">
              <SelectValue placeholder="All countries" />
            </SelectTrigger>
            <SelectContent>
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
              subtitle={`${((stats.approved / stats.safeTotal) * 100).toFixed(1)}%`}
              icon={CheckCircle}
              variant="farmer"
            />
            <KPICard
              title="Pending"
              value={stats.pending}
              subtitle={`${((stats.pending / stats.safeTotal) * 100).toFixed(1)}%`}
              icon={Clock}
              variant="farmer"
            />
            <KPICard
              title="Rejected"
              value={stats.rejected}
              subtitle={`${((stats.rejected / stats.safeTotal) * 100).toFixed(1)}%`}
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
              value={`${((stats.approved / stats.safeTotal) * 100).toFixed(0)}%`}
              icon={TrendingUp}
              variant="farmer"
              trend={{ value: 3.2, isPositive: true }}
            />
          </div>

          <ProgressPanels
            achieved={stats.total}
            target={targetInterviews}
            genderData={[
              { label: 'Male', value: stats.male, color: '#3b82f6' },
              { label: 'Female', value: stats.female, color: '#ec4899' },
            ]}
            accentColor="#3b82f6"
            remainderColor="#0ea5e9"
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
