import { Clock, RefreshCw, Database } from 'lucide-react';
import { useEffect, useState } from 'react';
import { lastUpdated } from '@/data/mockData';

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
    <header className="glass-card px-6 py-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Database className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              AGRA 2025 QC Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Real-time Quality Control Monitoring System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Current Time:</span>
            <span className="font-mono text-foreground">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>

          <div className="h-8 w-px bg-border" />

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Last Sync:</span>
            <span className="font-mono text-primary">
              {new Date(lastUpdated).toLocaleString()}
            </span>
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 text-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
