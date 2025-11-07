console.log("VITE_API_BASE_URL (from api.ts):", import.meta.env.VITE_API_BASE_URL);

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  withCredentials: true,
});

{/* attach token to every request */}
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token'); // Get token from local storage
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Attach it as a Bearer token
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;