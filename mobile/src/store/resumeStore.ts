import { create } from 'zustand';
import api from '../services/api';

export interface ResumeAnalysis {
  _id: string;
  SelectedJobRole: string;
  ResumeScore: number;
  SkillMatchPercentage: number;
  MissingSkills: string[];
  Suggestions: string[];
  CreatedAt: string;
  filename?: string;
  originalName?: string;
}

interface StatsSummary {
  totalResumes: number;
  averageScore: number;
  bestScore: number;
  averageSkillMatch: number;
}

interface StatsCharts {
  scoreTrends: any[];
  roleBreakdown: any[];
  skillMatchPie: any[];
}

interface ResumeState {
  resumes: ResumeAnalysis[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  currentAnalysis: ResumeAnalysis | null;
  stats: {
    summary: StatsSummary;
    charts: StatsCharts;
  };
  loading: boolean;
  uploading: boolean;
  uploadProgress: number;
  error: string | null;
  fetchResumes: (search?: string, role?: string, page?: number, limit?: number) => Promise<void>;
  fetchResumeById: (id: string) => Promise<{ success: boolean; data?: ResumeAnalysis; message?: string }>;
  uploadResume: (fileUri: string, fileName: string, fileType: string, jobRole: string) => Promise<{ success: boolean; data?: ResumeAnalysis; message?: string }>;
  reanalyzeResume: (id: string, jobRole: string) => Promise<{ success: boolean; data?: ResumeAnalysis; message?: string }>;
  deleteResume: (id: string) => Promise<{ success: boolean; message?: string }>;
  fetchDashboardStats: () => Promise<void>;
}

export const useResumeStore = create<ResumeState>((set, get) => ({
  resumes: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  },
  currentAnalysis: null,
  stats: {
    summary: {
      totalResumes: 0,
      averageScore: 0,
      bestScore: 0,
      averageSkillMatch: 0,
    },
    charts: {
      scoreTrends: [],
      roleBreakdown: [],
      skillMatchPie: [],
    },
  },
  loading: false,
  uploading: false,
  uploadProgress: 0,
  error: null,

  fetchResumes: async (search: string = '', role: string = '', page: number = 1, limit: number = 10) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (role) params.append('role', role);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await api.get(`/resume?${params.toString()}`);
      const { resumes, pagination } = response.data.data;
      set({ resumes, pagination, loading: false });
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to fetch resumes.';
      set({ loading: false, error: errMsg });
    }
  },

  fetchResumeById: async (id: string) => {
    set({ loading: true, error: null, currentAnalysis: null });
    try {
      const response = await api.get(`/resume/${id}`);
      set({ currentAnalysis: response.data.data, loading: false });
      return { success: true, data: response.data.data };
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to fetch resume details.';
      set({ loading: false, error: errMsg });
      return { success: false, message: errMsg };
    }
  },

  uploadResume: async (fileUri: string, fileName: string, fileType: string, jobRole: string) => {
    set({ uploading: true, uploadProgress: 0, error: null });
    try {
      const formData = new FormData();
      // Form values for upload in React Native
      formData.append('resume', {
        uri: fileUri,
        name: fileName,
        type: fileType,
      } as any);
      formData.append('jobRole', jobRole);

      const response = await api.post('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            set({ uploadProgress: percentCompleted });
          }
        },
      });

      set({ uploading: false, currentAnalysis: response.data.data });
      return { success: true, data: response.data.data };
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to upload and analyze resume.';
      set({ uploading: false, error: errMsg });
      return { success: false, message: errMsg };
    }
  },

  reanalyzeResume: async (id: string, jobRole: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/resume/reanalyze/${id}`, { jobRole });
      const updatedData = response.data.data;

      const updatedResumes = get().resumes.map((r) => (r._id === id ? updatedData : r));

      set({
        resumes: updatedResumes,
        currentAnalysis: updatedData,
        loading: false,
      });
      return { success: true, data: updatedData };
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to re-analyze resume.';
      set({ loading: false, error: errMsg });
      return { success: false, message: errMsg };
    }
  },

  deleteResume: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/resume/${id}`);
      const filteredResumes = get().resumes.filter((r) => r._id !== id);
      set({ resumes: filteredResumes, loading: false });
      return { success: true };
    } catch (err: any) {
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
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to fetch dashboard statistics.';
      set({ loading: false, error: errMsg });
    }
  },
}));
