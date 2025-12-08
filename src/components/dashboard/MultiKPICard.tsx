import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricItem {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  helperText?: string;
}

interface MultiKPICardProps {
  title: string;
  metrics: MetricItem[];
  variant?: 'farmer' | 'enterprise' | 'youth';
}

export function MultiKPICard({ title, metrics, variant = 'farmer' }: MultiKPICardProps) {
  const iconColors = {
    farmer: 'text-farmer',
    enterprise: 'text-enterprise',
    youth: 'text-youth',
  } as const;

  return (
    <div className={cn('kpi-card', variant, 'space-y-4')}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">QC KPIs</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const value =
            typeof metric.value === 'number'
              ? metric.value.toLocaleString()
              : metric.value;

          return (
            <div key={`${metric.label}-${index}`} className="flex items-center gap-2">
              {Icon && <Icon className={cn('w-4 h-4', iconColors[variant])} />}
              <div className="leading-tight">
                <p className="text-base font-semibold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">
                  {metric.label}
                  {metric.helperText ? ` (${metric.helperText})` : ''}
                </p>
              </div>
              {index < metrics.length - 1 && (
                <span className="px-1 text-muted-foreground/70">|</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
