import { useState } from 'react';
import { Sprout, Building2, GraduationCap } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { FarmerTab } from '@/components/dashboard/tabs/FarmerTab';
import { EnterpriseTab } from '@/components/dashboard/tabs/EnterpriseTab';
import { YouthTab } from '@/components/dashboard/tabs/YouthTab';
import { cn } from '@/lib/utils';
import { useSurveySheet } from '@/hooks/useSurveySheet';
import { FarmerData, EnterpriseData, YouthData } from '@/data/mockData';

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
        <div className="pb-12">
          {activeTab === 'farmer' && (
            <FarmerTab
              data={farmerQuery.data}
              rawRows={farmerQuery.raw}
              isLoading={farmerQuery.isLoading}
            />
          )}
          {activeTab === 'enterprise' && (
            <EnterpriseTab
              data={enterpriseQuery.data}
              rawRows={enterpriseQuery.raw}
              isLoading={enterpriseQuery.isLoading}
            />
          )}
          {activeTab === 'youth' && (
            <YouthTab
              data={youthQuery.data}
              rawRows={youthQuery.raw}
              isLoading={youthQuery.isLoading}
            />
          )}
        </div>
      </div>

      <footer className="border-t border-border/60 bg-card/80 backdrop-blur px-6 py-4 text-center text-sm text-muted-foreground">
        © Inicio Tech 2025
      </footer>
    </div>
  );
};

export default Index;
