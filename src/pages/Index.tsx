import { useState } from 'react';
import { Sprout, Building2, GraduationCap } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { FarmerTab } from '@/components/dashboard/tabs/FarmerTab';
import { EnterpriseTab } from '@/components/dashboard/tabs/EnterpriseTab';
import { YouthTab } from '@/components/dashboard/tabs/YouthTab';
import { cn } from '@/lib/utils';

type TabType = 'farmer' | 'enterprise' | 'youth';

const tabs = [
  { id: 'farmer' as const, label: 'Farmer', icon: Sprout, color: 'farmer' },
  { id: 'enterprise' as const, label: 'Enterprise', icon: Building2, color: 'enterprise' },
  { id: 'youth' as const, label: 'Youth', icon: GraduationCap, color: 'youth' },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('farmer');

  const activeTabConfig = {
    farmer: 'border-farmer text-farmer',
    enterprise: 'border-enterprise text-enterprise',
    youth: 'border-youth text-youth',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background grid pattern */}
      <div className="fixed inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-[0.02] pointer-events-none" />
      
      <div className="relative max-w-[1600px] mx-auto px-4 py-6">
        <Header />

        {/* Tab Navigation */}
        <div className="glass-card p-2 mb-6">
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-300',
                    isActive
                      ? cn('bg-secondary border-b-2', activeTabConfig[tab.id])
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  )}
                >
                  <Icon className={cn('w-5 h-5', isActive && activeTabConfig[tab.id])} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="pb-12">
          {activeTab === 'farmer' && <FarmerTab />}
          {activeTab === 'enterprise' && <EnterpriseTab />}
          {activeTab === 'youth' && <YouthTab />}
        </div>
      </div>
    </div>
  );
};

export default Index;
