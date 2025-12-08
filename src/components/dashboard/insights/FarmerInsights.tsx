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
  const [climateOpen, setClimateOpen] = useState(true);

  const totalFarmers = data.length;

  const avgFarmSize = useMemo(() => {
    if (!data.length) return 0;
    return data.reduce((s, f) => s + (f.farmSize || 0), 0) / data.length;
  }, [data]);

  const topCrop = useMemo(() => {
    const primaryCrops = data.map((f) => f.cropsCultivated?.[0] || f.cropType || 'N/A');
    const m = mode(primaryCrops);
    return m || 'N/A';
  }, [data]);

  const femaleShare = useMemo(() => {
    if (!data.length) return 0;
    const female = data.filter((f) => f.gender === 'Female').length;
    return (female / data.length) * 100;
  }, [data]);

  const youthShare = useMemo(() => {
    if (!data.length) return 0;
    const youthCount = data.filter((f) => {
      const classification = (f.youthInWork || '').toLowerCase();
      return classification && classification !== 'non-youth';
    }).length;
    return (youthCount / data.length) * 100;
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
    {
      title: '% Youth (in work)',
      value: `${youthShare.toFixed(1)}%`,
    },
  ];

  // 🔹 Crops cultivated (count of farmers by crop)
  const cropsCultivated = useMemo(
    () => {
      const map = new Map<string, number>();
      data.forEach((f) => {
        const crops = f.cropsCultivated?.length ? f.cropsCultivated : [f.cropType || 'N/A'];
        crops.forEach((crop) => {
          const cleanCrop = (crop || 'N/A').trim() || 'N/A';
          map.set(cleanCrop, (map.get(cleanCrop) || 0) + 1);
        });
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

  // 🔹 Rainfall perception (e28)
  const rainfallPerception = useMemo(
    () => {
      const map = new Map<string, number>();
      data.forEach((f) => {
        if (f.rainfallAmount) {
          map.set(f.rainfallAmount, (map.get(f.rainfallAmount) || 0) + 1);
        }
      });
      return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
    },
    [data]
  );

  // 🔹 Rainfall spread (e32)
  const rainfallSpread = useMemo(
    () => {
      const map = new Map<string, number>();
      data.forEach((f) => {
        if (f.rainfallSpread) {
          map.set(f.rainfallSpread, (map.get(f.rainfallSpread) || 0) + 1);
        }
      });
      return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
    },
    [data]
  );

  // 🔹 Shock exposure
  const shockExposure = useMemo(
    () => {
      let heavySevere = 0;
      let heavyMild = 0;
      let drySpellYes = 0;

      data.forEach((f) => {
        if (f.heavyRainDamage === 'Severe') heavySevere++;
        if (f.heavyRainDamage === 'Mild') heavyMild++;
        if (f.drySpell) drySpellYes++;
      });

      return [
        { type: 'Heavy rain – severe damage', value: heavySevere },
        { type: 'Heavy rain – mild damage', value: heavyMild },
        { type: 'Dry spell after germination', value: drySpellYes },
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
                    tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Bar
                    dataKey="households"
                    radius={[4, 4, 0, 0]}
                    fill="hsl(var(--primary))"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Farm Size Distribution"
              subtitle="Number of farmers by farm size class"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={farmSizeDist}>
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
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
                    tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Yield (kg)"
                    tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Scatter data={scatterFarmYield} fill="hsl(var(--primary))" />
                </ScatterChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Climate & Shocks */}
      <Collapsible open={climateOpen} onOpenChange={setClimateOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
          <span>Climate & Shocks</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              climateOpen ? 'rotate-180' : ''
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid md:grid-cols-2 gap-4">
            <ChartCard title="Rainfall Perception" subtitle="Distribution of rainfall amount vs average">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rainfallPerception}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }}
                    angle={-35}
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
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Rainfall Spread" subtitle="How rainfall was distributed through the season">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rainfallSpread}>
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Shock Exposure" subtitle="Weather-related shocks reported">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shockExposure}>
                  <XAxis
                    dataKey="type"
                    tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }}
                    angle={-20}
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
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
                </BarChart>
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
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Region Distribution" subtitle="Farmers by region">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionDist}>
                  <XAxis
                    dataKey="region"
                    tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
