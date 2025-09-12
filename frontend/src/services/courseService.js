import api from './api';

export const fetchCourse = async (courseId) => {
  try {
    const response = await api.get(`/api/courses/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
};

export const fetchCourseModules = async (courseId) => {
  try {
    const response = await api.get(`/api/courses/${courseId}/modules`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course modules:', error);
    throw error;
  }
};

export const checkEnrollment = async (courseId) => {
  try {
    const response = await api.get(`/api/courses/${courseId}/enrollment`);
    return response.data.isEnrolled;
  } catch (error) {
    if (error.response?.status === 404) {
      return false; // Not enrolled
    }
    console.error('Error checking enrollment:', error);
    throw error;
  }
};

export const markLessonCompleted = async (courseId, moduleId, lessonId) => {
  try {
    await api.post(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/complete`);
    return true;
  } catch (error) {
    console.error('Error marking lesson as completed:', error);
    throw error;
  }
};
