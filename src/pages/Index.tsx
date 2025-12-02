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
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <Header />

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
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
                  isActive
                    ? cn('border-current', activeTabConfig[tab.id])
                    : 'text-muted-foreground hover:text-foreground border-transparent'
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
          {activeTab === 'farmer' && <FarmerTab />}
          {activeTab === 'enterprise' && <EnterpriseTab />}
          {activeTab === 'youth' && <YouthTab />}
        </div>
      </div>
    </div>
  );
};

export default Index;
