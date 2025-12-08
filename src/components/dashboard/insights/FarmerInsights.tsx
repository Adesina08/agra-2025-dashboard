import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';
import { ChartCard } from './ChartCard';
import { InsightsKpiRow } from './InsightsKpiRow';
import type { FarmerData } from '@/data/mockData';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface FarmerInsightsProps {
  data: FarmerData[];
}

function mode<T>(arr: T[]): T | null {
  const counts = new Map<T, number>();
  arr.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
  let best: T | null = null;
  let bestCount = 0;
  counts.forEach((c, v) => {
    if (c > bestCount) {
      bestCount = c;
      best = v;
    }
  });
  return best;
}

export function FarmerInsights({ data }: FarmerInsightsProps) {
  const [productionOpen, setProductionOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(true);

  const totalFarmers = data.length;

  const avgFarmSize = useMemo(() => {
    if (!data.length) return 0;
    return data.reduce((s, f) => s + (f.farmSize || 0), 0) / data.length;
  }, [data]);

  const topCrop = useMemo(() => {
    const m = mode(data.map((f) => f.cropType || 'N/A'));
    return m || 'N/A';
  }, [data]);

  const femaleShare = useMemo(() => {
    if (!data.length) return 0;
    const female = data.filter((f) => f.gender === 'Female').length;
    return (female / data.length) * 100;
  }, [data]);

  const kpiData = [
    {
      title: 'Total Farmers',
      value: totalFarmers.toLocaleString(),
      trend: undefined,
    },
    {
      title: 'Avg Farm Size (Ha)',
      value: avgFarmSize.toFixed(1),
    },
    {
      title: 'Top Crop',
      value: topCrop,
    },
    {
      title: '% Female Farmers',
      value: `${femaleShare.toFixed(1)}%`,
    },
  ];

  // 🔹 Crops cultivated (count of farmers by crop)
  const cropsCultivated = useMemo(
    () => {
      const map = new Map<string, number>();
      data.forEach((f) => {
        const crop = (f.cropType || 'N/A').trim() || 'N/A';
        map.set(crop, (map.get(crop) || 0) + 1);
      });
      return Array.from(map.entries())
        .map(([crop, households]) => ({ crop, households }))
        .sort((a, b) => b.households - a.households);
    },
    [data]
  );

  // 🔹 Farm size distribution (simple bins)
  const farmSizeDist = useMemo(
    () => {
      const bins = {
        '<1 Ha': 0,
        '1–2 Ha': 0,
        '2–5 Ha': 0,
        '5+ Ha': 0,
      };

      data.forEach((f) => {
        const s = f.farmSize || 0;
        if (s < 1) bins['<1 Ha']++;
        else if (s < 2) bins['1–2 Ha']++;
        else if (s < 5) bins['2–5 Ha']++;
        else bins['5+ Ha']++;
      });

      return Object.entries(bins).map(([label, value]) => ({ label, value }));
    },
    [data]
  );

  // 🔹 Gender distribution
  const genderDist = useMemo(
    () => {
      const male = data.filter((f) => f.gender === 'Male').length;
      const female = data.filter((f) => f.gender === 'Female').length;
      const other = data.length - male - female;
      return [
        { label: 'Male', value: male },
        { label: 'Female', value: female },
        { label: 'Other / Unknown', value: other },
      ];
    },
    [data]
  );

  // 🔹 Region distribution
  const regionDist = useMemo(
    () => {
      const map = new Map<string, number>();
      data.forEach((f) => {
        const r = (f.region || 'Unknown').trim() || 'Unknown';
        map.set(r, (map.get(r) || 0) + 1);
      });
      return Array.from(map.entries())
        .map(([region, value]) => ({ region, value }))
        .sort((a, b) => b.value - a.value);
    },
    [data]
  );

  // 🔹 Scatter: farm size vs yield
  const scatterFarmYield = useMemo(
    () =>
      data
        .filter((f) => f.farmSize && f.yieldEstimate)
        .map((f) => ({
          x: f.farmSize,
          y: f.yieldEstimate,
        })),
    [data]
  );

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <InsightsKpiRow kpis={kpiData} variant="farmer" />

      {/* Production & agronomy */}
      <Collapsible open={productionOpen} onOpenChange={setProductionOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
          <span>Production & Agronomy</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              productionOpen ? 'rotate-180' : ''
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid md:grid-cols-2 gap-4">
            <ChartCard
              title="Crops Cultivated"
              subtitle="Farmers by primary crop"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cropsCultivated.slice(0, 8)}>
                  <XAxis
                    dataKey="crop"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                    }}
                  />
                  <Bar dataKey="households" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Farm Size Distribution"
              subtitle="Number of farmers by farm size class"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={farmSizeDist}>
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Farm Size vs Yield"
              subtitle="Scatter of farm size and estimated yield"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Farm size (Ha)"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Yield (kg)"
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                    }}
                  />
                  <Scatter data={scatterFarmYield} />
                </ScatterChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Household profile */}
      <Collapsible open={profileOpen} onOpenChange={setProfileOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
          <span>Household Profile</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              profileOpen ? 'rotate-180' : ''
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid md:grid-cols-2 gap-4">
            <ChartCard
              title="Gender Distribution"
              subtitle="Farmers by gender"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={genderDist}>
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Region Distribution" subtitle="Farmers by region">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionDist}>
                  <XAxis
                    dataKey="region"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
