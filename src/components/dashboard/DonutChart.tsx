import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { getChartHeaderClasses } from './chartStyles';

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  title: string;
  variant?: 'farmer' | 'enterprise' | 'youth';
}

export function DonutChart({ data, title, variant = 'farmer' }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="minimal-card h-full">
      <div className={cn('rounded-lg px-4 py-3 mb-4 shadow-sm', getChartHeaderClasses(variant))}>
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '10px',
                fontSize: '12px',
                color: 'hsl(var(--foreground))',
              }}
              formatter={(value: number) => [
                `${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%)`,
                ''
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 mt-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground">{item.name}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-border">
        <span className="text-lg font-semibold text-foreground">{total.toLocaleString()}</span>
        <span className="text-xs text-muted-foreground ml-2">total</span>
      </div>
    </div>
  );
}
