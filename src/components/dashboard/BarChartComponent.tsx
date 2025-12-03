import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: { name: string; value: number }[];
  title: string;
  color: string;
}

export function BarChartComponent({ data, title, color }: BarChartProps) {
  return (
    <div className="minimal-card">
      <h3 className="text-xs text-muted-foreground mb-3">{title}</h3>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 0 }}>
            <XAxis type="number" hide />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Bar dataKey="value" fill={color} radius={[0, 2, 2, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
