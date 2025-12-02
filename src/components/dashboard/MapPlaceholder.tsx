import { MapPin } from 'lucide-react';
import { useMemo } from 'react';

interface MapPlaceholderProps {
  data: { latitude: number; longitude: number; region: string; status: string }[];
  title: string;
  variant?: 'farmer' | 'enterprise' | 'youth';
}

export function MapPlaceholder({ data, title, variant = 'farmer' }: MapPlaceholderProps) {
  const colorMap = {
    farmer: { approved: '#22c55e', pending: '#eab308', rejected: '#ef4444' },
    enterprise: { approved: '#f59e0b', pending: '#fbbf24', rejected: '#ef4444' },
    youth: { approved: '#06b6d4', pending: '#22d3ee', rejected: '#ef4444' },
  };

  const regionCounts = useMemo(() => {
    const counts: Record<string, { approved: number; pending: number; rejected: number }> = {};
    data.forEach(item => {
      if (!counts[item.region]) {
        counts[item.region] = { approved: 0, pending: 0, rejected: 0 };
      }
      const status = item.status.toLowerCase() as 'approved' | 'pending' | 'rejected';
      counts[item.region][status]++;
    });
    return counts;
  }, [data]);

  const regions = Object.entries(regionCounts).map(([name, counts]) => ({
    name,
    total: counts.approved + counts.pending + counts.rejected,
    ...counts,
  })).sort((a, b) => b.total - a.total);

  return (
    <div className="glass-card p-6 h-full">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        {title}
      </h3>
      
      <div className="relative h-64 bg-secondary/30 rounded-lg overflow-hidden mb-4">
        {/* Simplified map visualization */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-3 gap-2 p-4 w-full max-w-sm">
            {regions.slice(0, 9).map((region, i) => (
              <div 
                key={region.name}
                className="relative aspect-square bg-secondary/50 rounded-lg flex flex-col items-center justify-center p-2 hover:bg-secondary/70 transition-colors cursor-pointer group"
                style={{
                  animationDelay: `${i * 100}ms`,
                }}
              >
                <div 
                  className="w-3 h-3 rounded-full mb-1 animate-pulse-slow"
                  style={{ 
                    backgroundColor: colorMap[variant].approved,
                    boxShadow: `0 0 10px ${colorMap[variant].approved}40`
                  }}
                />
                <span className="text-[10px] text-muted-foreground text-center truncate w-full">
                  {region.name}
                </span>
                <span className="text-xs font-semibold text-foreground">{region.total}</span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-popover border border-border rounded-lg p-2 text-xs whitespace-nowrap shadow-lg">
                    <p className="font-semibold text-foreground mb-1">{region.name}</p>
                    <p className="text-green-400">Approved: {region.approved}</p>
                    <p className="text-yellow-400">Pending: {region.pending}</p>
                    <p className="text-red-400">Rejected: {region.rejected}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Approved</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-muted-foreground">Pending</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-muted-foreground">Rejected</span>
        </div>
      </div>
    </div>
  );
}
