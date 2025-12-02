import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  variant?: 'farmer' | 'enterprise' | 'youth';
  className?: string;
}

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = 'farmer',
  className 
}: KPICardProps) {
  const iconColors = {
    farmer: 'text-farmer',
    enterprise: 'text-enterprise',
    youth: 'text-youth',
  };

  return (
    <div className={cn('kpi-card', variant, className)}>
      <div className="flex items-center justify-between mb-3">
        <Icon className={cn('w-5 h-5', iconColors[variant])} />
        {trend && (
          <span className={cn(
            'text-xs font-medium',
            trend.isPositive ? 'text-green-500' : 'text-red-500'
          )}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      
      <p className="text-2xl font-semibold text-foreground mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <h3 className="text-sm text-muted-foreground">{title}</h3>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
}
