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

export const useAuthStore = create((set, get) => ({
  user: parseJson('user', null),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        token,
        user,
        isAuthenticated: true,
        loading: false
      });
      return { success: true, message: response.data.message };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed. Try again.';
      set({ loading: false, error: errMsg });
      return { success: false, message: errMsg };
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        token,
        user,
        isAuthenticated: true,
        loading: false
      });
      return { success: true, message: response.data.message };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Invalid credentials.';
      set({ loading: false, error: errMsg });
      return { success: false, message: errMsg };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      error: null
    });
  },

  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put('/auth/profile', profileData);
      const { user } = response.data.data;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, loading: false });
      return { success: true, message: response.data.message };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Profile update failed.';
      set({ loading: false, error: errMsg });
      return { success: false, message: errMsg };
    }
  },

  fetchProfile: async () => {
    if (!get().token) return;
    try {
      const response = await api.get('/auth/profile');
      const { user } = response.data.data;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (err) {
      if (err.response?.status === 401) {
        get().logout();
      }
    }
  },

  forgotPassword: async (email) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/forgot-password', { email });
      set({ loading: false });
      return { success: true, message: response.data.message };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to request password reset.';
      set({ loading: false, error: errMsg });
      return { success: false, message: errMsg };
    }
  },

  resetPassword: async (token, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      set({ loading: false });
      return { success: true, message: response.data.message };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to reset password.';
      set({ loading: false, error: errMsg });
      return { success: false, message: errMsg };
    }
  }
}));
