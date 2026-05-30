import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useResumeStore } from '../store/resumeStore';
import { useAuthStore } from '../store/authStore';
import { JOB_ROLES } from '../constants/jobRoles';
import { exportAnalysisToPDF } from '../utils/pdfExporter';
import { toast } from 'react-toastify';
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  FileText,
  Plus
} from 'lucide-react';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import ConfirmModal from '../components/common/ConfirmModal';

const History = () => {
  const { resumes, pagination, fetchResumes, deleteResume, loading } = useResumeStore();
  const { user } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch resumes when page, search, or filters change
  useEffect(() => {
    fetchResumes(searchTerm, selectedRole, currentPage);
  }, [fetchResumes, searchTerm, selectedRole, currentPage]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setCurrentPage(1); // Reset to first page
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await deleteResume(deleteTarget.id);
    setIsDeleting(false);
    if (result.success) {
      toast.success('Resume deleted successfully.');
      setDeleteTarget(null);
      fetchResumes(searchTerm, selectedRole, currentPage);
    } else {
      toast.error(result.message);
    }
  };


  const handleDownload = (resume) => {
    exportAnalysisToPDF(resume, user?.name);
    toast.success('PDF report download initiated.');
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Analysis History</h1>
          <p className="text-sm text-dark-400">Search and audit your previously parsed PDF resumes</p>
        </div>
        <Link
          to="/analyzer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-brand font-semibold text-sm text-white hover:brightness-110 shadow-lg shadow-brand-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Analysis
        </Link>
      </div>

      {/* Filter Controls Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400 pointer-events-none">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Search by file name..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-input text-sm text-white"
          />
        </div>

        {/* Role Filter */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400 pointer-events-none">
            <Filter className="w-4 h-4" />
          </span>
          <select
            value={selectedRole}
            onChange={handleRoleChange}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-input text-sm text-white cursor-pointer"
          >
            <option value="" className="bg-dark-900 text-dark-400">All Job Roles</option>
            {JOB_ROLES.map((role) => (
              <option key={role} value={role} className="bg-dark-900 text-white">
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && resumes.length === 0 ? (
        <TableSkeleton />
      ) : resumes.length === 0 ? (
        /* Empty State */
        <div className="glass-panel p-12 rounded-2xl border border-dark-800/80 text-center flex flex-col items-center max-w-xl mx-auto py-16">
          <div className="w-16 h-16 rounded-full bg-dark-800/40 border border-dark-700/50 flex items-center justify-center mb-6">
            <FileText className="w-8 h-8 text-brand-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Reports Found</h2>
          <p className="text-sm text-dark-400 mb-0 max-w-sm leading-relaxed">
            {searchTerm || selectedRole 
              ? "We couldn't find any reports matching your search or filters. Try adjustments or clear criteria." 
              : "You haven't run any resume evaluations yet."}
          </p>
        </div>
      ) : (
        /* History content list */
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl border border-dark-800/80 overflow-hidden shadow-2xl">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-dark-850 bg-dark-900/40 text-xs font-bold text-dark-300 uppercase tracking-wider">
                    <th className="py-4 px-6">File Name</th>
                    <th className="py-4 px-6">Target Role</th>
                    <th className="py-4 px-6 text-center">ATS Score</th>
                    <th className="py-4 px-6 text-center">Skill Match</th>
                    <th className="py-4 px-6">Date Analyzed</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-850/60 text-sm">
                  {resumes.map((resume) => {
                    const cleanName = resume.fileName.replace(/^\d+-/, '');
                    return (
                      <tr key={resume._id} className="hover:bg-dark-900/20 transition-colors text-dark-200">
                        <td className="py-4 px-6 font-semibold text-white max-w-[240px] truncate">
                          {cleanName}
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-brand-950/40 border border-brand-800/40 text-brand-300">
                            {resume.jobRole}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center font-bold">
                          <span className={`text-md ${
                            resume.totalScore >= 80 ? 'text-emerald-400' :
                            resume.totalScore >= 60 ? 'text-amber-400' : 'text-red-400'
                          }`}>
                            {resume.totalScore}/100
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-sky-400">
                          {resume.skillMatchPercentage}%
                        </td>
                        <td className="py-4 px-6 text-dark-400 text-xs">
                          {new Date(resume.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/resume/${resume._id}`}
                              className="p-2 text-dark-400 hover:text-white rounded-lg hover:bg-dark-800 transition-colors"
                              title="View Report"
                            >
                              <Eye className="w-4.5 h-4.5" />
                            </Link>
                            <button
                              onClick={() => handleDownload(resume)}
                              className="p-2 text-dark-400 hover:text-brand-400 rounded-lg hover:bg-dark-800 transition-colors cursor-pointer"
                              title="Download Report"
                            >
                              <Download className="w-4.5 h-4.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ id: resume._id, fileName: resume.fileName })}
                              className="p-2 text-dark-400 hover:text-red-400 rounded-lg hover:bg-red-950/10 transition-colors cursor-pointer"
                              title="Delete Analysis"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="block md:hidden divide-y divide-dark-850/60 p-4 space-y-4">
              {resumes.map((resume) => {
                const cleanName = resume.fileName.replace(/^\d+-/, '');
                return (
                  <div key={resume._id} className="pt-4 first:pt-0 space-y-3">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-white truncate max-w-[200px]">{cleanName}</p>
                      <span className={`text-sm font-bold ${
                        resume.totalScore >= 80 ? 'text-emerald-400' :
                        resume.totalScore >= 60 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {resume.totalScore}/100
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="px-2 py-0.5 rounded bg-brand-950/40 border border-brand-800/40 text-brand-300">
                        {resume.jobRole}
                      </span>
                      <span className="text-dark-400">
                        {new Date(resume.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <Link
                        to={`/resume/${resume._id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800 text-xs font-semibold text-white"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                      <button
                        onClick={() => handleDownload(resume)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800 text-xs font-semibold text-brand-400 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Export
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ id: resume._id, fileName: resume.fileName })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/20 border border-red-900/30 text-xs font-semibold text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex justify-between items-center px-2">
              <span className="text-xs text-dark-400">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total reports)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-dark-900 hover:bg-dark-800 disabled:bg-dark-950/20 disabled:text-dark-600 border border-dark-800/50 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.pages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-gradient-brand text-white'
                            : 'bg-dark-900 text-dark-400 hover:text-white border border-dark-800/50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                  className="p-2 rounded-lg bg-dark-900 hover:bg-dark-800 disabled:bg-dark-950/20 disabled:text-dark-600 border border-dark-800/50 cursor-pointer transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
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

export default History;
