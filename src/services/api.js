import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login/email', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  requestPasswordReset: async (email) => {
    const response = await api.post('/auth/password-reset-request', { email });
    return response.data;
  },
  confirmPasswordReset: async (token, newPassword) => {
    const response = await api.post('/auth/password-reset-confirm', { 
      token, 
      new_password: newPassword 
    });
    return response.data;
  },
  updatePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/auth/password-update', { 
      current_password: currentPassword, 
      new_password: newPassword 
    });
    return response.data;
  },
};

// Contracts API calls
export const contractsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/contracts/', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/contracts/${id}`);
    return response.data;
  },
  getContract: async (id) => {
    const response = await api.get(`/contracts/${id}`);
    return response.data;
  },
  create: async (contractData) => {
    const response = await api.post('/contracts/', contractData);
    return response.data;
  },
  update: async (id, contractData) => {
    const response = await api.put(`/contracts/${id}`, contractData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/contracts/${id}`);
    return response.data;
  },
  upload: async (file, metadata) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(metadata || {}).forEach(key => {
      if (metadata[key] !== undefined && metadata[key] !== null) {
        formData.append(key, metadata[key]);
      }
    });
    const response = await api.post('/contracts/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// AI Analysis API calls
export const analysisAPI = {
  startAnalysis: async (contractId) => {
    const response = await api.post(`/contracts/${contractId}/analyze`);
    return response.data;
  },
  getStatus: async (contractId) => {
    const response = await api.get(`/contracts/${contractId}/analysis/status`);
    return response.data;
  },
  getResults: async (contractId) => {
    const response = await api.get(`/contracts/${contractId}/analysis`);
    return response.data;
  },
  getHistory: async (params = {}) => {
    const response = await api.get('/contracts/analysis/history', { params });
    return response.data;
  },
  retryAnalysis: async (contractId) => {
    const response = await api.post(`/contracts/${contractId}/analysis/retry`);
    return response.data;
  },
};

// Sharing API
export const sharingAPI = {
  generateShareLink: async (contractId) => {
    const response = await api.post(`/contracts/${contractId}/share`);
    return response.data;
  },
  
  getSharedContract: async (token) => {
    const response = await api.get(`/contracts/shared/${token}`);
    return response.data;
  },
  
  submitFeedback: async (token, feedbackData) => {
    const response = await api.post(`/contracts/shared/${token}/feedback`, feedbackData);
    return response.data;
  },
  
  getSharedComments: async (token) => {
    const response = await api.get(`/contracts/shared/${token}/comments`);
    return response.data;
  }
};

// Comments API
export const commentsAPI = {
  getContractComments: async (contractId) => {
    const response = await api.get(`/contracts/${contractId}/comments`);
    return response.data;
  },
  
  getUnreadCount: async () => {
    const response = await api.get('/comments/unread-count');
    return response.data;
  }
};

export default api; 