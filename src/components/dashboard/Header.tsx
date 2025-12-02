import { Clock, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { lastUpdated } from '@/data/mockData';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
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

        <div className="flex flex-col gap-3 text-sm text-muted-foreground lg:flex-row lg:items-center">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{currentTime.toLocaleTimeString()}</span>
          </div>

          <span className="text-border">|</span>

          <span className="font-mono">
            Synced {new Date(lastUpdated).toLocaleTimeString()}
          </span>

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
    </header>
  );
}
