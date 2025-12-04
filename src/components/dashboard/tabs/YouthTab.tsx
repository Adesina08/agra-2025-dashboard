import { useMemo } from 'react';
import { GraduationCap, TrendingUp, CheckCircle, Clock, XCircle, Briefcase } from 'lucide-react';
import { youthData, fieldLabels, generateInterviewerStats, generateSubmissionQuality, errorBreakdownData } from '@/data/mockData';
import { KPICard } from '../KPICard';
import { DonutChart } from '../DonutChart';
import { BarChartComponent } from '../BarChartComponent';
import { LineChartComponent } from '../LineChartComponent';
import { MapPlaceholder } from '../MapPlaceholder';
import { DataTable } from '../DataTable';
import { StatusBadge } from '../StatusBadge';
import { ProgressPanels } from '../ProgressPanels';
import { ProductivityRankings } from '../ProductivityRankings';
import { SubmissionQualityChart } from '../SubmissionQualityChart';
import { ErrorBreakdown } from '../ErrorBreakdown';

export function YouthTab() {
  const stats = useMemo(() => {
    const total = youthData.length;
    const approved = youthData.filter(y => y.status === 'Approved').length;
    const pending = youthData.filter(y => y.status === 'Pending').length;
    const rejected = youthData.filter(y => y.status === 'Rejected').length;
    const male = youthData.filter(y => y.gender === 'Male').length;
    const female = youthData.filter(y => y.gender === 'Female').length;
    const trained = youthData.filter(y => y.trainingCompleted).length;
    const employed = youthData.filter(y => y.employmentStatus === 'Employed' || y.employmentStatus === 'Self-employed').length;

    return { total, approved, pending, rejected, male, female, trained, employed };
  }, []);

  const targetInterviews = 3000;

  const genderData = [
    { name: 'Male', value: stats.male, color: '#06b6d4' },
    { name: 'Female', value: stats.female, color: '#f472b6' },
  ];

  const educationData = useMemo(() => {
    const counts: Record<string, number> = {};
    youthData.forEach(y => { counts[y.educationLevel] = (counts[y.educationLevel] || 0) + 1; });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, []);

  const employmentData = useMemo(() => {
    const counts: Record<string, number> = {};
    youthData.forEach(y => { counts[y.employmentStatus] = (counts[y.employmentStatus] || 0) + 1; });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, []);

  const submissionTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      date: month,
      value: Math.floor(Math.random() * 100 + 40),
    }));
  }, []);

  const interviewerStats = useMemo(() => generateInterviewerStats(youthData), []);
  const submissionQuality = useMemo(() => generateSubmissionQuality(youthData), []);

  const columns = [
    { key: 'id' as const, label: 'ID', sortable: true },
    { key: 'youthName' as const, label: fieldLabels.youth.youthName, sortable: true },
    { key: 'region' as const, label: fieldLabels.youth.region, sortable: true },
    { key: 'gender' as const, label: fieldLabels.youth.gender, sortable: true },
    { key: 'ageGroup' as const, label: fieldLabels.youth.ageGroup, sortable: true },
    { key: 'educationLevel' as const, label: fieldLabels.youth.educationLevel, sortable: true },
    { key: 'employmentStatus' as const, label: fieldLabels.youth.employmentStatus, sortable: true },
    { 
      key: 'trainingCompleted' as const, 
      label: fieldLabels.youth.trainingCompleted, 
      sortable: true,
      render: (value: boolean) => (
        <span className={value ? 'text-green-400' : 'text-muted-foreground'}>
          {value ? 'Yes' : 'No'}
        </span>
      )
    },
    { 
      key: 'status' as const, 
      label: fieldLabels.youth.status, 
      sortable: true,
      render: (value: string) => <StatusBadge status={value as any} />
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard
          title="Total Youth"
          value={stats.total}
          icon={GraduationCap}
          variant="youth"
          trend={{ value: 15.7, isPositive: true }}
        />
        <KPICard
          title="Approved"
          value={stats.approved}
          subtitle={`${((stats.approved / stats.total) * 100).toFixed(1)}%`}
          icon={CheckCircle}
          variant="youth"
        />
        <KPICard
          title="Pending"
          value={stats.pending}
          subtitle={`${((stats.pending / stats.total) * 100).toFixed(1)}%`}
          icon={Clock}
          variant="youth"
        />
        <KPICard
          title="Rejected"
          value={stats.rejected}
          subtitle={`${((stats.rejected / stats.total) * 100).toFixed(1)}%`}
          icon={XCircle}
          variant="youth"
        />
        <KPICard
          title="Training Completed"
          value={`${((stats.trained / stats.total) * 100).toFixed(0)}%`}
          icon={GraduationCap}
          variant="youth"
        />
        <KPICard
          title="Employment Rate"
          value={`${((stats.employed / stats.total) * 100).toFixed(0)}%`}
          icon={Briefcase}
          variant="youth"
          trend={{ value: 5.2, isPositive: true }}
        />
      </div>

      <ProgressPanels
        achieved={stats.total}
        target={targetInterviews}
        approvals={[
          { label: 'Approved', value: stats.approved, color: '#22c55e' },
          { label: 'Pending', value: stats.pending, color: '#fde047' },
          { label: 'Rejected', value: stats.rejected, color: '#ef4444' },
        ]}
        accentColor="#0ea5e9"
        remainderColor="#38bdf8"
      />

      {/* Productivity Rankings */}
      <ProductivityRankings data={interviewerStats} variant="youth" />

      {/* Submission Quality & Error Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubmissionQualityChart data={submissionQuality} variant="youth" />
        <ErrorBreakdown data={errorBreakdownData.youth} variant="youth" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DonutChart
          data={genderData}
          title="Gender Distribution"
          variant="youth"
        />
        <BarChartComponent
          data={educationData}
          title="Education Level Distribution"
          color="#06b6d4"
          variant="youth"
        />
        <MapPlaceholder
          data={youthData.map(y => ({
            latitude: y.latitude,
            longitude: y.longitude,
            region: y.region,
            status: y.status,
          }))}
          title="Geographic Distribution"
          variant="youth"
        />
      </div>

      {/* Employment Status Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartComponent
          data={employmentData}
          title="Employment Status Distribution"
          color="#22d3ee"
          variant="youth"
        />
        <LineChartComponent
          data={submissionTrend}
          title="Monthly Submission Trend"
          color="#06b6d4"
        />
      </div>

      {/* Data Table */}
      <DataTable
        data={youthData}
        columns={columns}
        title="Youth Submissions"
        variant="youth"
      />
    </div>
  );
}
