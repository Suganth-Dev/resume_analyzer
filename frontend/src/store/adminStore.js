const parseJson = (key, fallback) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

import { create } from 'zustand';
import api from '../api';

export const useAdminStore = create((set, get) => ({
  adminUser: parseJson('adminUser', null),
  adminToken: localStorage.getItem('adminToken') || null,
  isAdminAuthenticated: !!localStorage.getItem('adminToken'),
  users: [],
  selectedUser: null,
  resumes: [],
  analytics: {
    summary: {
      totalUsers: 0,
      totalResumes: 0,
      totalAnalyses: 0,
      averageScore: 0,
      highestScore: 0,
      totalAdmins: 0,
      activeUsers: 0
    },
    charts: {
      uploadsByDate: [],
      registrationsByDate: [],
      roleDistribution: [],
      averageScoreTrends: [],
      topSkills: [],
      topMissingSkills: []
    }
  },
  loading: false,
  error: null,

  adminLogin: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/admin/login', { email, password });
      const { token, user } = response.data.data;
      
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(user));
      
      set({
        adminToken: token,
        adminUser: user,
        isAdminAuthenticated: true,
        loading: false
      });
      return { success: true, message: response.data.message };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Admin login failed.';
      set({ loading: false, error: errMsg });
      return { success: false, message: errMsg };
    }
  },

  adminLogout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    set({
      adminToken: null,
      adminUser: null,
      isAdminAuthenticated: false,
      users: [],
      selectedUser: null,
      resumes: [],
      error: null
    });
  },

  fetchAdminDashboardStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/admin/dashboard/stats');
      set({ analytics: response.data.data, loading: false });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to fetch dashboard stats.';
      set({ loading: false, error: errMsg });
    }
  },

  fetchAdminUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/admin/users');
      set({ users: response.data.data, loading: false });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to fetch platform users.';
      set({ loading: false, error: errMsg });
    }
  },

  fetchAdminUserById: async (id) => {
    set({ loading: true, error: null, selectedUser: null });
    try {
      const response = await api.get(`/admin/users/${id}`);
      set({ selectedUser: response.data.data, loading: false });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to fetch user details.';
      set({ loading: false, error: errMsg });
    }
  },

  updateAdminUser: async (id, userData) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/admin/users/${id}`, userData);
      set({ loading: false });
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update user profile.';
      set({ loading: false, error: errMsg });
      return { success: false, message: errMsg };
    }
  },

  deleteAdminUser: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/admin/users/${id}`);
      const filtered = get().users.filter(u => u._id !== id);
      set({ users: filtered, loading: false });
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to delete user.';
      set({ loading: false, error: errMsg });
      return { success: false, message: errMsg };
    }
  },

  fetchAdminResumes: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/admin/resumes');
      set({ resumes: response.data.data, loading: false });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to fetch platform resumes.';
      set({ loading: false, error: errMsg });
    }
  },

  deleteAdminResume: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/admin/resumes/${id}`);
      const filtered = get().resumes.filter(r => r._id !== id);
      set({ resumes: filtered, loading: false });
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to delete resume analysis.';
      set({ loading: false, error: errMsg });
      return { success: false, message: errMsg };
    }
  }
}));
