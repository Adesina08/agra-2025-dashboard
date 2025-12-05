import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ChartCard } from './ChartCard';
import { InsightsKpiRow } from './InsightsKpiRow';
import { insightsData, calculateEnterpriseKpis } from '@/data/insightsData';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const COLORS = ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'];

export function EnterpriseInsights() {
  const data = insightsData.enterprises;
  const kpis = calculateEnterpriseKpis(data);
  const [profileOpen, setProfileOpen] = useState(true);
  const [digitalOpen, setDigitalOpen] = useState(true);
  const [marketOpen, setMarketOpen] = useState(true);

  const kpiData = [
    { title: 'Total Enterprises', value: kpis.total, trend: { value: 12.3, isPositive: true } },
    { title: 'Fully Operational', value: `${kpis.operationalPercent}%` },
    { title: 'Digital Adoption', value: `${kpis.digitalAdoptionPercent}%`, trend: { value: 18.5, isPositive: true } },
    { title: 'Avg Investments', value: kpis.avgInvestments },
  ];

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
                <BarChart data={data.byBusinessType}>
                  <XAxis dataKey="label" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Operational Status">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.operationalStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                    nameKey="label"
                  >
                    {data.operationalStatus.map((_, index) => (
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
          Digitalisation & Investment
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartCard title="Digital Adoption" subtitle="Level of digital tool usage">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.digitalAdoption}>
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Investments (Last 12 Months)" subtitle="Investment areas">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.investmentsLast12Months} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="label" type="category" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="value" fill="#fbbf24" radius={[0, 4, 4, 0]} />
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
            <ChartCard title="Main Market" subtitle="Primary market reach">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.mainMarket}>
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Establishment Trend" subtitle="New enterprises over years">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.establishmentByYear}>
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
