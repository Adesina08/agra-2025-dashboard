import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface LineChartProps {
  data: { date: string; value: number }[];
  title: string;
  color: string;
}

export function LineChartComponent({ data, title, color }: LineChartProps) {
  return (
    <div className="glass-card p-6 h-full">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 20, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 16%)" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }}
              axisLine={{ stroke: 'hsl(222 30% 16%)' }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }}
              axisLine={{ stroke: 'hsl(222 30% 16%)' }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(222 47% 10%)',
                border: '1px solid hsl(222 30% 20%)',
                borderRadius: '8px',
                color: 'hsl(210 40% 98%)',
              }}
              formatter={(value: number) => [value.toLocaleString(), 'Submissions']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${color})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
