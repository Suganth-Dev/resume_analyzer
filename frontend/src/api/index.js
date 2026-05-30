import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Authorization Bearer token to every request
api.interceptors.request.use(
  (config) => {
    const isAdminRequest = config.url && config.url.includes('/admin');
    const token = isAdminRequest 
      ? localStorage.getItem('adminToken') 
      : localStorage.getItem('token');
      
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle global response failures, such as token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optional: force reload to boot state or let stores handle it
    }
    return Promise.reject(error);
  }
);

export default api;
