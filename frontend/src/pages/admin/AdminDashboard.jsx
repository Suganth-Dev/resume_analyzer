import React, { useEffect } from 'react';
import { useAdminStore } from '../../store/adminStore';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Award, 
  ShieldCheck, 
  Activity,
  CalendarCheck
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
import { DashboardStatsSkeleton, ChartSkeleton } from '../../components/common/SkeletonLoader';

const COLORS = ['#f43f5e', '#a855f7', '#06b6d4', '#10b981', '#fbbf24'];

const AdminDashboard = () => {
  const { analytics, fetchAdminDashboardStats, loading } = useAdminStore();

  useEffect(() => {
    fetchAdminDashboardStats();
  }, [fetchAdminDashboardStats]);

  const { summary, charts } = analytics;
  const hasData = summary.totalUsers > 0 || summary.totalResumes > 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-900/95 border border-dark-800 p-3 rounded-lg shadow-xl text-xs">
          <p className="font-semibold text-white mb-1">{label}</p>
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Administrative Dashboard</h1>
        <p className="text-sm text-dark-400">Overview of platform metrics, uploads velocity, and user registrations</p>
      </div>

      {!hasData ? (
        <div className="glass-panel p-12 rounded-2xl border border-dark-800/80 text-center max-w-xl mx-auto py-16">
          <ShieldCheck className="w-16 h-16 text-rose-500 mb-6 mx-auto" />
          <h2 className="text-xl font-bold text-white mb-2">Platform is Empty</h2>
          <p className="text-sm text-dark-400">There are no user registrations or resume analyses recorded yet.</p>
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Users */}
            <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-950/40 border border-rose-900/40 flex items-center justify-center text-rose-450">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Total Users</p>
                <p className="text-2xl font-black text-white mt-1">{summary.totalUsers}</p>
              </div>
            </div>

            {/* Resumes */}
            <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-950/40 border border-purple-900/40 flex items-center justify-center text-purple-450">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Total Resumes</p>
                <p className="text-2xl font-black text-white mt-1">{summary.totalResumes}</p>
              </div>
            </div>

            {/* Avg Score */}
            <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/40 border border-emerald-900/40 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Average Score</p>
                <p className="text-2xl font-black text-white mt-1">{summary.averageScore}/100</p>
              </div>
            </div>

            {/* Highest Score */}
            <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-950/40 border border-amber-900/40 flex items-center justify-center text-amber-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Highest Score</p>
                <p className="text-2xl font-black text-white mt-1">{summary.highestScore}/100</p>
              </div>
            </div>

            {/* Total Admins */}
            <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-950/40 border border-blue-900/40 flex items-center justify-center text-blue-450">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Total Admins</p>
                <p className="text-2xl font-black text-white mt-1">{summary.totalAdmins}</p>
              </div>
            </div>

            {/* Active Users */}
            <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-900/40 flex items-center justify-center text-cyan-400">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Active Candidates</p>
                <p className="text-2xl font-black text-white mt-1">{summary.activeUsers}</p>
              </div>
            </div>

            {/* Total Analyses */}
            <div className="glass-card p-6 rounded-2xl flex items-center gap-4 sm:col-span-2">
              <div className="w-12 h-12 rounded-xl bg-indigo-950/40 border border-indigo-900/40 flex items-center justify-center text-indigo-400">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Total Audits Ran</p>
                <p className="text-2xl font-black text-white mt-1">{summary.totalAnalyses} evaluations</p>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart 1: Resumes uploaded per day */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-white mb-6">Resume Upload Activity (Daily)</h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.uploadsByDate} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line name="Uploads" type="monotone" dataKey="count" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#0f172a' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Registrations */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-white mb-6">User Registrations (Daily)</h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.registrationsByDate} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar name="Registrations" dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Job breakdown */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-white mb-6">Target Job Role distribution</h3>
              <div className="h-[280px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.roleDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {charts.roleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Average Score Trends */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-white mb-6">Average Score Trends (Daily)</h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.averageScoreTrends} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line name="Avg Score" type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#0f172a' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
