import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Progress,
  Text,
  VStack,
  HStack,
  Button,
  Radio,
  RadioGroup,
  Stack,
  useToast,
  Spinner,
  IconButton
} from "@chakra-ui/react";
import { CheckCircle, Lock, Unlock, ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { quizApi, progressApi, coursesApi } from "../../services/api";
import ReactPlayer from "react-player/youtube";
import { useParams, useNavigate } from "react-router-dom";

// Content Sidebar Component
const ContentSidebar = ({ modules, currentModuleId, onModuleSelect, userProgress }) => (
  <Box w="300px" borderRight="1px" borderColor="gray.200" p={4} overflowY="auto">
    <VStack align="stretch" spacing={2}>
      {modules.map((module) => {
        const progress = userProgress[module.id];
        const isActive = currentModuleId === module.id;

        const getIcon = () => {
          if (progress?.status === "completed") return <CheckCircle size={16} color="green" />;
          if (progress?.status === "in_progress") return <Unlock size={16} color="blue" />;
          return <Lock size={16} color="gray" />;
        };

        return (
          <Box
            key={module.id}
            p={3}
            borderRadius="md"
            bg={isActive ? "blue.50" : "transparent"}
            borderLeftWidth={isActive ? "4px" : "1px"}
            borderLeftColor={isActive ? "blue.500" : "gray.200"}
            cursor="pointer"
            onClick={() => onModuleSelect(module.id)}
            _hover={{ bg: "gray.50" }}
          >
            <HStack justify="space-between">
              <Text fontWeight={isActive ? "semibold" : "normal"}>
                {module.title}
              </Text>
              {getIcon()}
            </HStack>
            {progress?.progress > 0 && (
              <Progress value={progress.progress} size="xs" colorScheme="blue" mt={2} borderRadius="full" />
            )}
          </Box>
        );
      })}
    </VStack>
  </Box>
);

// Content Viewer Component
const ContentViewer = ({ content, onComplete, onNext, onPrevious, hasNext, hasPrevious }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const toast = useToast();

  // Fetch quiz data when content changes
  useEffect(() => {
    const fetchQuiz = async () => {
      if (content?.type === 'quiz' && content.id) {
        setIsLoading(true);
        try {
          const response = await quizApi.getQuiz(content.id);
          setQuizData(response.data);
        } catch (error) {
          console.error('Error fetching quiz:', error);
          toast({
            title: 'Error',
            description: 'Failed to load quiz. Please try again.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchQuiz();
  }, [content?.id, content?.type, toast]);

  const handleAnswerSelect = (questionId, answerId) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const calculateScore = () => {
    if (!quizData?.questions) return 0;
    
    let correct = 0;
    quizData.questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    
    return Math.round((correct / quizData.questions.length) * 100);
  };

  const handleSubmit = async () => {
    if (content.type === 'quiz') {
      try {
        setIsLoading(true);
        const finalScore = calculateScore();
        
        // Submit quiz answers to the backend
        await quizApi.submitQuizAnswers(content.id, {
          answers: selectedAnswers
        });
        
        setScore(finalScore);
        setQuizSubmitted(true);
        
        // Call onComplete with the score
        onComplete(finalScore);
        
        toast({
          title: finalScore >= 70 ? 'Quiz Passed!' : 'Quiz Completed',
          description: `You scored ${finalScore}%`,
          status: finalScore >= 70 ? 'success' : 'info',
          duration: 5000,
          isClosable: true,
        });
        
      } catch (error) {
        console.error('Error submitting quiz:', error);
        toast({
          title: 'Error',
          description: 'Failed to submit quiz. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // For non-quiz content, just mark as complete
      try {
        setIsLoading(true);
        await progressApi.completeLesson(content.id);
        onComplete();
      } catch (error) {
        console.error('Error marking content as complete:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Flex justify="center" align="center" h="50vh">
          <Spinner size="xl" />
        </Flex>
      );
    }

    const contentTypes = {
      youtube: (
        <Box>
          <Box position="relative" pt="56.25%" borderRadius="lg" overflow="hidden" mb={6}>
            <ReactPlayer
              url={content.mediaUrl}
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0 }}
              controls
              playing
            />
          </Box>
          <Box mt={4}>
            <Text fontSize="xl" fontWeight="semibold">{content.title}</Text>
            <Text mt={2} color="gray.600">{content.description}</Text>
          </Box>
        </Box>
      ),
      quiz: (
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={4}>Quiz: {content.title}</Text>
          <Text color="gray.600" mb={6}>{content.description}</Text>
          
          {quizSubmitted && (
            <Box bg="green.50" p={6} borderRadius="lg" mb={6}>
              <Text fontSize="xl" fontWeight="bold" color="green.600" mb={2}>
                Quiz Completed! Your Score: {score}%
              </Text>
              <Text>Review your answers below:</Text>
            </Box>
          )}

          <VStack spacing={8} align="stretch">
            {quizData?.questions?.map((question, index) => (
              <Box key={question.id} p={6} borderWidth="1px" borderRadius="lg">
                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                  {index + 1}. {question.text}
                </Text>
                <RadioGroup 
                  value={selectedAnswers[question.id] || ''}
                  onChange={(value) => handleAnswerSelect(question.id, value)}
                  isDisabled={quizSubmitted}
                >
                  <Stack spacing={3}>
                    {question.options?.map((option) => {
                      const isCorrect = quizSubmitted && option.id === question.correctAnswer;
                      const isSelected = selectedAnswers[question.id] === option.id;
                      const isWrong = quizSubmitted && isSelected && !isCorrect;
                      
                      return (
                        <Box 
                          key={option.id}
                          p={3} 
                          borderRadius="md"
                          borderWidth="1px"
                          borderColor={
                            isCorrect 
                              ? 'green.200' 
                              : isWrong 
                                ? 'red.200' 
                                : isSelected 
                                  ? 'blue.200' 
                                  : 'gray.200'
                          }
                          bg={
                            isCorrect 
                              ? 'green.50' 
                              : isWrong 
                                ? 'red.50' 
                                : isSelected 
                                  ? 'blue.50' 
                                  : 'white'
                          }
                        >
                          <Radio 
                            value={option.id}
                            colorScheme={isCorrect ? 'green' : isWrong ? 'red' : 'blue'}
                            isDisabled={quizSubmitted}
                          >
                            {option.text}
                          </Radio>
                          {quizSubmitted && (
                            <Box mt={1} ml={6} color={isCorrect ? 'green.600' : isWrong ? 'red.600' : 'gray.500'}>
                              {isCorrect && (
                                <HStack spacing={1}>
                                  <Check size={16} />
                                  <Text>Correct answer</Text>
                                </HStack>
                              )}
                              {isWrong && (
                                <HStack spacing={1}>
                                  <X size={16} />
                                  <Text>Incorrect. Correct answer is: {
                                    question.options.find(o => o.id === question.correctAnswer)?.text
                                  }</Text>
                                </HStack>
                              )}
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                </RadioGroup>
              </Box>
            ))}
          </VStack>
        </Box>
      ),
      default: (
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={4}>{content.title}</Text>
          <Box className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content.content }} />
        </Box>
      )
    };

    return contentTypes[content.type] || contentTypes.default;
  };

  return (
    <Box flex={1} p={8} overflowY="auto">
      {renderContent()}
      <HStack mt={8} justify="space-between">
        <IconButton
          icon={<ChevronLeft />}
          aria-label="Previous"
          isDisabled={!hasPrevious || isLoading}
          onClick={onPrevious}
        />
        <Button 
          colorScheme="blue" 
          onClick={handleSubmit}
          isDisabled={(content.type === 'quiz' && !quizSubmitted && !Object.keys(selectedAnswers).length) || isLoading}
          isLoading={isLoading}
          loadingText={content.type === 'quiz' ? 'Submitting...' : 'Saving...'}
        >
          {content.type === 'quiz' 
            ? (quizSubmitted ? (hasNext ? 'Next' : 'Finish') : 'Submit Quiz') 
            : 'Mark as Complete'}
        </Button>
        {!quizSubmitted && content.type === 'quiz' && (
          <IconButton
            icon={<ChevronRight />}
            aria-label="Next"
            isDisabled={!hasNext}
            onClick={onNext}
          />
        )}
      </HStack>
    </Box>
  );
};

// Main Course Content Layout
const CourseContentLayout = () => {
  const { user } = useAuth();
  const { courseId, moduleId: urlModuleId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [state, setState] = useState({
    currentModuleId: urlModuleId || null,
    modules: [],
    course: {},
    isLoading: true,
    error: null,
    userProgress: {}
  });

  // Fetch course data and modules
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Fetch course details and modules
        const [courseResponse, modulesResponse] = await Promise.all([
          coursesApi.getCourse(courseId),
          coursesApi.getCourseModules(courseId)
        ]);
        
        // Fetch user progress if authenticated
        let userProgress = {};
        if (user) {
          try {
            const progressResponse = await progressApi.getUserProgress(courseId);
            userProgress = progressResponse.data || {};
          } catch (progressError) {
            console.error('Error fetching user progress:', progressError);
          }
        }

        // Set initial module if not set in URL
        let currentModule = urlModuleId;
        if (!currentModule && modulesResponse.data?.length > 0) {
          currentModule = modulesResponse.data[0].id;
          // Update URL to reflect the first module
          navigate(`/course/${courseId}/module/${currentModule}`, { replace: true });
        }

        setState(prev => ({
          ...prev,
          modules: modulesResponse.data || [],
          course: courseResponse.data,
          currentModuleId: currentModule,
          userProgress,
          isLoading: false
        }));

      } catch (error) {
        console.error('Error fetching course data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load course data. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setState(prev => ({
          ...prev,
          error: 'Failed to load course data',
          isLoading: false
        }));
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, urlModuleId, user, navigate, toast]);

  // Update current module when URL changes
  useEffect(() => {
    if (urlModuleId && urlModuleId !== state.currentModuleId) {
      setState(prev => ({
        ...prev,
        currentModuleId: urlModuleId
      }));
    }
  }, [urlModuleId, state.currentModuleId]);

  const handleModuleSelect = (moduleId) => {
    navigate(`/course/${courseId}/module/${moduleId}`);
  };

  const handleContentComplete = async (quizScore = null) => {
    const currentModuleIndex = state.modules.findIndex(m => m.id === state.currentModuleId);
    const nextModule = state.modules[currentModuleIndex + 1];
    
    if (user) {
      try {
        await progressApi.completeLesson({
          moduleId: state.currentModuleId,
          score: quizScore,
          status: quizScore >= 70 ? 'completed' : 'in_progress'
        });
        
        // Update local state
        setState(prev => ({
          ...prev,
          userProgress: {
            ...prev.userProgress,
            [state.currentModuleId]: {
              status: quizScore >= 70 ? 'completed' : 'in_progress',
              score: quizScore,
              completedAt: new Date().toISOString()
            }
          }
        }));
        
        // Navigate to next module if available
        if (nextModule) {
          navigate(`/course/${courseId}/module/${nextModule.id}`);
        } else {
          // Course completed
          toast({
            title: 'Course Completed!',
            description: 'Congratulations on completing the course!',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error('Error updating progress:', error);
        toast({
          title: 'Error',
          description: 'Failed to update your progress. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } else if (nextModule) {
      // For non-authenticated users, just navigate to next module
      navigate(`/course/${courseId}/module/${nextModule.id}`);
    }
  };

  const currentModule = state.modules.find(m => m.id === state.currentModuleId);
  const currentModuleIndex = state.modules.findIndex(m => m.id === state.currentModuleId);
  const hasNext = currentModuleIndex < state.modules.length - 1;
  const hasPrevious = currentModuleIndex > 0;

  if (state.isLoading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (state.error) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Text color="red.500">{state.error}</Text>
      </Flex>
    );
  }

  if (!currentModule) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Text>No module found</Text>
      </Flex>
    );
  }

  return (
    <Flex h="100vh" overflow="hidden">
      <ContentSidebar
        modules={state.modules}
        currentModuleId={state.currentModuleId}
        onModuleSelect={handleModuleSelect}
        userProgress={state.userProgress}
      />
      <Box flex={1} overflowY="auto">
        <ContentViewer
          content={currentModule}
          onComplete={handleContentComplete}
          onNext={() => {
            const nextModule = state.modules[currentModuleIndex + 1];
            if (nextModule) {
              navigate(`/course/${courseId}/module/${nextModule.id}`);
            }
          }}
          onPrevious={() => {
            const prevModule = state.modules[currentModuleIndex - 1];
            if (prevModule) {
              navigate(`/course/${courseId}/module/${prevModule.id}`);
            }
          }}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
        />
      </Box>
    </Flex>
  );
};

export default CourseContentLayout;
