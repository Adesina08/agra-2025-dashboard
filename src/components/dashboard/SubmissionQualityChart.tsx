import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InterviewerQuality {
  name: string;
  approved: number;
  notApproved: number;
}

interface SubmissionQualityChartProps {
  data: InterviewerQuality[];
  title?: string;
  variant?: 'farmer' | 'enterprise' | 'youth';
}

export function SubmissionQualityChart({
  data,
  title = "Submission Quality Overview",
  variant = 'farmer'
}: SubmissionQualityChartProps) {
  const [view, setView] = useState<'chart' | 'table'>('chart');

  const headerTone = {
    farmer: 'bg-farmer/10 border-farmer/30 text-farmer',
    enterprise: 'bg-enterprise/10 border-enterprise/30 text-enterprise',
    youth: 'bg-youth/10 border-youth/30 text-youth',
  };

  const sortedData = useMemo(() => {
    return [...data]
      .sort((a, b) => (b.approved + b.notApproved) - (a.approved + a.notApproved))
      .slice(0, 10);
  }, [data]);

  const handleExport = () => {
    const csvContent = [
      ['Interviewer', 'Approved', 'Not Approved', 'Total', 'Approval Rate'].join(','),
      ...sortedData.map(d => [
        d.name,
        d.approved,
        d.notApproved,
        d.approved + d.notApproved,
        ((d.approved / (d.approved + d.notApproved)) * 100).toFixed(1) + '%'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submission_quality_${variant}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const approved = payload.find((p: any) => p.dataKey === 'approved')?.value || 0;
      const notApproved = payload.find((p: any) => p.dataKey === 'notApproved')?.value || 0;
      return (
        <div className="bg-[hsl(var(--card))] text-foreground border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-2">{label}</p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded bg-green-500" />
              <span className="text-muted-foreground">Approved:</span>
              <span className="text-foreground font-medium">{approved}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded bg-red-500" />
              <span className="text-muted-foreground">Not Approved:</span>
              <span className="text-foreground font-medium">{notApproved}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="minimal-card">
      <div className={cn('flex items-center justify-between mb-4 rounded-lg px-4 py-3 border', headerTone[variant])}>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs opacity-80 mt-1">
            Monitor interviewer throughput and approvals
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded bg-background/80 text-foreground hover:bg-background/60 transition-colors shadow-sm"
        >
          <Download className="w-3 h-3" />
          Export table
        </button>
      </div>

      {/* Toggle */}
      <div className="flex mb-4 bg-muted/30 rounded-lg p-1 border border-border/50">
        <button
          onClick={() => setView('chart')}
          className={cn(
            'flex-1 py-2 text-xs font-medium rounded transition-all',
            view === 'chart' 
              ? 'bg-primary text-primary-foreground' 
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Chart
        </button>
        <button
          onClick={() => setView('table')}
          className={cn(
            'flex-1 py-2 text-xs font-medium rounded transition-all',
            view === 'table' 
              ? 'bg-primary text-primary-foreground' 
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Table
        </button>
      </div>

      {view === 'chart' ? (
        <div>
          <p className="text-xs text-muted-foreground text-center mb-4">
            Submission status by interviewer
          </p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={sortedData} 
                layout="vertical" 
                margin={{ left: 10, right: 20, top: 10, bottom: 10 }}
                barGap={0}
              >
                <XAxis
                  type="number"
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar
                  dataKey="approved"
                  stackId="a"
                  fill="hsl(var(--primary))"
                  radius={[0, 0, 0, 0]}
                  name="Approved"
                />
                <Bar
                  dataKey="notApproved"
                  stackId="a"
                  fill="hsl(var(--destructive))"
                  radius={[0, 4, 4, 0]}
                  name="Not Approved"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-muted-foreground">Approved</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-muted-foreground">Not Approved</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-xs text-muted-foreground font-medium uppercase">Interviewer</th>
                <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium uppercase">Approved</th>
                <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium uppercase">Not Approved</th>
                <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium uppercase">Total</th>
                <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium uppercase">Rate</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row) => {
                const total = row.approved + row.notApproved;
                const rate = ((row.approved / total) * 100).toFixed(1);
                return (
                  <tr key={row.name} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-2 text-foreground">{row.name}</td>
                    <td className="py-3 px-2 text-right text-green-400">{row.approved}</td>
                    <td className="py-3 px-2 text-right text-red-400">{row.notApproved}</td>
                    <td className="py-3 px-2 text-right text-foreground">{total}</td>
                    <td className="py-3 px-2 text-right text-foreground">{rate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
