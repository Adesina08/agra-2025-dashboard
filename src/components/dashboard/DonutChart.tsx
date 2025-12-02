import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  title: string;
  variant?: 'farmer' | 'enterprise' | 'youth';
}

export function DonutChart({ data, title }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="minimal-card h-full">
      <h3 className="text-sm text-muted-foreground mb-4">{title}</h3>
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
                backgroundColor: 'hsl(220 18% 7%)',
                border: '1px solid hsl(220 15% 12%)',
                borderRadius: '6px',
                fontSize: '12px',
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
