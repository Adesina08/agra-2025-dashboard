import { MapPin } from 'lucide-react';
import { useMemo } from 'react';

interface MapPlaceholderProps {
  data: { latitude: number; longitude: number; region: string; status: string }[];
  title: string;
  variant?: 'farmer' | 'enterprise' | 'youth';
}

export function MapPlaceholder({ data, title, variant = 'farmer' }: MapPlaceholderProps) {
  const colorMap = {
    farmer: '#22c55e',
    enterprise: '#f59e0b',
    youth: '#06b6d4',
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
    <div className="minimal-card h-full">
      <h3 className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        {title}
      </h3>
      
      <div className="space-y-2">
        {regions.slice(0, 6).map((region) => (
          <div key={region.name} className="flex items-center justify-between py-1.5">
            <span className="text-sm text-foreground">{region.name}</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">{region.approved}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                <span className="text-xs text-muted-foreground">{region.pending}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="text-xs text-muted-foreground">{region.rejected}</span>
              </div>
              <span className="text-sm font-medium text-foreground w-8 text-right">{region.total}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Approved
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          Pending
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Rejected
        </div>
      </div>
    </div>
  );
}
