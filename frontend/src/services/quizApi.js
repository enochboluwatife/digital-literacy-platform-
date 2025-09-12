import api from './api';

export const quizApi = {
  // Get quiz questions for a module
  getQuizQuestions: async (moduleId) => {
    try {
      const response = await api.get(`/quizzes/module/${moduleId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      throw error;
    }
  },

  // Submit quiz answers
  submitQuiz: async (moduleId, submission) => {
    try {
      const response = await api.post(`/quizzes/module/${moduleId}/submit`, submission);
      return response.data;
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  },

  // Get quiz results for a module
  getQuizResults: async (moduleId) => {
    try {
      const response = await api.get(`/quizzes/module/${moduleId}/results`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      throw error;
    }
  },

  // Get user's quiz attempts for a module
  getQuizAttempts: async (moduleId) => {
    try {
      const response = await api.get(`/quizzes/module/${moduleId}/attempts`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz attempts:', error);
      throw error;
    }
  },

  // Get a specific quiz attempt
  getQuizAttempt: async (attemptId) => {
    try {
      const response = await api.get(`/quizzes/attempts/${attemptId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz attempt:', error);
      throw error;
    }
  }
};

export default quizApi;
