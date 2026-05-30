import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import { exportAnalysisToPDF } from '../../utils/pdfExporter';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  FileText, 
  TrendingUp, 
  Award,
  Eye,
  Download,
  Trash2,
  X,
  Check
} from 'lucide-react';
import { AnalysisDetailSkeleton } from '../../components/common/SkeletonLoader';
import ConfirmModal from '../../components/common/ConfirmModal';

const UserDetail = () => {
  const { id } = useParams();
  const { selectedUser, fetchAdminUserById, deleteAdminResume, loading } = useAdminStore();
  const [selectedResume, setSelectedResume] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchAdminUserById(id);
  }, [id, fetchAdminUserById]);

  if (loading && !selectedUser) {
    return <AnalysisDetailSkeleton />;
  }

  if (!selectedUser) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-white mb-2">Candidate Profile Not Found</h2>
        <p className="text-sm text-dark-400 mb-8">The requested candidate account may have been deleted or the ID is invalid.</p>
        <Link to="/admin/users" className="px-5 py-2.5 rounded-lg bg-dark-900 border border-dark-800 text-sm font-semibold text-white">
          Back to User Registry
        </Link>
      </div>
    );
  }

  const { user, stats, history } = selectedUser;

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await deleteAdminResume(deleteTarget.id);
    setIsDeleting(false);
    if (result.success) {
      toast.success('Resume deleted successfully.');
      setDeleteTarget(null);
      fetchAdminUserById(id);
    } else {
      toast.error('Failed to delete resume.');
    }
  };


  const handleDownload = (resume) => {
    exportAnalysisToPDF(resume, user.name);
    toast.success('PDF report download initiated.');
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Navigation breadcrumb */}
      <Link to="/admin/users" className="inline-flex items-center gap-1 text-sm font-medium text-dark-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to User Registry
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: User credentials card */}
        <div className="space-y-8 lg:col-span-1">
          <div className="glass-panel p-6 rounded-2xl border border-dark-800/80 shadow-xl">
            <div className="flex flex-col items-center text-center pb-6 border-b border-dark-800/80">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-rose-500 to-purple-500 flex items-center justify-center text-2xl font-black text-white uppercase mb-4 shadow-md">
                {user.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-dark-950 border border-dark-800 text-dark-400 uppercase tracking-wider">
                {user.role}
              </span>
            </div>

            <div className="py-6 space-y-4 text-sm text-dark-300">
              <div className="flex items-center gap-3">
                <Mail className="w-4.5 h-4.5 text-dark-400" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4.5 h-4.5 text-dark-400" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-4.5 h-4.5 text-dark-400" />
                <span>ID: {user.id || user._id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Stats and History */}
        <div className="space-y-8 lg:col-span-2">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Total */}
            <div className="glass-card p-5 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-rose-950/40 border border-rose-900/40 flex items-center justify-center text-rose-455">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-dark-400 uppercase tracking-wider">Uploaded Resumes</p>
                <p className="text-xl font-black text-white mt-0.5">{stats.totalResumes}</p>
              </div>
            </div>
            {/* Avg */}
            <div className="glass-card p-5 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-950/40 border border-purple-900/40 flex items-center justify-center text-purple-455">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-dark-400 uppercase tracking-wider">Average Score</p>
                <p className="text-xl font-black text-white mt-0.5">{stats.averageScore}/100</p>
              </div>
            </div>
            {/* Highest */}
            <div className="glass-card p-5 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/40 border border-emerald-900/40 flex items-center justify-center text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-dark-400 uppercase tracking-wider">Highest Score</p>
                <p className="text-xl font-black text-white mt-0.5">{stats.highestScore}/100</p>
              </div>
            </div>
          </div>

          {/* History registry table */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Candidate Resume Portfolio</h3>
            
            {history.length === 0 ? (
              <p className="text-sm text-dark-400 italic text-center py-6">This candidate has not uploaded any resumes yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-dark-850 text-xs font-bold text-dark-350 uppercase tracking-wider pb-3">
                      <th className="pb-3">File Name</th>
                      <th className="pb-3">Target Role</th>
                      <th className="pb-3 text-center">Score</th>
                      <th className="pb-3 text-center">Date Analyzed</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-850/40 text-sm">
                    {history.map((resume) => {
                      const cleanName = resume.fileName.replace(/^\d+-/, '');
                      return (
                        <tr key={resume._id} className="hover:bg-dark-900/10 text-dark-200">
                          <td className="py-3 font-semibold text-white truncate max-w-[200px]" title={cleanName}>
                            {cleanName}
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-brand-950/30 border border-brand-800/30 text-brand-300">
                              {resume.jobRole}
                            </span>
                          </td>
                          <td className="py-3 text-center font-bold">
                            <span className={
                              resume.totalScore >= 80 ? 'text-emerald-400' :
                              resume.totalScore >= 60 ? 'text-amber-400' : 'text-red-400'
                            }>
                              {resume.totalScore}/100
                            </span>
                          </td>
                          <td className="py-3 text-center text-xs text-dark-400">
                            {new Date(resume.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedResume(resume)}
                                className="p-1.5 text-dark-400 hover:text-white rounded hover:bg-dark-800 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDownload(resume)}
                                className="p-1.5 text-dark-400 hover:text-white rounded hover:bg-dark-800 transition-colors cursor-pointer"
                                title="Download PDF"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ id: resume._id, fileName: resume.fileName })}
                                className="p-1.5 text-dark-400 hover:text-red-400 rounded hover:bg-red-950/10 transition-colors cursor-pointer"
                                title="Delete Analysis"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resume Audit Details Modal */}
      {selectedResume && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-2xl glass-panel p-6 rounded-2xl border border-dark-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedResume(null)}
              className="absolute top-4 right-4 p-1 text-dark-400 hover:text-white rounded hover:bg-dark-800"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="border-b border-dark-800 pb-4 mb-6">
              <h3 className="text-lg font-bold text-white mb-1">Detailed ATS Audit Report</h3>
              <p className="text-xs text-dark-400">Candidate: {user.name} ({user.email})</p>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="glass-card p-4 rounded-xl flex flex-col items-center justify-center text-center">
                <Award className="w-8 h-8 text-brand-400 mb-2" />
                <span className="text-xs text-dark-400">ATS Score</span>
                <span className="text-2xl font-black text-white mt-1">{selectedResume.totalScore}/100</span>
              </div>
              
              <div className="glass-card p-4 rounded-xl flex flex-col items-center justify-center text-center">
                <Check className="w-8 h-8 text-sky-400 mb-2" />
                <span className="text-xs text-dark-400">Skills Match</span>
                <span className="text-2xl font-black text-white mt-1">{selectedResume.skillMatchPercentage}%</span>
              </div>

              <div className="glass-card p-4 rounded-xl flex flex-col items-center justify-center text-center">
                <Calendar className="w-8 h-8 text-emerald-400 mb-2" />
                <span className="text-xs text-dark-400">Date Logged</span>
                <span className="text-xs font-black text-white mt-2.5">
                  {new Date(selectedResume.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-dark-900/60 border border-dark-800/80">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Predefined Skills Alignment</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">Matched Skills</span>
                    <p className="text-xs text-dark-200 leading-relaxed">
                      {selectedResume.matchedSkills && selectedResume.matchedSkills.length > 0
                        ? selectedResume.matchedSkills.join(', ')
                        : 'No matched terms.'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-1">Missing Skills</span>
                    <p className="text-xs text-dark-200 leading-relaxed">
                      {selectedResume.missingSkills && selectedResume.missingSkills.length > 0
                        ? selectedResume.missingSkills.join(', ')
                        : 'Perfect skills alignment!'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">ATS Audit Suggestions</h4>
                <ul className="space-y-2">
                  {selectedResume.suggestions && selectedResume.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="text-xs text-dark-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-3 border-t border-dark-800 pt-4">
              <button
                onClick={() => handleDownload(selectedResume)}
                className="px-4 py-2 rounded-lg bg-brand-500 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Download PDF
              </button>
              <button
                onClick={() => setSelectedResume(null)}
                className="px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Resume Audit"
        message={`Are you sure you want to delete the analysis for "${deleteTarget?.fileName?.replace(/^\d+-/, '')}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default UserDetail;
