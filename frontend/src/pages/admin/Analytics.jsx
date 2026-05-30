import React, { useEffect } from 'react';
import { useAdminStore } from '../../store/adminStore';
import { 
  BarChart3, 
  TrendingUp, 
  Lightbulb, 
  AlertTriangle, 
  Calendar,
  Layers,
  PieChart as PieIcon,
  ShieldCheck
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
import { ChartSkeleton } from '../../components/common/SkeletonLoader';

const GRADIENT_COLORS = [
  { start: '#f43f5e', end: '#be123c' }, // Rose
  { start: '#a855f7', end: '#6b21a8' }, // Purple
  { start: '#06b6d4', end: '#0891b2' }, // Cyan
  { start: '#10b981', end: '#047857' }, // Emerald
  { start: '#fbbf24', end: '#b45309' }, // Amber
  { start: '#3b82f6', end: '#1d4ed8' }  // Blue
];

const SIMPLE_COLORS = ['#f43f5e', '#a855f7', '#06b6d4', '#10b981', '#fbbf24', '#3b82f6'];

const Analytics = () => {
  const { analytics, fetchAdminDashboardStats, loading } = useAdminStore();

  useEffect(() => {
    fetchAdminDashboardStats();
  }, [fetchAdminDashboardStats]);

  const { summary, charts } = analytics;
  const hasData = summary.totalUsers > 0 || summary.totalResumes > 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-900/95 border border-dark-800/90 p-4 rounded-xl shadow-2xl text-xs backdrop-blur-md">
          <p className="font-bold text-white mb-2 border-b border-dark-800 pb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-rose-500" />
            {label}
          </p>
          {payload.map((item, index) => (
            <p key={index} style={{ color: item.color }} className="font-semibold flex justify-between gap-4 py-0.5">
              <span>{item.name}:</span>
              <span className="text-white font-mono">{item.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const SkillTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-dark-900/95 border border-dark-800/90 p-3 rounded-xl shadow-2xl text-xs backdrop-blur-md">
          <p className="font-bold text-white mb-1 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            {data.name}
          </p>
          <p className="text-dark-300 font-medium">
            Found in <span className="text-white font-semibold font-mono">{data.value}</span> resumes
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading && !hasData) {
    return (
      <div className="space-y-8 animate-pulse-slow">
        <div className="h-10 bg-dark-800 rounded-md w-1/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-rose-500" />
            Platform Analytics
          </h1>
          <p className="text-sm text-dark-400">Deep-dive visualizations of market skill trends, evaluation scores, and platform usage dynamics</p>
        </div>
      </div>

      {!hasData ? (
        <div className="glass-panel p-12 rounded-2xl border border-dark-800/80 text-center max-w-xl mx-auto py-16">
          <ShieldCheck className="w-16 h-16 text-rose-500 mb-6 mx-auto animate-pulse" />
          <h2 className="text-xl font-bold text-white mb-2">No Analytical Data</h2>
          <p className="text-sm text-dark-400">Please seed users and upload resumes to generate aggregated trends and distributions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart 1: Market Demand - Top Matched Skills */}
          <div className="glass-card p-6 rounded-2xl border border-dark-800/60 flex flex-col hover:border-dark-700/60 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-900/40 flex items-center justify-center text-emerald-400">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Top Candidate Core Skills</h3>
                <p className="text-xs text-dark-400">Most frequently matching skills in uploads</p>
              </div>
            </div>
            <div className="h-[280px] flex-1">
              {charts.topSkills && charts.topSkills.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={charts.topSkills} 
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} width={80} />
                    <Tooltip content={<SkillTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} maxBarSize={20}>
                      {charts.topSkills.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SIMPLE_COLORS[index % SIMPLE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-dark-500 text-xs font-semibold">No skill data available</div>
              )}
            </div>
          </div>

          {/* Chart 2: Skill Gaps - Top Missing Skills */}
          <div className="glass-card p-6 rounded-2xl border border-dark-800/60 flex flex-col hover:border-dark-700/60 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-950/40 border border-rose-900/40 flex items-center justify-center text-rose-450">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Top Skills Deficits</h3>
                <p className="text-xs text-dark-400">Most frequent skill gaps against chosen roles</p>
              </div>
            </div>
            <div className="h-[280px] flex-1">
              {charts.topMissingSkills && charts.topMissingSkills.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={charts.topMissingSkills} 
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} width={80} />
                    <Tooltip content={<SkillTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="value" fill="#f43f5e" radius={[0, 4, 4, 0]} maxBarSize={20}>
                      {charts.topMissingSkills.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SIMPLE_COLORS[(SIMPLE_COLORS.length - 1 - index) % SIMPLE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-dark-500 text-xs font-semibold">No skill deficit data available</div>
              )}
            </div>
          </div>

          {/* Chart 3: Resume Upload Velocity */}
          <div className="glass-card p-6 rounded-2xl border border-dark-800/60 flex flex-col hover:border-dark-700/60 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-900/40 flex items-center justify-center text-purple-405">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Daily Upload Stream</h3>
                <p className="text-xs text-dark-400">Total resume evaluations processed over time</p>
              </div>
            </div>
            <div className="h-[280px] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.uploadsByDate} margin={{ top: 5, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    name="Resumes Audited" 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#a855f7" 
                    strokeWidth={3} 
                    dot={{ r: 4, strokeWidth: 2, fill: '#0f172a' }} 
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Average Score Trends */}
          <div className="glass-card p-6 rounded-2xl border border-dark-800/60 flex flex-col hover:border-dark-700/60 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-900/40 flex items-center justify-center text-cyan-405">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Score Performance Curves</h3>
                <p className="text-xs text-dark-400">Fluctuations in daily candidate match quality averages</p>
              </div>
            </div>
            <div className="h-[280px] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.averageScoreTrends} margin={{ top: 5, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    name="Average Score" 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#06b6d4" 
                    strokeWidth={3} 
                    dot={{ r: 4, strokeWidth: 2, fill: '#0f172a' }} 
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 5: Target Job Role Distributions */}
          <div className="glass-card p-6 rounded-2xl border border-dark-800/60 flex flex-col hover:border-dark-700/60 transition-all duration-300 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-950/40 border border-rose-900/40 flex items-center justify-center text-rose-450">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Career Stream Share</h3>
                <p className="text-xs text-dark-400">Candidate target profession breakdowns</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center flex-1">
              <div className="h-[260px] w-full flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.roleDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {charts.roleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SIMPLE_COLORS[index % SIMPLE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-2">
                {charts.roleDistribution.map((role, idx) => {
                  const percentage = ((role.value / summary.totalResumes) * 100).toFixed(1);
                  const color = SIMPLE_COLORS[idx % SIMPLE_COLORS.length];
                  return (
                    <div key={role.name} className="flex items-center justify-between p-2.5 rounded-lg bg-dark-900/40 border border-dark-800/40 hover:bg-dark-900/80 transition-all">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-xs font-semibold text-white truncate max-w-[150px]">{role.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-dark-400 font-semibold">{role.value} items</span>
                        <span className="text-xs font-mono font-bold text-white bg-dark-800 px-2 py-0.5 rounded-md">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Analytics;
