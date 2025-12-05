import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList } from 'recharts';
import { ChartCard } from './ChartCard';
import { InsightsKpiRow } from './InsightsKpiRow';
import { insightsData, calculateYouthKpis } from '@/data/insightsData';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

export function YouthInsights() {
  const data = insightsData.youth;
  const kpis = calculateYouthKpis(data);
  const [demographicsOpen, setDemographicsOpen] = useState(true);
  const [employmentOpen, setEmploymentOpen] = useState(true);
  const [programmeOpen, setProgrammeOpen] = useState(true);

  const kpiData = [
    { title: 'Total Youth', value: kpis.total, trend: { value: 8.2, isPositive: true } },
    { title: 'Engaged in Agriculture', value: `${kpis.engagedPercent}%` },
    { title: 'Avg Satisfaction', value: `${kpis.avgSatisfaction}/5` },
    { title: 'Completion Rate', value: `${kpis.completionRate}%`, trend: { value: 5.4, isPositive: true } },
  ];

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
                <BarChart data={data.byAgeGroup}>
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Gender Distribution">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.byGender}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                    nameKey="label"
                  >
                    {data.byGender.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Education Level">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.byEducation} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="label" type="category" tick={{ fontSize: 10 }} width={60} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="value" fill="#a78bfa" radius={[0, 4, 4, 0]} />
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
            <ChartCard title="Employment Type" subtitle="Current employment distribution">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.employmentType}>
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Interest in Agriculture" subtitle="Youth aspiration towards agriculture">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.interestInAgriculture}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                    nameKey="label"
                    label={({ label, percent }) => `${label}: ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                </PieChart>
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
            <ChartCard title="Participation Funnel" subtitle="Programme journey stages">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Funnel dataKey="value" data={data.programmeParticipationFunnel} isAnimationActive>
                    {data.programmeParticipationFunnel.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    <LabelList position="center" fill="#fff" stroke="none" dataKey="stage" fontSize={11} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Satisfaction Scores" subtitle="Programme satisfaction (1-5)">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.satisfactionScores}>
                  <XAxis dataKey="score" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
