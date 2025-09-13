import axios from 'axios';
import { getToken, removeToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await authApi.refreshToken(refreshToken);
          const { access_token, refresh_token } = response.data;
          
          // Save the new tokens
          localStorage.setItem('token', access_token);
          if (refresh_token) {
            localStorage.setItem('refreshToken', refresh_token);
          }
          
          // Update the authorization header
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        // If refresh fails, clear tokens and redirect to login
        removeToken();
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other error statuses
    if (error.response) {
      // Handle 403 Forbidden
      if (error.response.status === 403) {
        // Redirect to unauthorized page or show a message
        console.error('Access denied: You do not have permission to access this resource');
      }
      // Handle 404 Not Found
      else if (error.response.status === 404) {
        console.error('The requested resource was not found');
      }
      // Handle 500 Internal Server Error
      else if (error.response.status >= 500) {
        console.error('A server error occurred. Please try again later.');
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data) => {
    const params = new URLSearchParams();
    params.append('username', data.email);
    params.append('password', data.password);
    return api.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  register: (userData) => 
    api.post('/auth/register', userData, {
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  getMe: () => api.get('/users/me'),
  refreshToken: (refreshToken) => 
    api.post('/auth/refresh', { refresh_token: refreshToken }),
  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) =>
    api.post('/auth/reset-password', { token, new_password: newPassword }),
  updateProfile: (userData) =>
    api.put('/users/me', userData),
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { 
      current_password: currentPassword, 
      new_password: newPassword 
    }),
};

// Courses API
export const coursesApi = {
  getCourses: (params = {}) => 
    api.get('/courses/', { params }),
  getCourse: (courseId) => 
    api.get(`/courses/${courseId}`),
  getCourseModules: (courseId) => 
    api.get(`/courses/${courseId}/modules`),
  getModule: (courseId, moduleId) => 
    api.get(`/courses/${courseId}/modules/${moduleId}`),
  getLesson: (courseId, moduleId, lessonId) =>
    api.get(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`),
  enrollInCourse: (courseId) => 
    api.post(`/enrollments/`, { course_id: courseId }),
  getUserEnrollments: () => 
    api.get('/enrollments/me'),
};

// Quiz API
export const quizApi = {
  submitQuiz: (moduleId, answers) => api.post(`/quizzes/submit/${moduleId}`, { answers }),
  getQuiz: (quizId) => 
    api.get(`/quizzes/${quizId}`),
  submitQuizAnswers: (quizId, answers) => 
    api.post(`/quizzes/submit/${quizId}`, { answers }),
  getQuizResults: (quizId) => 
    api.get(`/quizzes/results/${quizId}`),
  getUserQuizAttempts: (quizId) =>
    api.get(`/quizzes/${quizId}/attempts`),
};

// Progress API
export const progressApi = {
  getUserProgress: (courseId = null) => 
    api.get('/quizzes/user/progress', { params: { course_id: courseId } }),
  completeLesson: (lessonId) => 
    api.post(`/lessons/${lessonId}/complete`),
  getLessonProgress: (lessonId) =>
    api.get(`/lessons/${lessonId}/progress`),
};

// Admin API
export const adminApi = {
  // Users
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  getUser: (userId) => api.get(`/admin/users/${userId}`),
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  
  // Courses
  getCourses: (params = {}) => api.get('/admin/courses', { params }),
  createCourse: (courseData) => api.post('/admin/courses', courseData),
  getCourse: (courseId) => api.get(`/admin/courses/${courseId}`),
  updateCourse: (courseId, courseData) => api.put(`/admin/courses/${courseId}`, courseData),
  deleteCourse: (courseId) => api.delete(`/admin/courses/${courseId}`),
  
  // Modules
  getModules: (courseId) => api.get(`/admin/courses/${courseId}/modules`),
  createModule: (courseId, moduleData) => api.post(`/admin/courses/${courseId}/modules`, moduleData),
  updateModule: (moduleId, moduleData) => api.put(`/admin/modules/${moduleId}`, moduleData),
  deleteModule: (moduleId) => api.delete(`/admin/modules/${moduleId}`),
  
  // Lessons
  getLessons: (moduleId) => api.get(`/admin/modules/${moduleId}/lessons`),
  createLesson: (moduleId, lessonData) => api.post(`/admin/modules/${moduleId}/lessons`, lessonData),
  updateLesson: (lessonId, lessonData) => api.put(`/admin/lessons/${lessonId}`, lessonData),
  deleteLesson: (lessonId) => api.delete(`/admin/lessons/${lessonId}`),
  
  // Quizzes
  getQuiz: (lessonId) => api.get(`/admin/lessons/${lessonId}/quiz`),
  createQuiz: (lessonId, quizData) => api.post(`/admin/lessons/${lessonId}/quiz`, quizData),
  updateQuiz: (quizId, quizData) => api.put(`/admin/quizzes/${quizId}`, quizData),
  deleteQuiz: (quizId) => api.delete(`/admin/quizzes/${quizId}`),
  
  // Questions
  getQuestions: (quizId) => api.get(`/admin/quizzes/${quizId}/questions`),
  addQuestion: (quizId, questionData) => api.post(`/admin/quizzes/${quizId}/questions`, questionData),
  updateQuestion: (questionId, questionData) => api.put(`/admin/questions/${questionId}`, questionData),
  deleteQuestion: (questionId) => api.delete(`/admin/questions/${questionId}`),
  
  // Enrollments
  getEnrollments: (params = {}) => api.get('/admin/enrollments', { params }),
  getEnrollment: (enrollmentId) => api.get(`/admin/enrollments/${enrollmentId}`),
  updateEnrollment: (enrollmentId, enrollmentData) => 
    api.put(`/admin/enrollments/${enrollmentId}`, enrollmentData),
  deleteEnrollment: (enrollmentId) => api.delete(`/admin/enrollments/${enrollmentId}`),
  
  // Analytics
  getDashboardStats: () => api.get('/admin/analytics/dashboard'),
  getCourseAnalytics: (courseId) => api.get(`/admin/analytics/courses/${courseId}`),
  getUserAnalytics: (userId) => api.get(`/admin/analytics/users/${userId}`),
};

// File Upload API
export const fileApi = {
  uploadFile: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },
  
  // Additional file operations
  getFile: (fileId) => api.get(`/files/${fileId}`),
  getFiles: (params = {}) => api.get('/files', { params }),
  deleteFile: (fileId) => api.delete(`/files/${fileId}`),
  
  // Image specific operations
  uploadImage: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('image', file);
    
    return api.post('/files/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },
  
  // Document specific operations
  uploadDocument: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('document', file);
    
    return api.post('/files/upload/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },
  
  // Video specific operations
  uploadVideo: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('video', file);
    
    return api.post('/files/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },
};

// Utility function to handle API errors consistently
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  let message = defaultMessage;
  let status = null;
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    status = error.response.status;
    message = error.response.data?.message || error.response.statusText || defaultMessage;
    
    // Handle specific error statuses
    if (status === 401) {
      message = 'Your session has expired. Please log in again.';
    } else if (status === 403) {
      message = 'You do not have permission to perform this action.';
    } else if (status === 404) {
      message = 'The requested resource was not found.';
    } else if (status >= 500) {
      message = 'A server error occurred. Please try again later.';
    }
  } else if (error.request) {
    // The request was made but no response was received
    message = 'No response from server. Please check your network connection.';
  } else {
    // Something happened in setting up the request that triggered an Error
    message = error.message || defaultMessage;
  }
  
  return { error: true, message, status };
};

// Helper function to handle successful responses
export const handleApiSuccess = (response, defaultMessage = 'Operation successful') => {
  return {
    success: true,
    data: response.data,
    message: response.data?.message || defaultMessage,
    status: response.status,
  };
};

// Helper function to make API calls with consistent error handling
export const apiRequest = async (apiCall, successMessage = 'Operation completed successfully') => {
  try {
    const response = await apiCall();
    return handleApiSuccess(response, successMessage);
  } catch (error) {
    return handleApiError(error);
  }
};

export default api;
