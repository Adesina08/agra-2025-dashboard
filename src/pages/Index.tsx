import { useState } from "react";
import { Sprout, Building2, GraduationCap } from "lucide-react";
import { Header } from "@/components/dashboard/Header";
import { FarmerTab } from "@/components/dashboard/tabs/FarmerTab";
import { EnterpriseTab } from "@/components/dashboard/tabs/EnterpriseTab";
import { YouthTab } from "@/components/dashboard/tabs/YouthTab";
import { cn } from "@/lib/utils";
import { useSurveySheet } from "@/hooks/useSurveySheet";
import { FarmerData, EnterpriseData, YouthData } from "@/data/mockData";
import { ExportBar } from "@/components/dashboard/ExportBar";
import type { Segment } from "@/lib/exportAgraDashboard";

type TabType = "farmer" | "enterprise" | "youth";

const tabs = [
  { id: "farmer" as const, label: "Farmer", icon: Sprout, color: "farmer" },
  { id: "enterprise" as const, label: "Enterprise", icon: Building2, color: "enterprise" },
  { id: "youth" as const, label: "Youth", icon: GraduationCap, color: "youth" },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>("farmer");

  const farmerQuery = useSurveySheet<FarmerData>("farmer");
  const enterpriseQuery = useSurveySheet<EnterpriseData>("enterprise");
  const youthQuery = useSurveySheet<YouthData>("youth");

  const activeRawRows =
    activeTab === "farmer"
      ? farmerQuery.raw ?? []
      : activeTab === "enterprise"
        ? enterpriseQuery.raw ?? []
        : youthQuery.raw ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex-1 w-full">
        <Header
          farmer={{
            data: farmerQuery.data,
            isLive: farmerQuery.isLive,
            refreshedAt: farmerQuery.refreshedAt,
          }}
          enterprise={{
            data: enterpriseQuery.data,
            isLive: enterpriseQuery.isLive,
            refreshedAt: enterpriseQuery.refreshedAt,
          }}
          youth={{
            data: youthQuery.data,
            isLive: youthQuery.isLive,
            refreshedAt: youthQuery.refreshedAt,
          }}
        />

        {/* Tabs */}
        <div className="mt-6">
          <div className="inline-flex rounded-lg border bg-card/60 p-1 shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/60",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="mt-6 pb-10 space-y-8">
          {activeTab === "farmer" && <FarmerTab />}
          {activeTab === "enterprise" && <EnterpriseTab />}
          {activeTab === "youth" && <YouthTab />}
        </div>
      </div>

      {/* Export bar (like survey-vigil) */}
      <ExportBar rows={activeRawRows} segment={activeTab as Segment} />

      <footer className="border-t border-border/60 bg-card/80 backdrop-blur px-6 py-4 text-center text-sm text-muted-foreground">
        © Inicio Tech 2025
      </footer>
    </div>
  );
};

export default Index;
