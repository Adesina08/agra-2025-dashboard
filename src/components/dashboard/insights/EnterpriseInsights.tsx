import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChevronDown } from 'lucide-react';
import { ChartCard } from './ChartCard';
import { InsightsKpiRow } from './InsightsKpiRow';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { EnterpriseData } from '@/data/mockData';

const COLORS = ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'];
const ENTERPRISE_PRIMARY = 'hsl(var(--enterprise-primary))';
const ENTERPRISE_SECONDARY = 'hsl(var(--enterprise-secondary))';

interface EnterpriseInsightsProps {
  data: EnterpriseData[];
}

export function EnterpriseInsights({ data }: EnterpriseInsightsProps) {
  const [profileOpen, setProfileOpen] = useState(true);
  const [digitalOpen, setDigitalOpen] = useState(true);
  const [marketOpen, setMarketOpen] = useState(true);

  const kpiData = useMemo(() => {
    const total = data.length;
    const approved = data.filter((d) => d.status === 'Approved').length;
    const avgEmployees = total
      ? data.reduce((sum, d) => sum + (d.employeesCount || 0), 0) / total
      : 0;
    const avgTurnover = total
      ? data.reduce((sum, d) => sum + (d.annualTurnover || 0), 0) / total
      : 0;

    return [
      { title: 'Total Enterprises', value: total },
      { title: 'Approval Rate', value: total ? `${((approved / total) * 100).toFixed(1)}%` : '0%' },
      { title: 'Avg Employees', value: avgEmployees.toFixed(1) },
      { title: 'Avg Turnover (USD)', value: avgTurnover.toFixed(0) },
    ];
  }, [data]);

  const sectorData = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((d) => {
      const sector = (d.sector || 'N/A').trim() || 'N/A';
      map.set(sector, (map.get(sector) || 0) + 1);
    });
    return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
  }, [data]);

  const genderData = useMemo(() => {
    const male = data.filter((d) => d.gender?.toLowerCase() === 'male').length;
    const female = data.filter((d) => d.gender?.toLowerCase() === 'female').length;
    const other = data.length - male - female;
    return [
      { label: 'Male', value: male },
      { label: 'Female', value: female },
      { label: 'Other / Unknown', value: other },
    ];
  }, [data]);

  const employeeDistribution = useMemo(() => {
    const bins: Record<string, number> = {
      '0-5': 0,
      '6-10': 0,
      '11-25': 0,
      '26+': 0,
    };

    data.forEach((d) => {
      const count = d.employeesCount || 0;
      if (count <= 5) bins['0-5']++;
      else if (count <= 10) bins['6-10']++;
      else if (count <= 25) bins['11-25']++;
      else bins['26+']++;
    });

    return Object.entries(bins).map(([label, value]) => ({ label, value }));
  }, [data]);

  const turnoverDistribution = useMemo(() => {
    const bins: Record<string, number> = {
      '<=10k': 0,
      '10k-50k': 0,
      '50k-100k': 0,
      '100k+': 0,
    };

    data.forEach((d) => {
      const turnover = d.annualTurnover || 0;
      if (turnover <= 10000) bins['<=10k']++;
      else if (turnover <= 50000) bins['10k-50k']++;
      else if (turnover <= 100000) bins['50k-100k']++;
      else bins['100k+']++;
    });

    return Object.entries(bins).map(([label, value]) => ({ label, value }));
  }, [data]);

  const regionDistribution = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((d) => {
      const region = (d.region || 'N/A').trim() || 'N/A';
      map.set(region, (map.get(region) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const statusBreakdown = useMemo(() => {
    const statuses: EnterpriseData['status'][] = ['Approved', 'Pending', 'Rejected'];
    return statuses.map((label) => ({ label, value: data.filter((d) => d.status === label).length }));
  }, [data]);

  return (
    <div className="space-y-6">
      <InsightsKpiRow kpis={kpiData} variant="enterprise" />

      {/* Enterprise Profile */}
      <Collapsible open={profileOpen} onOpenChange={setProfileOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors">
          <ChevronDown className={`w-4 h-4 transition-transform ${profileOpen ? '' : '-rotate-90'}`} />
          Enterprise Profile
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartCard title="Business Types" subtitle="Distribution by category">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 9, fill: 'hsl(var(--foreground))' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Bar dataKey="value" fill={ENTERPRISE_PRIMARY} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Gender of Owners">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                    nameKey="label"
                  >
                    {genderData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Digitalisation & Investment */}
      <Collapsible open={digitalOpen} onOpenChange={setDigitalOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors">
          <ChevronDown className={`w-4 h-4 transition-transform ${digitalOpen ? '' : '-rotate-90'}`} />
          Scale & Operations
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartCard title="Employee Size" subtitle="Distribution by workforce size">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employeeDistribution}>
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Bar dataKey="value" fill={ENTERPRISE_PRIMARY} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Annual Turnover" subtitle="Self-reported turnover bands">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={turnoverDistribution} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                  <YAxis dataKey="label" type="category" tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }} width={80} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Bar dataKey="value" fill={ENTERPRISE_SECONDARY} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Market & Growth */}
      <Collapsible open={marketOpen} onOpenChange={setMarketOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors">
          <ChevronDown className={`w-4 h-4 transition-transform ${marketOpen ? '' : '-rotate-90'}`} />
          Market & Growth
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartCard title="Region Distribution" subtitle="Enterprises by region">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionDistribution}>
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Bar dataKey="value" fill={ENTERPRISE_PRIMARY} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

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
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
