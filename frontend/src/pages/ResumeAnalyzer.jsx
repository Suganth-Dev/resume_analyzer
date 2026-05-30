import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResumeStore } from '../store/resumeStore';
import { JOB_ROLES } from '../constants/jobRoles';
import { toast } from 'react-toastify';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  BrainCircuit, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

const ResumeAnalyzer = () => {
  const { uploadResume, uploading, uploadProgress } = useResumeStore();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [jobRole, setJobRole] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // File drag handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    // Check MIME type and file extension
    const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      toast.error('Only PDF documents are supported.');
      return;
    }

    // Check File Size limit (5MB)
    const isUnder5MB = selectedFile.size <= 5 * 1024 * 1024;
    if (!isUnder5MB) {
      toast.error('File size exceeds the 5MB limit.');
      return;
    }

    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select or upload a resume PDF.');
      return;
    }

    if (!jobRole) {
      toast.error('Please select a target job role.');
      return;
    }

    const result = await uploadResume(file, jobRole);
    if (result.success) {
      toast.success('Resume analyzed successfully!');
      navigate(`/resume/${result.data._id}`);
    } else {
      toast.error(result.message);
    }
  };

  // Convert bytes to readable strings
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8 font-sans max-w-3xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">AI Resume Analyzer</h1>
        <p className="text-sm text-dark-400">Upload your professional resume in PDF format to run the optimization scanner</p>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-dark-800/80 shadow-2xl">
        <form onSubmit={handleAnalyze} className="space-y-6">
          {/* Job Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">
              Target Job Role
            </label>
            <select
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              disabled={uploading}
              className="w-full px-4 py-3 rounded-lg glass-input text-sm text-white cursor-pointer"
            >
              <option value="" className="bg-dark-900 text-dark-400">-- Select Job Role --</option>
              {JOB_ROLES.map((role) => (
                <option key={role} value={role} className="bg-dark-900 text-white">
                  {role}
                </option>
              ))}
            </select>
            <p className="text-xs text-dark-400 mt-1.5">
              The analyzer will evaluate your experience, keywords, and qualifications specifically for this role.
            </p>
          </div>

          {/* PDF File Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">
              Upload Resume
            </label>
            
            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                  isDragOver
                    ? 'border-brand-500 bg-brand-950/20 shadow-lg shadow-brand-500/10'
                    : 'border-dark-700 bg-dark-950/20 hover:border-brand-500/50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="application/pdf"
                  className="hidden"
                />
                <UploadCloud className={`w-12 h-12 mb-4 transition-transform duration-300 ${isDragOver ? 'scale-110 text-brand-400' : 'text-dark-400'}`} />
                <p className="text-sm font-semibold text-white mb-1">
                  Drag and drop your PDF resume here
                </p>
                <p className="text-xs text-dark-400 mb-4">or click to browse files on your device</p>
                <div className="flex gap-4 text-[10px] font-medium text-dark-400 bg-dark-900/50 px-3 py-1.5 rounded-full border border-dark-800">
                  <span>PDF only</span>
                  <span className="w-1 border-r border-dark-800" />
                  <span>Max size: 5MB</span>
                </div>
              </div>
            ) : (
              /* Selected file summary card */
              <div className="flex items-center justify-between p-4 rounded-xl bg-dark-900/60 border border-dark-800">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-red-950/40 border border-red-900/30 flex items-center justify-center text-red-400 shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate pr-4">{file.name}</p>
                    <p className="text-xs text-dark-400">{formatBytes(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  disabled={uploading}
                  className="p-2 text-dark-400 hover:text-red-400 rounded-lg hover:bg-red-950/10 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-dark-300">
                <span className="flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 text-brand-400 animate-pulse" />
                  Parsing and scoring resume...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-dark-800 rounded-full h-2">
                <div 
                  className="bg-gradient-brand h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Trigger */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-gradient-brand font-bold text-white text-sm hover:brightness-110 disabled:brightness-75 transition-all shadow-lg shadow-brand-500/20 cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing ATS Optimization...
              </>
            ) : (
              <>
                Start Analysis
              </>
            )}
          </button>
        </form>
      </div>

      {/* ATS Guidelines Note */}
      <div className="flex gap-3 p-4 rounded-xl bg-amber-950/10 border border-amber-900/20 text-xs text-amber-400/90 leading-relaxed">
        <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
        <p>
          <strong>ATS Tip:</strong> Ensure your PDF is text-searchable and not saved as an image scan. Image-only PDFs cannot be read by ATS scanners or this analyzer, resulting in zero score calculations.
        </p>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
