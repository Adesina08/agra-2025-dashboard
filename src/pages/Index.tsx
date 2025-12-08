import { useState } from 'react';
import { Sprout, Building2, GraduationCap } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { FarmerTab } from '@/components/dashboard/tabs/FarmerTab';
import { EnterpriseTab } from '@/components/dashboard/tabs/EnterpriseTab';
import { YouthTab } from '@/components/dashboard/tabs/YouthTab';
import { ExportBar } from '@/components/dashboard/ExportBar';
import { cn } from '@/lib/utils';
import { useSurveySheet } from '@/hooks/useSurveySheet';
import { FarmerData, EnterpriseData, YouthData } from '@/data/mockData';
import type { Segment } from '@/lib/exportAgraDashboard';

type TabType = 'farmer' | 'enterprise' | 'youth';

const tabs = [
  { id: 'farmer' as const, label: 'Farmer', icon: Sprout, color: 'farmer' },
  { id: 'enterprise' as const, label: 'Enterprise', icon: Building2, color: 'enterprise' },
  { id: 'youth' as const, label: 'Youth', icon: GraduationCap, color: 'youth' },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('farmer');

  const farmerQuery = useSurveySheet<FarmerData>('farmer');
  const enterpriseQuery = useSurveySheet<EnterpriseData>('enterprise');
  const youthQuery = useSurveySheet<YouthData>('youth');

  const activeRawRows =
    activeTab === 'farmer'
      ? farmerQuery.raw ?? []
      : activeTab === 'enterprise'
        ? enterpriseQuery.raw ?? []
        : youthQuery.raw ?? [];

  const activeTabConfig = {
    farmer: 'border-farmer text-farmer',
    enterprise: 'border-enterprise text-enterprise',
    youth: 'border-youth text-youth',
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-[1400px] mx-auto px-6 py-8 flex-1 w-full">
        <Header
          farmer={{ data: farmerQuery.data, isLive: farmerQuery.isLive, refreshedAt: farmerQuery.refreshedAt }}
          enterprise={{ data: enterpriseQuery.data, isLive: enterpriseQuery.isLive, refreshedAt: enterpriseQuery.refreshedAt }}
          youth={{ data: youthQuery.data, isLive: youthQuery.isLive, refreshedAt: youthQuery.refreshedAt }}
        />

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 border-b border-border">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 rounded-t-lg px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px hover:-translate-y-0.5',
                  isActive
                    ? cn('border-current', activeTabConfig[tab.id])
                    : 'text-muted-foreground hover:text-foreground border-transparent hover:border-border'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="pb-8">
          {activeTab === 'farmer' && (
            <FarmerTab />
          )}
          {activeTab === 'enterprise' && (
            <EnterpriseTab />
          )}
          {activeTab === 'youth' && (
            <YouthTab />
          )}
        </div>
      </div>

      {/* Export bar – uses active tab & raw sheet rows */}
      <ExportBar rows={activeRawRows} segment={activeTab as Segment} />

      <footer className="border-t border-border/60 bg-card/80 backdrop-blur px-6 py-4 text-center text-sm text-muted-foreground">
        © Inicio Tech 2025
      </footer>
    </div>
  );
};

export default Index;
