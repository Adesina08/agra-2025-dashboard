import { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, children, className = '' }: ChartCardProps) {
  return (
    <div className={`bg-card border border-border/50 rounded-lg p-4 ${className}`}>
      <div className="mb-4">
        <h4 className="text-sm font-medium text-foreground">{title}</h4>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div className="h-[200px]">
        {children}
      </div>
    </div>
  );
}
