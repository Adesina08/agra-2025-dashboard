import { useState, useMemo } from 'react';
import { Sprout, Building2, GraduationCap, Download, CheckCircle2, XCircle, TriangleAlert } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { FarmerTab } from '@/components/dashboard/tabs/FarmerTab';
import { EnterpriseTab } from '@/components/dashboard/tabs/EnterpriseTab';
import { YouthTab } from '@/components/dashboard/tabs/YouthTab';
import { cn } from '@/lib/utils';
import { useSurveySheet } from '@/hooks/useSurveySheet';
import { FarmerData, EnterpriseData, YouthData } from '@/data/mockData';
import { useFarmerQcData, useEnterpriseQcData, useYouthQcData } from '@/hooks/useSegmentQcData';
import type { UseSegmentQcDataResult } from '@/hooks/useSegmentQcData';
import { SheetRow } from '@/lib/googleSheets';
import { toast } from '@/components/ui/use-toast';

type TabType = 'farmer' | 'enterprise' | 'youth';

const tabs = [
  { id: 'youth' as const, label: 'Youth', icon: GraduationCap, color: 'youth' },
  { id: 'farmer' as const, label: 'Farmer', icon: Sprout, color: 'farmer' },
  { id: 'enterprise' as const, label: 'Enterprise', icon: Building2, color: 'enterprise' },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('youth');

  const farmerQuery = useSurveySheet<FarmerData>('farmer');
  const enterpriseQuery = useSurveySheet<EnterpriseData>('enterprise');
  const youthQuery = useSurveySheet<YouthData>('youth');

  const [isRefreshing, setIsRefreshing] = useState(false);

  const farmerQc = useFarmerQcData();
  const enterpriseQc = useEnterpriseQcData();
  const youthQc = useYouthQcData();

  const activeTabLabel = useMemo(() => tabs.find((tab) => tab.id === activeTab)?.label ?? 'Dashboard', [activeTab]);

  const activeSheetQuery = useMemo(() => {
    switch (activeTab) {
      case 'enterprise':
        return enterpriseQuery;
      case 'youth':
        return youthQuery;
      default:
        return farmerQuery;
    }
  }, [activeTab, enterpriseQuery, farmerQuery, youthQuery]);

  const activeQcData: UseSegmentQcDataResult = useMemo(() => {
    switch (activeTab) {
      case 'enterprise':
        return enterpriseQc;
      case 'youth':
        return youthQc;
      default:
        return farmerQc;
    }
  }, [activeTab, enterpriseQc, farmerQc, youthQc]);

  const activeSegmentKey = activeTab;
  const exportSheetRows = (activeSheetQuery.raw as SheetRow[]) ?? [];
  const exportNormalizedRows = (activeSheetQuery.data as SheetRow[]) ?? [];
  const isHeaderRefreshing =
    isRefreshing || farmerQuery.isFetching || enterpriseQuery.isFetching || youthQuery.isFetching;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        farmerQuery.refetch(),
        enterpriseQuery.refetch(),
        youthQuery.refetch(),
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to refresh data right now.';
      toast({
        title: 'Refresh failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const escapeHtml = (value: unknown) => {
    if (value === null || value === undefined) return '';
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    return stringValue
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  const downloadExcel = (filename: string, rows: Record<string, unknown>[]) => {
    if (!rows.length) {
      toast({
        title: 'No data available',
        description: `There is no ${activeTabLabel.toLowerCase()} data to export right now.`,
        variant: 'destructive',
      });
      return;
    }

    const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
    const body = rows
      .map(
        (row) =>
          `<tr>${headers.map((header) => `<td>${escapeHtml(row[header])}</td>`).join('')}</tr>`
      )
      .join('');

    const tableHtml = `
      <table>
        <thead>
          <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    `;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename.endsWith('.xls') ? filename : `${filename}.xls`;
    anchor.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Export started',
      description: `${anchor.download} is being downloaded.`,
    });
  };

  const exportAllRows = () => {
    downloadExcel(`${activeSegmentKey}_all_data.xls`, exportSheetRows);
  };

  const APPROVED_LABELS = [
    'approved',
    'clean',
    'qc approved',
    '1 - approved',
  ];

  const NOT_APPROVED_LABELS = [
    'not approved',
    'rejected',
    'failed',
    '2 - not approved',
  ];

  const normalizeStatus = (status: unknown) =>
    typeof status === 'string' ? status.trim().toLowerCase() : '';

  const isApprovedStatus = (status: unknown) => {
    const s = normalizeStatus(status);
    if (!s) return false;
    if (APPROVED_LABELS.includes(s)) return true;
    if (NOT_APPROVED_LABELS.includes(s)) return false;
    return s.includes('approved') && !s.includes('not');
  };

  const getApprovalStatusFromRow = (row: SheetRow, normalizedStatus?: string) => {
    const entries = Object.entries(row);
    const qcStatus = entries.find(([key]) => key.trim().toLowerCase() === 'qc approval status');
    if (qcStatus) return qcStatus[1];

    const approvalFallback = entries.find(([key]) => key.trim().toLowerCase().includes('approval'));
    if (approvalFallback) return approvalFallback[1];

    return normalizedStatus;
  };

  const filterRowsByApproval = (approved: boolean) =>
    exportSheetRows.filter((row, index) => {
      const status = getApprovalStatusFromRow(row, exportNormalizedRows[index]?.status);
      const isApproved = isApprovedStatus(status);
      return approved ? isApproved : !isApproved;
    });

  const exportApprovedRows = () => {
    const filtered = filterRowsByApproval(true);
    downloadExcel(`${activeSegmentKey}_approved_data.xls`, filtered);
  };

  const exportNotApprovedRows = () => {
    const filtered = filterRowsByApproval(false);
    downloadExcel(`${activeSegmentKey}_not_approved_data.xls`, filtered);
  };

  const exportErrorFlags = () => {
    if (!activeQcData.errorBreakdown?.length) {
      toast({
        title: 'No error flags found',
        description: `We could not find error flags for the ${activeTabLabel.toLowerCase()} dashboard.`,
        variant: 'destructive',
      });
      return;
    }

    const rows = activeQcData.errorBreakdown.map((item) => ({
      'KPI Code': item.kpiCode,
      'Flag Name': item.errorType,
      Type: item.type,
      Category: item.category,
      Count: item.count,
      '% of Interviews': `${(item.percentOfInterviews * 100).toFixed(2)}%`,
    }));

    downloadExcel(`${activeSegmentKey}_error_flags.xls`, rows);
  };

  const activeTabConfig = {
    farmer: 'border-farmer text-farmer',
    enterprise: 'border-enterprise text-enterprise',
    youth: 'border-youth text-youth',
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 flex-1 w-full">
        <Header
          farmer={{ data: farmerQuery.data, isLive: farmerQuery.isLive }}
          enterprise={{ data: enterpriseQuery.data, isLive: enterpriseQuery.isLive }}
          youth={{ data: youthQuery.data, isLive: youthQuery.isLive }}
          onRefresh={handleRefresh}
          isRefreshing={isHeaderRefreshing}
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
        <div className="pb-12 space-y-8">
          {activeTab === 'farmer' && <FarmerTab submissions={farmerQuery.data} />}
          {activeTab === 'enterprise' && <EnterpriseTab submissions={enterpriseQuery.data} />}
          {activeTab === 'youth' && <YouthTab submissions={youthQuery.data} />}

          <div className="minimal-card flex flex-col gap-4 border border-border/60">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Exports</p>
              <h2 className="text-lg font-semibold">{activeTabLabel} dashboard data</h2>
              <p className="text-sm text-muted-foreground">Download everything in the Google Sheet or target specific approval states and QC flags for the selected dashboard.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={exportAllRows}
                className="flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-3 text-sm font-semibold shadow-sm hover:opacity-95 transition"
                disabled={activeSheetQuery.isLoading}
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>

              <button
                onClick={exportApprovedRows}
                className="flex items-center justify-center gap-2 rounded-md border border-green-500/80 text-green-500 px-4 py-3 text-sm font-semibold hover:bg-green-500/10 transition disabled:opacity-60"
                disabled={activeSheetQuery.isLoading}
              >
                <CheckCircle2 className="w-4 h-4" />
                Export Approved Data
              </button>

              <button
                onClick={exportNotApprovedRows}
                className="flex items-center justify-center gap-2 rounded-md border border-destructive/80 text-destructive px-4 py-3 text-sm font-semibold hover:bg-destructive/10 transition disabled:opacity-60"
                disabled={activeSheetQuery.isLoading}
              >
                <XCircle className="w-4 h-4" />
                Export Not Approved Data
              </button>

              <button
                onClick={exportErrorFlags}
                className="flex items-center justify-center gap-2 rounded-md border border-amber-400/80 text-amber-400 px-4 py-3 text-sm font-semibold hover:bg-amber-400/10 transition disabled:opacity-60"
                disabled={activeQcData.loading}
              >
                <TriangleAlert className="w-4 h-4" />
                Export Error Flags
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-border/60 bg-card/80 backdrop-blur px-6 py-4 text-center text-sm text-muted-foreground">
        © Inicio Tech 2025
      </footer>
    </div>
  );
};

export default Index;
