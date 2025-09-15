import axios from 'axios';
import { getToken } from '../utils/auth';

// Utility functions for authentication
const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

const redirectToLogin = (message = 'Please log in to continue') => {
  const redirectUrl = window.location.pathname + window.location.search;
  if (redirectUrl !== '/login') {
    sessionStorage.setItem('redirectAfterLogin', redirectUrl);
  }
  window.location.href = `/login?message=${encodeURIComponent(message)}`;
};

// Get API URL from environment variables with fallback
const getApiUrl = () => {
  let url = '';
  if (import.meta.env.DEV) {
    url = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  } else {
    url = import.meta.env.VITE_API_URL || 'https://digital-literacy-platform.onrender.com';
  }
  // Ensure URL doesn't end with a slash and add /api if not present
  url = url.endsWith('/') ? url.slice(0, -1) : url;
  if (!url.endsWith('/api')) {
    url += '/api';
  }
  return url;
};

const API_URL = getApiUrl();
console.log('Using API URL:', API_URL);

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL, // The API_URL already includes /api if needed
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    config.metadata = { startTime: Date.now() };

    if (token) {
      const cleanToken = token.replace(/^"|"$/g, '').trim();
      if (cleanToken) {
        config.headers.Authorization = `Bearer ${cleanToken}`;
      }
    } else if (!config.url.includes('/auth/')) {
      console.warn('[API] No authentication token found for protected endpoint:', config.url);
    }

    return config;
  },
  (error) => Promise.reject({
    message: 'Failed to process request',
    error: error.message,
    code: 'REQUEST_ERROR'
  })
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const response = error.response;

    // Handle 401 Unauthorized
    if (response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await authApi.refreshToken(refreshToken);
          const { access_token, refresh_token } = refreshResponse.data;
          
          if (access_token) {
            localStorage.setItem('token', access_token);
            if (refresh_token) {
              localStorage.setItem('refreshToken', refresh_token);
            }
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            return api(originalRequest);
          }
        }
        throw new Error('No valid refresh token');
      } catch (refreshError) {
        clearAuthData();
        if (!window.location.pathname.includes('/login')) {
          redirectToLogin('Your session has expired. Please log in again.');
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API Modules
const createApiModule = (basePath) => ({
  getAll: (params = {}) => api.get(basePath, { params }),
  get: (id) => api.get(`${basePath}/${id}`),
  create: (data) => api.post(basePath, data),
  update: (id, data) => api.put(`${basePath}/${id}`, data),
  delete: (id) => api.delete(`${basePath}/${id}`),
});

// Auth API
export const authApi = {
  login: (credentials) => {
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);
    return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  },
  register: (userData) => api.post('/auth/register', userData, { 
    headers: { 'Content-Type': 'application/json' } 
  }),
  getMe: () => api.get('/auth/me'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
  updateProfile: (data) => api.put('/auth/me', data),
  requestPasswordReset: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    return Promise.resolve({ success: true });
  },
};

// Courses API
export const coursesApi = {
  ...createApiModule('/courses'),
  getCourses: (params = {}) => api.get('/courses', { params }),
  getCourse: (courseId) => api.get(`/courses/${courseId}`),
  getModules: (courseId) => api.get(`/courses/${courseId}/modules`),
  getModule: (courseId, moduleId) => api.get(`/courses/${courseId}/modules/${moduleId}`),
  getLesson: (courseId, moduleId, lessonId) => 
    api.get(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`),
  enroll: (courseId) => api.post('/enrollments', { course_id: courseId }),
  getEnrollments: () => api.get('/enrollments/me'),
};

// Quiz API
export const quizApi = {
  get: (quizId) => api.get(`/quizzes/${quizId}`),
  getQuizQuestions: (moduleId) => api.get(`/quizzes/module/${moduleId}`),
  submit: (quizId, answers) => api.post(`/quizzes/submit/${quizId}`, { answers }),
  submitQuiz: (moduleId, submission) => api.post(`/quizzes/submit/${moduleId}`, submission),
  getResults: (moduleId) => api.get(`/quizzes/results/${moduleId}`),
  getAttempts: (quizId) => api.get(`/quizzes/${quizId}/attempts`),
};

// Progress API
export const progressApi = {
  getUserProgress: (courseId = null) => 
    api.get('/progress', { params: { course_id: courseId } }),
  completeLesson: (lessonId) => api.post(`/lessons/${lessonId}/complete`),
  getLessonProgress: (lessonId) => api.get(`/lessons/${lessonId}/progress`),
};

// File Upload Helper
const createFileUploader = (fieldName, endpoint) => (file, onProgress) => {
  const formData = new FormData();
  formData.append(fieldName, file);
  return api.post(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress,
  });
};

// File API
export const fileApi = {
  upload: createFileUploader('file', '/files/upload'),
  uploadImage: createFileUploader('image', '/files/upload/image'),
  get: (fileId) => api.get(`/files/${fileId}`),
  getAll: (params = {}) => api.get('/files', { params }),
  delete: (fileId) => api.delete(`/files/${fileId}`),
};

// Admin API
export const adminApi = {
  // User management
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  // Course management
  getCourses: (params = {}) => api.get('/admin/courses', { params }),
  getCourse: (id) => api.get(`/admin/courses/${id}`),
  createCourse: (data) => api.post('/admin/courses', data),
  updateCourse: (id, data) => api.put(`/admin/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),
  
  // Enrollment management
  getEnrollments: (params = {}) => api.get('/admin/enrollments', { params }),
  getEnrollment: (id) => api.get(`/admin/enrollments/${id}`),
  createEnrollment: (data) => api.post('/admin/enrollments', data),
  updateEnrollment: (id, data) => api.put(`/admin/enrollments/${id}`, data),
  deleteEnrollment: (id) => api.delete(`/admin/enrollments/${id}`),
  
  // Analytics
  getStats: () => api.get('/admin/stats'),
  getActivityLogs: (params = {}) => api.get('/admin/activity-logs', { params }),
};

// Response Handlers
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  const response = error.response || {};
  let message = response.data?.message || error.message || defaultMessage;
  const status = response.status;

  if (status === 401) message = 'Your session has expired. Please log in again.';
  else if (status === 403) message = 'You do not have permission to perform this action.';
  else if (status === 404) message = 'The requested resource was not found.';
  else if (status >= 500) message = 'A server error occurred. Please try again later.';
  else if (!error.response) message = 'Unable to connect to the server. Please check your connection.';

  return { error: true, message, status };
};

export const handleApiSuccess = (response, defaultMessage = 'Operation successful') => ({
  success: true,
  data: response.data,
  message: response.data?.message || defaultMessage,
  status: response.status,
});

export const apiRequest = async (apiCall, successMessage = 'Operation completed successfully') => {
  try {
    const response = await apiCall();
    return handleApiSuccess(response, successMessage);
  } catch (error) {
    return handleApiError(error);
  }
};

export default api;