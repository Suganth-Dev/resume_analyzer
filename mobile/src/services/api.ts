import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import Constants from 'expo-constants';

// Dynamically get the local IP address if running via Expo Go on a physical device.
// Android emulator maps localhost via 10.0.2.2, iOS maps localhost directly.
const getBaseUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    // debuggerHost is usually something like '192.168.1.5:8081'
    const ipAddress = debuggerHost.split(':')[0];
    return `http://${ipAddress}:5000/api`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Error reading token from SecureStore:', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
