import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChevronDown } from 'lucide-react';
import { ChartCard } from './ChartCard';
import { InsightsKpiRow } from './InsightsKpiRow';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { YouthData } from '@/data/mockData';

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];
const YOUTH_PRIMARY = 'hsl(var(--youth-primary))';
const YOUTH_SECONDARY = 'hsl(var(--youth-secondary))';

interface YouthInsightsProps {
  data: YouthData[];
}

export function YouthInsights({ data }: YouthInsightsProps) {
  const [demographicsOpen, setDemographicsOpen] = useState(true);
  const [employmentOpen, setEmploymentOpen] = useState(true);
  const [programmeOpen, setProgrammeOpen] = useState(true);

  const kpiData = useMemo(() => {
    const total = data.length;
    const approved = data.filter((d) => d.status === 'Approved').length;
    const youthDefined = data.filter((d) => d.isYouth).length;
    const avgAttitude = data.reduce((sum, d) => sum + (d.youthAttitudeScore || 0), 0) / (total || 1);

    return [
      { title: 'Total Youth', value: total },
      { title: 'Approval Rate', value: total ? `${((approved / total) * 100).toFixed(1)}%` : '0%' },
      { title: 'Youth Share', value: total ? `${((youthDefined / total) * 100).toFixed(1)}%` : '0%' },
      { title: 'Avg Attitude Score', value: avgAttitude ? avgAttitude.toFixed(1) : '0.0' },
    ];
  }, [data]);

  const ageDistribution = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((d) => {
      const age = (d.ageGroup || 'N/A').trim() || 'N/A';
      map.set(age, (map.get(age) || 0) + 1);
    });
    return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
  }, [data]);

  const genderDistribution = useMemo(() => {
    const male = data.filter((d) => d.gender?.toLowerCase() === 'male').length;
    const female = data.filter((d) => d.gender?.toLowerCase() === 'female').length;
    const other = data.length - male - female;
    return [
      { label: 'Male', value: male },
      { label: 'Female', value: female },
      { label: 'Other / Unknown', value: other },
    ];
  }, [data]);

  const youthInWorkDist = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((d) => {
      const value = (d.youthInWork || 'N/A').trim() || 'N/A';
      map.set(value, (map.get(value) || 0) + 1);
    });
    return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
  }, [data]);

  const attitudeDistribution = useMemo(() => {
    const bins: Record<string, number> = {
      '0-1.9': 0,
      '2-2.9': 0,
      '3-3.9': 0,
      '4-5': 0,
    };
    data.forEach((d) => {
      const score = d.youthAttitudeScore;
      if (score == null) return;
      if (score < 2) bins['0-1.9']++;
      else if (score < 3) bins['2-2.9']++;
      else if (score < 4) bins['3-3.9']++;
      else bins['4-5']++;
    });
    return Object.entries(bins).map(([label, value]) => ({ label, value }));
  }, [data]);

  const statusBreakdown = useMemo(() => {
    const statuses: YouthData['status'][] = ['Approved', 'Pending', 'Rejected'];
    return statuses.map((label) => ({ label, value: data.filter((d) => d.status === label).length }));
  }, [data]);

  const youthShareData = useMemo(() => {
    const youthCount = data.filter((d) => d.isYouth).length;
    const other = data.length - youthCount;
    return [
      { label: 'Youth', value: youthCount },
      { label: 'Other / Unknown', value: other },
    ];
  }, [data]);

  const regionDistribution = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((d) => {
      const region = (d.region || 'N/A').trim() || 'N/A';
      map.set(region, (map.get(region) || 0) + 1);
    });
    return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
  }, [data]);

  return (
    <div className="space-y-6">
      <InsightsKpiRow kpis={kpiData} variant="youth" />

      {/* Demographics & Education */}
      <Collapsible open={demographicsOpen} onOpenChange={setDemographicsOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors">
          <ChevronDown className={`w-4 h-4 transition-transform ${demographicsOpen ? '' : '-rotate-90'}`} />
          Demographics & Education
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ChartCard title="Age Distribution" subtitle="Youth by age group">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageDistribution}>
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Bar dataKey="value" fill={YOUTH_PRIMARY} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Gender Distribution">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                    nameKey="label"
                  >
                    {genderDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Region Distribution">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionDistribution} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                  <YAxis dataKey="label" type="category" tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }} width={80} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Bar dataKey="value" fill={YOUTH_SECONDARY} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Employment & Aspirations */}
      <Collapsible open={employmentOpen} onOpenChange={setEmploymentOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors">
          <ChevronDown className={`w-4 h-4 transition-transform ${employmentOpen ? '' : '-rotate-90'}`} />
          Employment & Aspirations
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartCard title="Youth in Work" subtitle="Classification of youth respondents">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={youthInWorkDist}>
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Bar dataKey="value" fill={YOUTH_PRIMARY} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Attitude Towards Agriculture" subtitle="Average attitude score buckets">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attitudeDistribution}>
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Bar dataKey="value" fill={YOUTH_SECONDARY} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Programme Participation */}
      <Collapsible open={programmeOpen} onOpenChange={setProgrammeOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors">
          <ChevronDown className={`w-4 h-4 transition-transform ${programmeOpen ? '' : '-rotate-90'}`} />
          Programme Participation & Satisfaction
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartCard title="QC Status" subtitle="Approval outcomes">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                    nameKey="label"
                  >
                    {statusBreakdown.map((_, index) => (
                      <Cell key={`cell-status-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Youth Share" subtitle="Respondents qualifying as youth">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={youthShareData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                    nameKey="label"
                  >
                    {youthShareData.map((_, index) => (
                      <Cell key={`cell-youth-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
