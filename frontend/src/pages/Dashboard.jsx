import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useResumeStore } from '../store/resumeStore';
import { 
  FileText, 
  TrendingUp, 
  Award, 
  CheckSquare, 
  UploadCloud, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { DashboardStatsSkeleton, ChartSkeleton } from '../components/common/SkeletonLoader';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
const PIE_COLORS = {
  'Low (< 50%)': '#f43f5e',
  'Moderate (50-70%)': '#f97316',
  'Good (70-85%)': '#eab308',
  'Excellent (> 85%)': '#10b981'
};

const Dashboard = () => {
  const { stats, fetchDashboardStats, loading } = useResumeStore();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const { summary, charts } = stats;
  const hasData = summary.totalResumes > 0;

  // Custom tooltips for graphs
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-900/90 border border-dark-800 p-3 rounded-lg shadow-xl text-xs">
          <p className="font-semibold text-white mb-1.5">{label}</p>
          {payload.map((item, index) => (
            <p key={index} style={{ color: item.color }} className="font-medium">
              {item.name}: {item.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading && !hasData) {
    return (
      <div className="space-y-8">
        <div className="h-10 bg-dark-800 rounded-md w-1/4 animate-pulse"></div>
        <DashboardStatsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Dashboard Overview</h1>
          <p className="text-sm text-dark-400">Track resume assessment history and matching performance metrics</p>
        </div>
        <Link
          to="/analyzer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-brand font-semibold text-sm text-white hover:brightness-110 shadow-lg shadow-brand-500/20 transition-all cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          Analyze Resume
        </Link>
      </div>

      {!hasData ? (
        /* Empty State */
        <div className="glass-panel p-12 rounded-2xl border border-dark-800/80 text-center flex flex-col items-center max-w-xl mx-auto mt-12">
          <div className="w-16 h-16 rounded-full bg-dark-800/40 border border-dark-700/50 flex items-center justify-center mb-6">
            <FileText className="w-8 h-8 text-brand-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Resumes Analyzed Yet</h2>
          <p className="text-sm text-dark-400 mb-8 max-w-sm leading-relaxed">
            Get started by uploading your first PDF resume and selecting your desired job role to generate real-time metrics.
          </p>
          <Link
            to="/analyzer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-brand font-semibold text-sm text-white hover:brightness-110 shadow-lg shadow-brand-500/20 transition-all cursor-pointer"
          >
            Upload First Resume
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <>
          {/* Stats KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="glass-card p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-brand-950/40 border border-brand-800/50 flex items-center justify-center text-brand-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Total Resumes</p>
                <p className="text-2xl font-extrabold text-white mt-1">{summary.totalResumes}</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="glass-card p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-violet-950/40 border border-violet-800/50 flex items-center justify-center text-violet-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Average Score</p>
                <p className="text-2xl font-extrabold text-white mt-1">{summary.averageScore}/100</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="glass-card p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Best Score</p>
                <p className="text-2xl font-extrabold text-white mt-1">{summary.bestScore}/100</p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="glass-card p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-sky-950/40 border border-sky-800/50 flex items-center justify-center text-sky-400">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Skill Match Avg</p>
                <p className="text-2xl font-extrabold text-white mt-1">{summary.averageSkillMatch}%</p>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart 1: Score Trends over Time */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-md font-bold text-white mb-6">ATS Score Trends (Recent)</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.scoreTrends} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Line
                      name="Score"
                      type="monotone"
                      dataKey="score"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ r: 5, strokeWidth: 2, fill: '#0f172a' }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      name="Skill Match %"
                      type="monotone"
                      dataKey="skills"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={{ r: 4, strokeWidth: 1.5, fill: '#0f172a' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Job Role Breakdown */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-md font-bold text-white mb-6">Job Role breakdown</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.roleBreakdown} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} width={120} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar name="Resumes" dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} maxBarSize={30}>
                      {charts.roleBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Skill Match Pie Chart */}
            <div className="glass-card p-6 rounded-2xl lg:col-span-2 max-w-2xl mx-auto w-full">
              <h3 className="text-md font-bold text-white mb-6 text-center">Skill Alignment Distribution</h3>
              <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                <div className="h-[250px] w-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.skillMatchPie}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {charts.skillMatchPie.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name] || '#8b5cf6'} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 shrink-0">
                  {charts.skillMatchPie.map((entry, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div 
                        className="w-3.5 h-3.5 rounded-full" 
                        style={{ backgroundColor: PIE_COLORS[entry.name] || '#8b5cf6' }} 
                      />
                      <span className="text-sm font-semibold text-white">{entry.name}:</span>
                      <span className="text-sm text-dark-400">{entry.value} resume(s)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
