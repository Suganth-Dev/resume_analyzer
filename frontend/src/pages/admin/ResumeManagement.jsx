import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../store/adminStore';
import { exportAnalysisToPDF } from '../../utils/pdfExporter';
import { toast } from 'react-toastify';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Trash2, 
  X, 
  Check, 
  Calendar,
  Award 
} from 'lucide-react';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import ConfirmModal from '../../components/common/ConfirmModal';

const JOB_ROLES = [
  'MERN Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Python Developer'
];

const ResumeManagement = () => {
  const { resumes, fetchAdminResumes, deleteAdminResume, loading } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedResume, setSelectedResume] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchAdminResumes();
  }, [fetchAdminResumes]);

  const filteredResumes = resumes.filter(res => {
    const matchesSearch = res.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          res.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          res.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole ? res.jobRole === selectedRole : true;
    return matchesSearch && matchesRole;
  });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await deleteAdminResume(deleteTarget.id);
    setIsDeleting(false);
    if (result.success) {
      toast.success('Resume analysis record and PDF file deleted successfully.');
      setDeleteTarget(null);
      fetchAdminResumes();
    } else {
      toast.error('Failed to delete resume analysis.');
    }
  };


  const handleDownload = (resume) => {
    exportAnalysisToPDF(resume, resume.userName);
    toast.success('PDF report download initiated.');
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Resume Audit Management</h1>
        <p className="text-sm text-dark-400">Audit, download, or delete all resume evaluations processed on the platform</p>
      </div>

      {/* Filter toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400 pointer-events-none">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Search by file, user name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-input text-sm text-white"
          />
        </div>

        <div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg glass-input text-sm text-white cursor-pointer"
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

      {/* Main Table */}
      {loading && resumes.length === 0 ? (
        <TableSkeleton />
      ) : filteredResumes.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-dark-800/80 text-center py-16">
          <FileText className="w-16 h-16 text-rose-500 mb-6 mx-auto" />
          <h2 className="text-xl font-bold text-white mb-2">No Resumes Audited</h2>
          <p className="text-sm text-dark-400">Try adjusting your filters or upload a candidate PDF to analyze.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-dark-800/80 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-dark-850 bg-dark-900/40 text-xs font-bold text-dark-300 uppercase tracking-wider">
                  <th className="py-4 px-6">Candidate</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">File Name</th>
                  <th className="py-4 px-6">Job Role</th>
                  <th className="py-4 px-6 text-center">Score</th>
                  <th className="py-4 px-6 text-center">Match %</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-850/60 text-sm">
                {filteredResumes.map((res) => {
                  const cleanName = res.fileName.replace(/^\d+-/, '');
                  return (
                    <tr key={res._id} className="hover:bg-dark-900/20 transition-colors text-dark-200">
                      <td className="py-4 px-6 font-semibold text-white truncate max-w-[150px]">{res.userName}</td>
                      <td className="py-4 px-6 truncate max-w-[180px]">{res.userEmail}</td>
                      <td className="py-4 px-6 truncate max-w-[180px]" title={cleanName}>{cleanName}</td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-brand-950/40 border border-brand-800/40 text-brand-300">
                          {res.jobRole}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-bold">
                        <span className={
                          res.totalScore >= 80 ? 'text-emerald-400' :
                          res.totalScore >= 60 ? 'text-amber-400' : 'text-red-400'
                        }>
                          {res.totalScore}/100
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-sky-400">{res.skillMatchPercentage}%</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedResume(res)}
                            className="p-1.5 text-dark-400 hover:text-white rounded hover:bg-dark-800 transition-colors"
                            title="Audit Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(res)}
                            className="p-1.5 text-dark-400 hover:text-white rounded hover:bg-dark-800 transition-colors cursor-pointer"
                            title="Download PDF Audit"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ id: res._id, fileName: res.fileName })}
                            className="p-1.5 text-dark-400 hover:text-red-400 rounded hover:bg-red-950/10 transition-colors cursor-pointer"
                            title="Delete Record"
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
        </div>
      )}

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
              <p className="text-xs text-dark-400">Candidate: {selectedResume.userName} ({selectedResume.userEmail})</p>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
              {/* Score dials */}
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
              {/* Skill gap info */}
              <div className="p-4 rounded-xl bg-dark-900/60 border border-dark-800/80">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Predefined Skills Alignment</h4>
                <div className="space-y-3">
                  {/* Match */}
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">Matched Skills</span>
                    <p className="text-xs text-dark-200 leading-relaxed">
                      {selectedResume.matchedSkills && selectedResume.matchedSkills.length > 0
                        ? selectedResume.matchedSkills.join(', ')
                        : 'No matched terms.'}
                    </p>
                  </div>
                  {/* Missing */}
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

              {/* Suggestions */}
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
        message={`Are you sure you want to delete the analysis for "${deleteTarget?.fileName?.replace(/^\d+-/, '')}"? This will physically erase the PDF file from the server.`}
        confirmText="Yes, Delete"
        cancelText="No, Cancel"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ResumeManagement;
