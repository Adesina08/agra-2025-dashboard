import { useMemo, useState } from 'react';
import { Trophy, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InterviewerStats {
  name: string;
  totalInterviews: number;
  approved: number;
}

interface ProductivityRankingsProps {
  data: InterviewerStats[];
  title?: string;
  variant?: 'farmer' | 'enterprise' | 'youth';
}

export function ProductivityRankings({
  data,
  title = "Interviewer Productivity Rankings",
  variant = 'farmer'
}: ProductivityRankingsProps) {
  const variantColors = {
    farmer: 'text-farmer',
    enterprise: 'text-enterprise',
    youth: 'text-youth',
  };

  const [showLast10, setShowLast10] = useState(false);

  const rows = useMemo(() => {
    const base = [...data].sort((a, b) => b.approved - a.approved);
    return showLast10 ? base.slice(-10) : base.slice(0, 10);
  }, [data, showLast10]);

  const topPerformer = rows[0];
  const otherPerformers = rows.slice(1);
  const overallApproval = useMemo(() => {
    const totalApproved = data.reduce((sum, d) => sum + d.approved, 0);
    const totalInterviews = data.reduce((sum, d) => sum + d.totalInterviews, 0);
    return totalInterviews > 0 ? ((totalApproved / totalInterviews) * 100).toFixed(1) : '0';
  }, [data]);

  const topPerformerRate = topPerformer 
    ? ((topPerformer.approved / topPerformer.totalInterviews) * 100).toFixed(1) 
    : '0';

  const flagged = topPerformer ? topPerformer.totalInterviews - topPerformer.approved : 0;

  return (
    <div className="minimal-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Track interviewer performance and highlight key performers
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowLast10(false)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded transition-colors',
              showLast10
                ? 'text-muted-foreground hover:bg-muted'
                : 'bg-primary/20 text-primary'
            )}
          >
            Top 10
          </button>
          <button
            onClick={() => setShowLast10(true)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded transition-colors',
              showLast10
                ? 'bg-primary/20 text-primary'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            Last 10
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performer Panel */}
        {topPerformer && (
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Top Performer</span>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">
                Overall approval {overallApproval}%
              </span>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <Trophy className={cn('w-4 h-4', variantColors[variant])} />
              <span className="font-medium text-foreground">{topPerformer.name}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-background/50 rounded p-3 border border-border/30">
                <p className="text-xs text-muted-foreground uppercase mb-1">Total Interviews</p>
                <p className="text-xl font-semibold text-foreground">{topPerformer.totalInterviews}</p>
              </div>
              <div className="bg-background/50 rounded p-3 border border-border/30">
                <p className="text-xs text-muted-foreground uppercase mb-1">Approved</p>
                <p className="text-xl font-semibold text-green-400">{topPerformer.approved}</p>
              </div>
              <div className="bg-background/50 rounded p-3 border border-border/30">
                <p className="text-xs text-muted-foreground uppercase mb-1">Flagged</p>
                <p className="text-xl font-semibold text-orange-400">{flagged}</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Top performer approval rate</span>
                <span className={variantColors[variant]}>{topPerformerRate}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn('h-full rounded-full transition-all', {
                    'bg-farmer': variant === 'farmer',
                    'bg-enterprise': variant === 'enterprise',
                    'bg-youth': variant === 'youth',
                  })}
                  style={{ width: `${topPerformerRate}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Top 10 Interviewers List */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
            Top 10 Interviewers
          </p>
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {otherPerformers.map((interviewer, index) => {
              const approvalRate = ((interviewer.approved / interviewer.totalInterviews) * 100).toFixed(1);
              return (
                <div 
                  key={interviewer.name} 
                  className="flex items-center justify-between py-2 px-3 bg-muted/20 rounded border border-border/30 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                      {
                        'bg-farmer/20 text-farmer': variant === 'farmer',
                        'bg-enterprise/20 text-enterprise': variant === 'enterprise',
                        'bg-youth/20 text-youth': variant === 'youth',
                      }
                    )}>
                      #{index + 2}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{interviewer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {interviewer.approved} approved of {interviewer.totalInterviews} interviews
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-green-400">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-sm font-medium">{approvalRate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
