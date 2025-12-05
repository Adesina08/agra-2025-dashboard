import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  trend?: { value: number; isPositive: boolean };
  variant?: 'farmer' | 'enterprise' | 'youth';
}

function KpiCard({ title, value, trend, variant = 'farmer' }: KpiCardProps) {
  const variantColors = {
    farmer: 'border-l-emerald-500',
    enterprise: 'border-l-amber-500',
    youth: 'border-l-violet-500',
  };

  return (
    <div className={`bg-card border border-border/50 border-l-2 ${variantColors[variant]} rounded-lg p-4`}>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-semibold text-foreground mt-1">{value}</p>
      {trend && (
        <div className={`flex items-center gap-1 mt-1 text-xs ${trend.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
          {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
        </div>
      )}
    </div>
  );
}

interface InsightsKpiRowProps {
  kpis: Array<{
    title: string;
    value: string | number;
    trend?: { value: number; isPositive: boolean };
  }>;
  variant?: 'farmer' | 'enterprise' | 'youth';
}

export function InsightsKpiRow({ kpis, variant = 'farmer' }: InsightsKpiRowProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <KpiCard key={index} {...kpi} variant={variant} />
      ))}
    </div>
  );
}
