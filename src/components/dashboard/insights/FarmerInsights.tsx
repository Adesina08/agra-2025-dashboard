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
  const [inputsOpen, setInputsOpen] = useState(true);
  const [marketsOpen, setMarketsOpen] = useState(false);
  const [youthOpen, setYouthOpen] = useState(false);

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
      if (typeof f.isYouth === 'boolean') return f.isYouth;
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

  // 🔹 Inputs & practices
  const practiceAdoption = useMemo(() => {
    const counts = new Map<string, number>();
    let farmersWithAny = 0;

    data.forEach((f) => {
      const set = new Set(f.practicesApplied || []);
      if (set.size > 0) farmersWithAny++;
      set.forEach((p) => counts.set(p, (counts.get(p) || 0) + 1));
    });

    return Array.from(counts.entries())
      .map(([practice, count]) => ({
        practice,
        adoptionRate: farmersWithAny ? (count / farmersWithAny) * 100 : 0,
      }))
      .sort((a, b) => b.adoptionRate - a.adoptionRate);
  }, [data]);

  const improvedSeedRate = useMemo(() => {
    if (!data.length) return 0;
    const num = data.filter((f) => f.usesImprovedSeed).length;
    return (num / data.length) * 100;
  }, [data]);

  const fertilizerRate = useMemo(() => {
    if (!data.length) return 0;
    const num = data.filter((f) => f.usesFertilizer).length;
    return (num / data.length) * 100;
  }, [data]);

  // 🔹 Markets & finance
  const commercializationDist = useMemo(() => {
    const bins: Record<string, number> = {
      '0–10%': 0,
      '10–30%': 0,
      '30–50%': 0,
      '50–80%': 0,
      '80–100%': 0,
    };

    data.forEach((f) => {
      const r = f.commercializationRate;
      if (r == null || Number.isNaN(r)) return;
      if (r <= 10) bins['0–10%']++;
      else if (r <= 30) bins['10–30%']++;
      else if (r <= 50) bins['30–50%']++;
      else if (r <= 80) bins['50–80%']++;
      else bins['80–100%']++;
    });

    return Object.entries(bins).map(([label, value]) => ({ label, value }));
  }, [data]);

  const financialInclusion = useMemo(() => {
    if (!data.length) return { accounts: 0, loans: 0, constrained: 0 };
    const accounts = data.filter((f) => f.hasFinancialAccount).length;
    const loans = data.filter((f) => f.hasAgLoan).length;
    const constrained = data.filter((f) => f.creditConstrained).length;
    return {
      accounts: (accounts / data.length) * 100,
      loans: (loans / data.length) * 100,
      constrained: (constrained / data.length) * 100,
    };
  }, [data]);

  // 🔹 Youth & employment
  const youthEmployment = useMemo(() => {
    const total = data.length || 1;
    const youth = data.filter((f) => (typeof f.isYouth === 'boolean' ? f.isYouth : false)).length;
    const youthWorkClass = new Map<string, number>();

    data.forEach((f) => {
      if (!f.youthInWork) return;
      youthWorkClass.set(f.youthInWork, (youthWorkClass.get(f.youthInWork) || 0) + 1);
    });

    return {
      youthShare: (youth / total) * 100,
      youthWorkClass: Array.from(youthWorkClass.entries()).map(([label, value]) => ({
        label,
        value: (value / total) * 100,
      })),
    };
  }, [data]);

  const attitudeDist = useMemo(() => {
    const buckets: Record<string, number> = {
      '1–2 (negative)': 0,
      '2–3': 0,
      '3–4': 0,
      '4–5 (positive)': 0,
    };

    data.forEach((f) => {
      if (!f.youthAttitudeScore) return;
      const s = f.youthAttitudeScore;
      if (s <= 2) buckets['1–2 (negative)']++;
      else if (s <= 3) buckets['2–3']++;
      else if (s <= 4) buckets['3–4']++;
      else buckets['4–5 (positive)']++;
    });

    return Object.entries(buckets).map(([label, value]) => ({ label, value }));
  }, [data]);

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

      {/* Inputs & Technology */}
      <Collapsible open={inputsOpen} onOpenChange={setInputsOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
          <span>Inputs &amp; Technology Adoption</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${inputsOpen ? 'rotate-180' : ''}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid md:grid-cols-2 gap-4">
            <ChartCard
              title="Practice adoption rates"
              subtitle="% of farmers applying each practice"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={practiceAdoption.slice(0, 8)}>
                  <XAxis
                    dataKey="practice"
                    tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                    tickFormatter={(v) => `${v.toFixed(0)}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                    }}
                    formatter={(value: any) => [`${(value as number).toFixed(1)}%`, 'Adoption']}
                  />
                  <Bar dataKey="adoptionRate" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Key input use"
              subtitle="Share of farmers using improved seed & fertilizer"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { label: 'Improved seed', value: improvedSeedRate },
                    { label: 'Fertilizer', value: fertilizerRate },
                  ]}
                >
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                    }}
                    formatter={(value: any) => [`${(value as number).toFixed(1)}%`, 'Farmers']}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Markets & Finance */}
      <Collapsible open={marketsOpen} onOpenChange={setMarketsOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
          <span>Markets &amp; Finance</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${marketsOpen ? 'rotate-180' : ''}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid md:grid-cols-2 gap-4">
            <ChartCard
              title="Commercialisation profile"
              subtitle="Farmers by share of production sold"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={commercializationDist}>
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
              title="Financial inclusion"
              subtitle="% of farmers with accounts, loans & constraints"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { label: 'Has account', value: financialInclusion.accounts },
                    { label: 'Has agricultural loan', value: financialInclusion.loans },
                    { label: 'Credit constrained', value: financialInclusion.constrained },
                  ]}
                >
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                    }}
                    formatter={(value: any) => [`${(value as number).toFixed(1)}%`, 'Share of farmers']}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
                </BarChart>
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

      {/* Youth & Employment */}
      <Collapsible open={youthOpen} onOpenChange={setYouthOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
          <span>Youth &amp; Employment in Agriculture</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${youthOpen ? 'rotate-180' : ''}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid md:grid-cols-2 gap-4">
            <ChartCard
              title="Youth participation"
              subtitle="Share of youth & employment classification"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { label: '% of respondents who are youth', value: youthEmployment.youthShare },
                    ...youthEmployment.youthWorkClass,
                  ]}
                >
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                    }}
                    formatter={(value: any) => [`${(value as number).toFixed(1)}%`, 'Share of farmers']}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Youth attitude towards agri work"
              subtitle="Distribution of attitude scores (1–5)"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attitudeDist}>
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
