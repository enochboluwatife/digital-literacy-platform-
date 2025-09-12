import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Flex, Spinner, Center, useToast, Alert, AlertIcon } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { coursesApi } from "../services/api";

import CourseHeader from "../components/course/CourseHeader";
import CourseTabs from "../components/course/CourseTabs";
import CourseSidebar from "../components/course/CourseSidebar";
import QuizModal from "../components/quiz/QuizModal";

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await coursesApi.getCourse(courseId);
        setCourse(response);
        
        // Set first module as active by default
        if (response.modules?.length > 0) {
          setActiveModule({
            ...response.modules[0],
            index: 0
          });
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleModuleClick = (module, index) => {
    if (module.content_type === 'quiz') {
      setIsQuizModalOpen(true);
    } else {
      setActiveModule({ ...module, index });
    }
  };

  const handleQuizComplete = (results) => {
    setQuizResults(results);
    setIsQuizModalOpen(false);
    
    // Update local course data with quiz completion
    if (course && activeModule) {
      const updatedModules = [...course.modules];
      updatedModules[activeModule.index] = {
        ...updatedModules[activeModule.index],
        completed: true
      };
      
      setCourse(prev => ({
        ...prev,
        modules: updatedModules
      }));
    }
  };

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Box p={6} maxW="4xl" mx="auto">
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </Box>
    );
  }

  if (!course) {
    return (
      <Center h="400px">
        <Text>Course not found</Text>
      </Center>
    );
  }

  return (
    <Box maxW="7xl" mx="auto" p={6}>
      <Flex gap={8} direction={{ base: 'column', lg: 'row' }}>
        <Box flex={1}>
          <CourseHeader 
            course={course} 
            onBack={() => navigate('/courses')} 
          />
          
          <CourseTabs 
            course={course} 
            activeModule={activeModule}
            onModuleClick={handleModuleClick}
          />
        </Box>
        
        <CourseSidebar 
          course={course} 
          quizResults={quizResults}
          activeModule={activeModule}
          onModuleSelect={handleModuleClick}
        />
      </Flex>

      <QuizModal 
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        moduleId={activeModule?.id}
        onComplete={handleQuizComplete}
        results={quizResults}
      />
    </Box>
  );
};

export default CourseDetail;
