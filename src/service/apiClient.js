// ============================================================
// src/services/apiClient.js
// Base HTTP client — konfigurasi satu kali, pakai di mana saja
// ============================================================

import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ---- Request Interceptor ----
// Otomatis sisipkan auth token jika ada
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response Interceptor ----
// Normalisasi error agar lebih mudah di-handle di UI
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      // Token expired — redirect ke login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    if (status === 404) console.warn('Resource not found:', error.config.url);
    return Promise.reject(error);
  }
);

export default apiClient;