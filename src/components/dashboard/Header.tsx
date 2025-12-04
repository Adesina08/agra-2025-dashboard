import { Clock, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { enterpriseData, farmerData, lastUpdated, youthData } from '@/data/mockData';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const latestSubmissionDate = useMemo(() => {
    const submissions = [...farmerData, ...enterpriseData, ...youthData];
    if (!submissions.length) return null;

    return submissions.reduce((latest, current) => {
      const currentDate = new Date(current.submissionDate);
      return currentDate > latest ? currentDate : latest;
    }, new Date(submissions[0].submissionDate));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return '—';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <header className="mb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            AGRA 2025 Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Quality Control Monitoring
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm text-muted-foreground lg:flex-row lg:items-center lg:gap-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{currentTime.toLocaleTimeString()}</span>
          </div>

          <div className="flex flex-1 flex-col gap-2 text-right sm:flex-row sm:justify-end sm:gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Last Refreshed</p>
              <p className="text-sm font-semibold text-foreground">{formatDateTime(new Date(lastUpdated))}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Latest Submission</p>
              <p className="text-sm font-semibold text-foreground">{formatDateTime(latestSubmissionDate)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="rounded p-1.5 transition-all hover:-translate-y-0.5 hover:bg-secondary"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
