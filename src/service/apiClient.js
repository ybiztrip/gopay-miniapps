// ============================================================
// src/services/apiClient.js
// Base HTTP client — konfigurasi satu kali, pakai di mana saja
// ============================================================

import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://dev-gopay-api.biztrip.id/api/v1',
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
  (response) => {
    // ✅ Jika responseType blob, jangan di-unwrap, return as-is
    if (response.config.responseType === 'blob') return response;
    return response;
  },
  (error) => {
    const status = error.response?.status;

    // ✅ Jangan proses error blob sebagai JSON
    if (error.response?.config?.responseType === 'blob') {
      return Promise.reject(error);
    }

    if (status === 401) {
      localStorage.removeItem('gopayAuthToken');
      localStorage.removeItem('gopayProfile');
    }
    if (status === 404) console.warn('Resource not found:', error.config.url);
    return Promise.reject(error);
  }
);

export default apiClient;