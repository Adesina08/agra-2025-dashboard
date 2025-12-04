import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BarChartProps {
  data: { name: string; value: number }[];
  title: string;
  color: string;
  variant?: 'farmer' | 'enterprise' | 'youth';
}

export function BarChartComponent({ data, title, color }: BarChartProps) {
  return (
    <div className="minimal-card h-full">
      <h3 className="text-sm text-muted-foreground mb-4">{title}</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 12%)" horizontal={false} />
            <XAxis 
              type="number" 
              tick={{ fill: 'hsl(220 10% 50%)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fill: 'hsl(220 10% 50%)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(220 18% 7%)',
                border: '1px solid hsl(220 15% 12%)',
                borderRadius: '6px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [value.toLocaleString(), 'Count']}
            />
            <Bar dataKey="value" radius={[0, 3, 3, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={color} fillOpacity={0.9 - index * 0.08} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
