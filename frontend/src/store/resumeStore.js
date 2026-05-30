import { create } from 'zustand';
import api from '../api';

export const useResumeStore = create((set, get) => ({
  resumes: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  },
  currentAnalysis: null,
  stats: {
    summary: {
      totalResumes: 0,
      averageScore: 0,
      bestScore: 0,
      averageSkillMatch: 0
    },
    charts: {
      scoreTrends: [],
      roleBreakdown: [],
      skillMatchPie: []
    }
  },
  loading: false,
  uploading: false,
  uploadProgress: 0,
  error: null,

  fetchResumes: async (search = '', role = '', page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (role) query.append('role', role);
      query.append('page', page);
      query.append('limit', limit);

      const response = await api.get(`/resume?${query.toString()}`);
      const { resumes, pagination } = response.data.data;
      set({ resumes, pagination, loading: false });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to fetch resumes.';
      set({ loading: false, error: errMsg });
    }
  },

  fetchResumeById: async (id) => {
    set({ loading: true, error: null, currentAnalysis: null });
    try {
      const response = await api.get(`/resume/${id}`);
      set({ currentAnalysis: response.data.data, loading: false });
      return { success: true, data: response.data.data };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to fetch resume details.';
      set({ loading: false, error: errMsg });
      return { success: false, message: errMsg };
    }
  },

  uploadResume: async (file, jobRole) => {
    set({ uploading: true, uploadProgress: 0, error: null });
    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobRole', jobRole);

      const response = await api.post('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          set({ uploadProgress: percentCompleted });
        }
      });

      set({ uploading: false, currentAnalysis: response.data.data });
      return { success: true, data: response.data.data };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to upload and analyze resume.';
      set({ uploading: false, error: errMsg });
      return { success: false, message: errMsg };
    }
  },

  reanalyzeResume: async (id, jobRole) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/resume/reanalyze/${id}`, { jobRole });
      const updatedData = response.data.data;
      
      // Update local lists if they exist
      const updatedResumes = get().resumes.map(r => r._id === id ? updatedData : r);
      
      set({ 
        resumes: updatedResumes, 
        currentAnalysis: updatedData, 
        loading: false 
      });
      return { success: true, data: updatedData };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to re-analyze resume.';
      set({ loading: false, error: errMsg });
      return { success: false, message: errMsg };
    }
  },

  deleteResume: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/resume/${id}`);
      const filteredResumes = get().resumes.filter(r => r._id !== id);
      set({ resumes: filteredResumes, loading: false });
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to delete resume.';
      set({ loading: false, error: errMsg });
      return { success: false, message: errMsg };
    }
  },

  fetchDashboardStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/dashboard/stats');
      set({ stats: response.data.data, loading: false });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to fetch dashboard statistics.';
      set({ loading: false, error: errMsg });
    }
  }
}));
