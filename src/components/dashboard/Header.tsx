import { RefreshCw } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FarmerData, EnterpriseData, YouthData } from '@/data/mockData';

type SurveyState<T> = {
  data: T[];
  isLive: boolean;
};

interface HeaderProps {
  farmer: SurveyState<FarmerData>;
  enterprise: SurveyState<EnterpriseData>;
  youth: SurveyState<YouthData>;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function Header({ farmer, enterprise, youth, onRefresh, isRefreshing }: HeaderProps) {
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

        <div className="flex items-center gap-3 lg:gap-4">
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm font-medium transition-all hover:-translate-y-0.5 hover:bg-secondary"
            title="Refresh live data"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <ThemeToggle />
        </div>
      </div>

      {(!farmer.isLive || !enterprise.isLive || !youth.isLive) && (
        <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-200 text-sm">
          Live Google Sheet data is not fully available. Dashboard metrics will remain at zero until valid sheet data loads.
        </div>
      )}
    </header>
  );
}
