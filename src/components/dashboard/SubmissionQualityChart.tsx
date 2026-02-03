import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { headerTone, tabToneActive, tabToneInactive, Variant } from './variantStyles';

interface InterviewerQuality {
  name: string;
  approved: number;
  notApproved: number;
  flagsByKpi?: Record<string, number>;
}

interface SubmissionQualityChartProps {
  data: InterviewerQuality[];
  title?: string;
  variant?: Variant;
  flagNames?: Record<string, string>;
}

const flagColumnsForVariant: Record<Variant, string[]> = {
  farmer: ['KPI006', 'KPI007', 'KPI008', 'KPI009'],
  enterprise: ['KPI006', 'KPI008', 'KPI007', 'KPI026', 'KPI027'],
  youth: ['KPI006', 'KPI008', 'KPI010'],
};

export function SubmissionQualityChart({
  data,
  title = 'Submission Quality Overview',
  variant = 'farmer',
  flagNames,
}: SubmissionQualityChartProps) {
  const [view, setView] = useState<'chart' | 'table'>('chart');

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => (b.approved + b.notApproved) - (a.approved + a.notApproved));
  }, [data]);

  const visibleChartRows = Math.min(sortedData.length || 1, 10);
  const chartViewportHeight = Math.max(visibleChartRows * 40, 320);
  const chartFullHeight = Math.max(sortedData.length * 40, chartViewportHeight);

  const visibleTableRows = Math.min(sortedData.length || 1, 10);
  const tableViewportHeight = Math.max(visibleTableRows * 44, 360);

  const flagColumns = useMemo(() => {
    const defaultCodes = flagColumnsForVariant[variant] ?? [];
    const foundCodes = Array.from(
      new Set(
        data.flatMap((row) =>
          Object.keys(row.flagsByKpi ?? {}).filter((code) => code && typeof code === 'string')
        )
      )
    );

    const orderedCodes = [
      ...defaultCodes,
      ...foundCodes.filter((code) => !defaultCodes.includes(code)),
    ];

    return orderedCodes.map((code) => ({ code, label: flagNames?.[code] ?? code }));
  }, [data, flagNames, variant]);

  const escapeCell = (value: string | number) =>
    String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const handleExport = () => {
    const headers = [
      'Interviewer',
      'Approved',
      'Not Approved',
      'Total',
      'Approval Rate',
      ...flagColumns.map((column) => column.label),
    ];

    const rows = sortedData.map((d) => [
      d.name,
      d.approved,
      d.notApproved,
      d.approved + d.notApproved,
      `${((d.approved / (d.approved + d.notApproved)) * 100).toFixed(1)}%`,
      ...flagColumns.map((column) => d.flagsByKpi?.[column.code] ?? 0),
    ]);

    const tableHtml = `
      <table>
        <thead>
          <tr>${headers.map((h) => `<th>${escapeCell(h)}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows
            .map((row) => `<tr>${row.map((cell) => `<td>${escapeCell(cell)}</td>`).join('')}</tr>`)
            .join('')}
        </tbody>
      </table>
    `;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submission_quality_${variant}.xls`;
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
    <div className="minimal-card h-full">
      <div
        className={cn(
          'flex items-center justify-between gap-3 mb-4 rounded-xl px-4 py-3 border text-sm',
          headerTone[variant]
        )}
      >
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide opacity-80">
            Submission quality – {variant.charAt(0).toUpperCase() + variant.slice(1)}
          </span>
          <span className="text-sm font-semibold">{title}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded-full bg-background/40 p-1 border border-border/40">
            {(['chart', 'table'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setView(mode)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-full border transition-colors',
                  view === mode ? tabToneActive[variant] : tabToneInactive
                )}
              >
                {mode === 'chart' ? 'Chart view' : 'Table view'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded bg-background/60 text-foreground hover:bg-background/40 transition-colors shadow-sm border border-border/60"
          >
            <Download className="w-3 h-3" />
            Export table
          </button>
        </div>
      </div>

      {view === 'chart' ? (
        <div>
          <p className="text-xs text-muted-foreground text-center mb-4">
            Submission status by interviewer
          </p>
          <div className="overflow-y-auto" style={{ maxHeight: chartViewportHeight }}>
            <div style={{ height: chartFullHeight, minHeight: 240 }}>
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
        <div className="overflow-auto">
          <div className="overflow-y-auto" style={{ maxHeight: tableViewportHeight }}>
            <table className="w-full text-sm min-w-[960px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-xs text-muted-foreground font-medium uppercase">Interviewer</th>
                  <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium uppercase">Approved</th>
                  <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium uppercase">Not Approved</th>
                  <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium uppercase">Total</th>
                  <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium uppercase">Rate</th>
                  {flagColumns.map((column) => (
                    <th
                      key={column.code}
                      className="text-right py-3 px-2 text-xs text-muted-foreground font-medium uppercase whitespace-nowrap"
                    >
                      {column.label}
                    </th>
                  ))}
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
                      {flagColumns.map((column) => (
                        <td key={column.code} className="py-3 px-2 text-right text-foreground whitespace-nowrap">
                          {row.flagsByKpi?.[column.code] ?? 0}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
