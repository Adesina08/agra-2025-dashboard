import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BarChartProps {
  data: { name: string; value: number }[];
  title: string;
  color: string;
  variant?: 'farmer' | 'enterprise' | 'youth';
}

export function BarChartComponent({ data, title, color, variant = 'farmer' }: BarChartProps) {
  return (
    <div className="glass-card p-6 h-full">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 16%)" horizontal={false} />
            <XAxis 
              type="number" 
              tick={{ fill: 'hsl(215 20% 55%)', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(222 30% 16%)' }}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fill: 'hsl(215 20% 55%)', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(222 30% 16%)' }}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(222 47% 10%)',
                border: '1px solid hsl(222 30% 20%)',
                borderRadius: '8px',
                color: 'hsl(210 40% 98%)',
              }}
              formatter={(value: number) => [value.toLocaleString(), 'Count']}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={color} fillOpacity={0.8 - index * 0.1} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
