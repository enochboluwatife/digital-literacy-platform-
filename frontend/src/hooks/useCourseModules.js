import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { fetchCourseModules, checkEnrollment, markLessonCompleted } from '../services/courseService';

export const useCourseModules = (courseId) => {
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [modulesData, isEnrolled] = await Promise.all([
        fetchCourseModules(courseId),
        checkEnrollment(courseId).catch(() => false)
      ]);
      
      setModules(modulesData);
      setEnrolled(isEnrolled);
      
      // Calculate overall progress
      const totalLessons = modulesData.reduce(
        (acc, module) => acc + (module.lessons?.length || 0), 0
      );
      const completedLessons = modulesData.reduce(
        (acc, module) => acc + (module.lessons?.filter(l => l.completed).length || 0), 0
      );
      
      setProgress(totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0);
    } catch (err) {
      console.error('Error loading course data:', err);
      setError('Failed to load course content. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  const handleLessonComplete = async (moduleId, lessonId) => {
    try {
      await markLessonCompleted(courseId, moduleId, lessonId);
      
      setModules(prev => prev.map(module => {
        if (module.id === moduleId) {
          const updatedLessons = module.lessons.map(lesson => 
            lesson.id === lessonId ? { ...lesson, completed: true } : lesson
          );
          return { ...module, lessons: updatedLessons };
        }
        return module;
      }));
      
      // Update progress
      setProgress(prev => {
        const totalLessons = modules.reduce(
          (acc, m) => acc + (m.lessons?.length || 0), 0
        );
        const completedLessons = modules.reduce(
          (acc, m) => acc + (m.lessons?.filter(l => l.completed || 
            (m.id === moduleId && l.id === lessonId)).length || 0), 0
        );
        return Math.round((completedLessons / totalLessons) * 100);
      });
      
      return true;
    } catch (err) {
      console.error('Error completing lesson:', err);
      return false;
    }
  };

  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId, loadData]);

  return {
    modules,
    isLoading,
    error,
    enrolled,
    progress,
    refresh: loadData,
    handleLessonComplete,
  };
};
