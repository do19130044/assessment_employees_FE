import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  getByDepartment: (departmentId) => api.get(`/users/departments/${departmentId}`),
};

// Departments API
export const departmentsAPI = {
  getAll: () => api.get('/departments'),
};

// Assessment Templates API
export const assessmentTemplatesAPI = {
  getAll: () => api.get('/assessment-templates'),
  getById: (id) => api.get(`/assessment-templates/${id}`),
  create: (templateData) => api.post('/assessment-templates', templateData),
  update: (id, templateData) => api.put(`/assessment-templates/${id}`, templateData),
  delete: (id) => api.delete(`/assessment-templates/${id}`),
};

// Assessment Results API
export const assessmentResultsAPI = {
  getAll: () => api.get('/assessment-results'),
  getById: (id) => api.get(`/assessment-results/${id}`),
  create: (resultData) => api.post('/assessment-results', resultData),
  update: (id, resultData) => api.put(`/assessment-results/${id}`, resultData),
  delete: (id) => api.delete(`/assessment-results/${id}`),
  getByUser: (userId) => api.get(`/assessment-results/user/${userId}`),
};

export default api;