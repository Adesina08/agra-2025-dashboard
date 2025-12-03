interface ProgressPanelsProps {
  achieved: number;
  target: number;
  approvals: { label: string; value: number; color: string }[];
}

export function ProgressPanels({ achieved, target, approvals }: ProgressPanelsProps) {
  const percentage = Math.min((achieved / target) * 100, 100);
  const approvalTotal = approvals.reduce((sum, item) => sum + item.value, 0) || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="minimal-card">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-xs text-muted-foreground">Quota Progress</span>
          <span className="text-sm font-medium text-foreground">{percentage.toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {achieved.toLocaleString()} / {target.toLocaleString()}
        </p>
      </div>

      <div className="minimal-card">
        <span className="text-xs text-muted-foreground">Approval Status</span>
        <div className="flex gap-4 mt-3">
          {approvals.map((item) => (
            <div key={item.label} className="flex-1">
              <p className="text-lg font-semibold text-foreground">{item.value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
