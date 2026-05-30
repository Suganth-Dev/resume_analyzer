import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  updateProfile: (profileData: { name: string; email: string; currentPassword?: string; newPassword?: string }) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const userStr = await SecureStore.getItemAsync('user');
      if (token && userStr) {
        set({
          token,
          user: JSON.parse(userStr),
          isAuthenticated: true,
        });
      }
    } catch (e) {
      console.warn('Error initializing auth store:', e);
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, user } = response.data.data;

      await SecureStore.setItemAsync('token', token);
      await SecureStore.setItemAsync('user', JSON.stringify(user));

      set({
        token,
        user,
        isAuthenticated: true,
        loading: false,
      });
      return { success: true, message: response.data.message };
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Registration failed. Try again.';
      set({ loading: false, error: errMsg });
      return { success: false, message: errMsg };
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data.data;

      await SecureStore.setItemAsync('token', token);
      await SecureStore.setItemAsync('user', JSON.stringify(user));

      set({
        token,
        user,
        isAuthenticated: true,
        loading: false,
      });
      return { success: true, message: response.data.message };
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Login failed. Invalid credentials.';
      set({ loading: false, error: errMsg });
      return { success: false, message: errMsg };
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  updateProfile: async (profileData: { name: string; email: string; currentPassword?: string; newPassword?: string }) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put('/auth/profile', profileData);
      const { user } = response.data.data;
      await SecureStore.setItemAsync('user', JSON.stringify(user));
      set({ user, loading: false });
      return { success: true, message: response.data.message };
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Profile update failed.';
      set({ loading: false, error: errMsg });
      return { success: false, message: errMsg };
    }
  },

  forgotPassword: async (email: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/forgot-password', { email });
      set({ loading: false });
      return { success: true, message: response.data.message };
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to request password reset.';
      set({ loading: false, error: errMsg });
      return { success: false, message: errMsg };
    }
  },
}));
