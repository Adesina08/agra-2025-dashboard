import { useState, useMemo } from 'react';
import { AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorType {
  errorType: string;
  relatedVariables: string;
  count: number;
}

interface ErrorBreakdownProps {
  data: ErrorType[];
  title?: string;
  variant?: 'farmer' | 'enterprise' | 'youth';
}

export function ErrorBreakdown({ 
  data, 
  title = "Error Breakdown",
  variant = 'farmer' 
}: ErrorBreakdownProps) {
  const [sortField, setSortField] = useState<'count' | 'errorType'>('count');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const totalCount = useMemo(() => data.reduce((sum, d) => sum + d.count, 0), [data]);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      if (sortField === 'count') {
        return (a.count - b.count) * multiplier;
      }
      return a.errorType.localeCompare(b.errorType) * multiplier;
    });
  }, [data, sortField, sortDirection]);

  const handleSort = (field: 'count' | 'errorType') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3 h-3 inline ml-1" />
      : <ArrowDown className="w-3 h-3 inline ml-1" />;
  };

  return (
    <div className="minimal-card">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className={cn('w-4 h-4', {
          'text-farmer': variant === 'farmer',
          'text-enterprise': variant === 'enterprise',
          'text-youth': variant === 'youth',
        })} />
        <div>
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Identify the most common data-quality flags
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th 
                className="text-left py-3 px-3 text-xs text-muted-foreground font-medium uppercase cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('errorType')}
              >
                Error Type
                <SortIcon field="errorType" />
              </th>
              <th className="text-left py-3 px-3 text-xs text-muted-foreground font-medium uppercase">
                Related Variables
              </th>
              <th 
                className="text-right py-3 px-3 text-xs text-muted-foreground font-medium uppercase cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('count')}
              >
                Count
                <SortIcon field="count" />
              </th>
              <th className="text-right py-3 px-3 text-xs text-muted-foreground font-medium uppercase">
                Percentage
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => {
              const percentage = ((row.count / totalCount) * 100).toFixed(1);
              return (
                <tr 
                  key={row.errorType} 
                  className={cn(
                    'border-b border-border/50 hover:bg-muted/20 transition-colors',
                    index === 0 && 'bg-red-500/5'
                  )}
                >
                  <td className="py-3 px-3 font-medium text-foreground uppercase text-xs tracking-wide">
                    {row.errorType}
                  </td>
                  <td className="py-3 px-3 text-primary text-xs">
                    {row.relatedVariables}
                  </td>
                  <td className="py-3 px-3 text-right text-red-400 font-medium">
                    {row.count.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right text-muted-foreground">
                    {percentage}%
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-muted/20">
              <td className="py-3 px-3 font-medium text-foreground text-xs">Totals</td>
              <td className="py-3 px-3"></td>
              <td className="py-3 px-3 text-right text-primary font-semibold">
                {totalCount.toLocaleString()}
              </td>
              <td className="py-3 px-3 text-right text-foreground font-medium">
                100.0%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
