import { Pie, PieChart, ResponsiveContainer, Cell } from 'recharts';

interface ProgressPanelsProps {
  achieved: number;
  target: number;
  genderData: { label: string; value: number; color: string }[];
  accentColor: string;
  remainderColor: string;
}

export function ProgressPanels({
  achieved,
  target,
  genderData,
  accentColor,
  remainderColor,
}: ProgressPanelsProps) {
  const remaining = Math.max(target - achieved, 0);
  const quotaData = [
    { name: 'Achieved', value: achieved, color: accentColor },
    { name: 'Remaining', value: remaining, color: remainderColor },
  ];

  const genderTotal = genderData.reduce((sum, item) => sum + item.value, 0) || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="minimal-card relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-16 bottom-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Quota Progress</h3>
            <p className="text-sm text-muted-foreground">
              Monitor how fieldwork is tracking against the planned target.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={quotaData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={72}
                    paddingAngle={1}
                    stroke="none"
                  >
                    {quotaData.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: accentColor }} />
                <span>Achieved</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: remainderColor }} />
                <span>Remaining</span>
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">
                  {achieved.toLocaleString()} / {target.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {(Math.min(achieved / target, 1) * 100).toFixed(1)}% of target interviews completed
                </p>
                <p className="text-sm text-muted-foreground">
                  Remaining: {remaining.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="minimal-card relative overflow-hidden bg-gradient-to-br from-pink-400/10 via-blue-500/5 to-background">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -left-8 top-6 h-28 w-28 rounded-full bg-pink-400/10 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Gender Distribution</h3>
            <p className="text-sm text-muted-foreground">
              Overview of respondent gender breakdown across all submissions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={35}
                    outerRadius={70}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {genderData.map((item) => (
                      <Cell key={item.label} fill={item.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {genderData.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {item.value.toLocaleString()} ({((item.value / genderTotal) * 100).toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
