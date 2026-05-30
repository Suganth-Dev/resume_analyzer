import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useResumeStore } from '../store/resumeStore';
import { useAuthStore } from '../store/authStore';
import { JOB_ROLES } from '../constants/jobRoles';
import { exportAnalysisToPDF } from '../utils/pdfExporter';
import { toast } from 'react-toastify';
import { 
  ChevronLeft, 
  Download, 
  RefreshCw, 
  Check, 
  X, 
  Info, 
  Brain,
  Calendar,
  Loader2,
  FileText
} from 'lucide-react';
import { AnalysisDetailSkeleton } from '../components/common/SkeletonLoader';

// SVG Circular Progress Bar Component
const CircularProgress = ({ value, max = 100, size = 130, strokeWidth = 8, color = '#8b5cf6', sublabel = 'Score' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / max) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute text-center flex flex-col justify-center">
          <span className="text-3xl font-black text-white">{value}</span>
          <span className="text-[10px] font-semibold text-dark-400 -mt-1">/ {max}</span>
        </div>
      </div>
      <span className="text-xs font-bold text-white mt-3 uppercase tracking-wider">{sublabel}</span>
    </div>
  );
};

const ResumeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentAnalysis, fetchResumeById, reanalyzeResume, loading } = useResumeStore();
  const { user } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState('');
  const [reanalyzing, setReanalyzing] = useState(false);

  useEffect(() => {
    fetchResumeById(id);
  }, [id, fetchResumeById]);

  useEffect(() => {
    if (currentAnalysis) {
      setSelectedRole(currentAnalysis.jobRole);
    }
  }, [currentAnalysis]);

  const handleDownload = () => {
    if (!currentAnalysis) return;
    exportAnalysisToPDF(currentAnalysis, user?.name);
    toast.success('PDF report download initiated.');
  };

  const handleReanalyze = async () => {
    if (!selectedRole) {
      toast.error('Please select a target job role.');
      return;
    }

    setReanalyzing(true);
    const result = await reanalyzeResume(id, selectedRole);
    setReanalyzing(false);
    if (result.success) {
      toast.success('Resume re-analyzed successfully!');
    } else {
      toast.error(result.message);
    }
  };

  if (loading && !currentAnalysis) {
    return <AnalysisDetailSkeleton />;
  }

  if (!currentAnalysis) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-white mb-2">Analysis Report Not Found</h2>
        <p className="text-sm text-dark-400 mb-8">The requested resume analysis report could not be found or you do not have permission to view it.</p>
        <Link to="/history" className="px-5 py-2.5 rounded-lg bg-dark-900 border border-dark-800 text-sm font-semibold text-white">
          Back to History
        </Link>
      </div>
    );
  }

  const fileCleanName = currentAnalysis.fileName.replace(/^\d+-/, '');

  return (
    <div className="space-y-8 font-sans">
      {/* Back Button & Top Action Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link to="/history" className="inline-flex items-center gap-1 text-sm font-medium text-dark-400 hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to History
        </Link>
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-dark-900 border border-dark-800 text-sm font-semibold text-white hover:bg-dark-800 transition-colors shadow-lg cursor-pointer"
        >
          <Download className="w-4 h-4 text-brand-400" />
          Download PDF Report
        </button>
      </div>

      {/* Hero Overview Glass Card */}
      <div className="glass-panel p-8 rounded-2xl border border-dark-800/80 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-3 text-center md:text-left min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <span className="px-3 py-1 text-xs font-semibold text-brand-300 bg-brand-950/40 border border-brand-800/40 rounded-full">
              {currentAnalysis.jobRole}
            </span>
            <span className="flex items-center gap-1 text-xs text-dark-400">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(currentAnalysis.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white truncate">{fileCleanName}</h1>
          <p className="text-sm text-dark-400 max-w-lg">
            This evaluation rates your resume's searchability, alignment with industry tech terms, and keyword density.
          </p>
        </div>

        {/* Dynamic score dials */}
        <div className="flex items-center gap-8 shrink-0">
          <CircularProgress 
            value={currentAnalysis.totalScore} 
            max={100} 
            color="#8b5cf6" 
            sublabel="ATS Score" 
          />
          <CircularProgress 
            value={currentAnalysis.skillMatchPercentage} 
            max={100} 
            color="#0ea5e9" 
            sublabel="Skill Match" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Score Breakdown & Re-analyze panel */}
        <div className="space-y-8 lg:col-span-1">
          {/* Detailed Score breakdown */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <Info className="w-4 h-4 text-brand-400" />
              Score Breakdown
            </h3>
            <div className="space-y-5">
              {[
                { name: 'Skills Relevance', value: Math.round((currentAnalysis.skillMatchPercentage / 100) * 30), max: 30 },
                { name: 'Experience Depth', value: currentAnalysis.experienceScore, max: 20 },
                { name: 'Project Quality', value: currentAnalysis.projectScore, max: 15 },
                { name: 'Formatting & Layout', value: currentAnalysis.formatScore, max: 10 },
                { name: 'Keyword Optimization', value: currentAnalysis.keywordScore, max: 15 },
                { name: 'Education & Certifications', value: currentAnalysis.educationScore, max: 10 },
              ].map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-dark-300">{item.name}</span>
                    <span className="text-white">{item.value} / {item.max}</span>
                  </div>
                  <div className="w-full bg-dark-800 rounded-full h-1.5">
                    <div 
                      className="bg-brand-500 h-1.5 rounded-full" 
                      style={{ width: `${(item.value / item.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Re-analyze Widget */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-brand-400" />
              Re-analyze Resume
            </h3>
            <p className="text-xs text-dark-400 mb-6">Evaluate the same document against a different technical job profile.</p>
            <div className="space-y-4">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={reanalyzing}
                className="w-full px-3 py-2.5 rounded-lg glass-input text-xs text-white cursor-pointer"
              >
                {JOB_ROLES.map((role) => (
                  <option key={role} value={role} className="bg-dark-900 text-white">
                    {role}
                  </option>
                ))}
              </select>
              <button
                onClick={handleReanalyze}
                disabled={reanalyzing || selectedRole === currentAnalysis.jobRole}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:bg-dark-800 disabled:text-dark-500 font-semibold text-xs text-white transition-all shadow-md cursor-pointer"
              >
                {reanalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Re-analyzing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    Run Audit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Skill alignment gap analysis & suggestions */}
        <div className="space-y-8 lg:col-span-2">
          {/* Skill gaps layout */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <Brain className="w-4 h-4 text-brand-400" />
              Technology Alignment Gap
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Matched Skills card */}
              <div className="p-5 rounded-xl bg-emerald-950/10 border border-emerald-900/20">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400 border border-emerald-400/30 rounded-full p-0.5" />
                  Matched Skills ({currentAnalysis.matchedSkills.length})
                </h4>
                {currentAnalysis.matchedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {currentAnalysis.matchedSkills.map(skill => (
                      <span key={skill} className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-900/30 border border-emerald-800/40 text-emerald-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-dark-400 italic">No matching tech terms identified.</p>
                )}
              </div>

              {/* Missing Skills card */}
              <div className="p-5 rounded-xl bg-red-950/10 border border-red-900/20">
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <X className="w-4 h-4 text-red-400 border border-red-400/30 rounded-full p-0.5" />
                  Missing Skills ({currentAnalysis.missingSkills.length})
                </h4>
                {currentAnalysis.missingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {currentAnalysis.missingSkills.map(skill => (
                      <span key={skill} className="px-2.5 py-1 text-xs font-semibold rounded bg-red-900/30 border border-red-800/40 text-red-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-400 font-semibold italic">Perfect! No skill gaps found.</p>
                )}
              </div>
            </div>
          </div>

          {/* Actionable Suggestions */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-400" />
              ATS Optimization Recommendations
            </h3>
            {currentAnalysis.suggestions.length > 0 ? (
              <ul className="space-y-4">
                {currentAnalysis.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-dark-300 leading-relaxed border-b border-dark-800/40 pb-3 last:border-0 last:pb-0">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-950/60 border border-brand-800/50 flex items-center justify-center text-xs font-bold text-brand-300">
                      {idx + 1}
                    </span>
                    <p className="pt-0.5">{suggestion}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-emerald-400 font-semibold italic">Your resume has optimized keyword listings. No actions required.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeDetails;
