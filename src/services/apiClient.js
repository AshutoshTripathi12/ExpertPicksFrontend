// src/services/apiClient.js
import axios from 'axios';

// Logging for debug if VITE_API_BASE_URL was an issue
// console.log('Logging import.meta:', import.meta);
// console.log('Logging import.meta.env right before access:', import.meta.env);

//const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
// console.log('Resolved API_BASE_URL:', API_BASE_URL);

const API_BASE_URL =  'http://localhost:8080/api';
//const API_BASE_URL = 'https://expertpicksbackend.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to requests
apiClient.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;