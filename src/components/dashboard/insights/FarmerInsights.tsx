import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { ChartCard } from './ChartCard';
import { InsightsKpiRow } from './InsightsKpiRow';
import { insightsData, calculateFarmerKpis } from '@/data/insightsData';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function FarmerInsights() {
  const data = insightsData.farmers;
  const kpis = calculateFarmerKpis(data);
  const [cropOpen, setCropOpen] = useState(true);
  const [climateOpen, setClimateOpen] = useState(true);

  const kpiData = [
    { title: 'Total Households', value: kpis.totalHouseholds.toLocaleString(), trend: { value: 6.8, isPositive: true } },
    { title: 'Practice Adoption', value: `${kpis.avgPracticeAdoption}%` },
    { title: 'Top Crop', value: kpis.topCrop },
    { title: 'Shock Exposure', value: `${kpis.shockExposureRate}%`, trend: { value: 3.2, isPositive: false } },
  ];

  return (
    <div className="space-y-6">
      <InsightsKpiRow kpis={kpiData} variant="farmer" />

      {/* Crop & Practice Adoption */}
      <Collapsible open={cropOpen} onOpenChange={setCropOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors">
          <ChevronDown className={`w-4 h-4 transition-transform ${cropOpen ? '' : '-rotate-90'}`} />
          Crop & Practice Adoption
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ChartCard title="Crops Cultivated" subtitle="Households by crop type">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.cropsCultivated.slice(0, 6)}>
                  <XAxis dataKey="crop" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="households" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Practice Adoption" subtitle="Adoption rate by practice">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.practicesAdoption} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <YAxis dataKey="practice" type="category" tick={{ fontSize: 9 }} width={80} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} formatter={(value) => `${value}%`} />
                  <Bar dataKey="adoptionRate" fill="#4ade80" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Land Size vs Crops" subtitle="Diversification by farm size">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <XAxis dataKey="landSize" name="Land Size (Ha)" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="cropCount" name="Crop Count" tick={{ fontSize: 11 }} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Scatter data={data.landSizeVsCrops} fill="#22c55e" />
                </ScatterChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Climate & Resilience */}
      <Collapsible open={climateOpen} onOpenChange={setClimateOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors">
          <ChevronDown className={`w-4 h-4 transition-transform ${climateOpen ? '' : '-rotate-90'}`} />
          Climate & Resilience
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ChartCard title="Rainfall Start Month" subtitle="When rains typically begin">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.rainfallStartMonth}>
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="households" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Rainfall Perception" subtitle="Compared to normal">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.rainfallPerception}>
                  <XAxis dataKey="label" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="value" fill="#4ade80" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Shock Exposure" subtitle="Climate shocks experienced">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.shockExposure} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="type" type="category" tick={{ fontSize: 10 }} width={60} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
