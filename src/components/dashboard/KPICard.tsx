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
  const colorClasses = {
    farmer: 'text-farmer border-farmer/20 [&_.icon-bg]:bg-farmer/20 [&_.icon]:text-farmer',
    enterprise: 'text-enterprise border-enterprise/20 [&_.icon-bg]:bg-enterprise/20 [&_.icon]:text-enterprise',
    youth: 'text-youth border-youth/20 [&_.icon-bg]:bg-youth/20 [&_.icon]:text-youth',
  };

  return (
    <div className={cn(
      'kpi-card group cursor-default',
      variant,
      colorClasses[variant],
      className
    )}>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="icon-bg w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
            <Icon className="icon w-6 h-6" />
          </div>
          {trend && (
            <span className={cn(
              'text-sm font-medium px-2 py-1 rounded-full',
              trend.isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
        
        <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
        <p className="text-3xl font-bold text-foreground animate-count">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
