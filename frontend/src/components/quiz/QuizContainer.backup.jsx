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
} from "@chakra-ui/react";
import { CheckCircle, Lock, Unlock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { quizApi, progressApi, coursesApi } from "../../services/api";
import ReactPlayer from "react-player/youtube";
import { useParams, useNavigate } from "react-router-dom";

/* ---------------- Sidebar ---------------- */
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
              <Text fontWeight={isActive ? "semibold" : "normal"}>{module.title}</Text>
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

/* ---------------- Content Viewer ---------------- */
const ContentViewer = ({ content, onComplete }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);

  const toast = useToast();

  useEffect(() => {
    const fetchQuiz = async () => {
      if (content?.type === "quiz" && content.id) {
        setIsLoading(true);
        try {
          const response = await quizApi.getQuiz(content.id);
          setQuizData(response.data);
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load quiz. Please try again.",
            status: "error",
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
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const handleSubmit = async () => {
    if (content.type === "quiz") {
      try {
        setIsLoading(true);
        const response = await quizApi.submitQuizAnswers(content.id, { answers: selectedAnswers });
        const { score: finalScore, passed } = response.data;

        setScore(finalScore);
        setQuizSubmitted(true);

        await progressApi.completeLesson(content.id);
        toast({
          title: passed ? "Quiz Passed!" : "Quiz Completed",
          description: `You scored ${finalScore}%`,
          status: passed ? "success" : "info",
          duration: 5000,
          isClosable: true,
        });
        onComplete(finalScore);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to submit quiz. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        setIsLoading(true);
        await progressApi.completeLesson(content.id);
        onComplete();
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!content) return <Spinner />;

  return (
    <Box flex="1" p={6} overflowY="auto">
      {content.type === "youtube" && (
        <>
          <Box position="relative" pt="56.25%" borderRadius="lg" overflow="hidden" mb={6}>
            <ReactPlayer url={content.mediaUrl} width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }} controls />
          </Box>
          <Text fontSize="xl" fontWeight="semibold">{content.title}</Text>
          <Text mt={2} color="gray.600">{content.description}</Text>
        </>
      )}

      {content.type === "video" && (
        <>
          <video controls width="100%" style={{ maxHeight: "70vh", borderRadius: "0.5rem" }}>
            <source src={content.mediaUrl} type="video/mp4" />
          </video>
          <Text fontSize="xl" fontWeight="semibold" mt={4}>{content.title}</Text>
          <Text mt={2} color="gray.600">{content.description}</Text>
        </>
      )}

      {content.type === "quiz" && (
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={4}>Quiz: {content.title}</Text>
          {content.questions?.map((q, i) => (
            <Box key={q.id} p={4} borderWidth="1px" borderRadius="lg" mb={4}>
              <Text fontWeight="semibold">{i + 1}. {q.text}</Text>
              <RadioGroup value={selectedAnswers[q.id] || ""} onChange={(val) => handleAnswerSelect(q.id, val)} isDisabled={quizSubmitted}>
                <Stack direction="column" mt={2}>
                  {q.options.map((opt) => (
                    <Radio key={opt.id} value={opt.id}>{opt.text}</Radio>
                  ))}
                </Stack>
              </RadioGroup>
            </Box>
          ))}
          <Button onClick={handleSubmit} colorScheme="blue" mt={4} isLoading={isLoading} isDisabled={quizSubmitted}>
            {quizSubmitted ? "Submitted" : "Submit Quiz"}
          </Button>
        </Box>
      )}
    </Box>
  );
};

/* ---------------- Layout ---------------- */
const CourseContentLayout = () => {
  const { user } = useAuth();
  const { courseId, moduleId: urlModuleId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [state, setState] = useState({
    currentModuleId: urlModuleId || null,
    modules: [],
    course: {},
    currentContent: null,
    userProgress: {},
    isLoading: true,
    error: null,
  });

  const handleModuleSelect = (moduleId) => {
    navigate(`/course/${courseId}/module/${moduleId}`);
    setState((prev) => ({ ...prev, currentModuleId: moduleId }));
  };

  const handleContentComplete = () => {
    // refresh progress after completion
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await coursesApi.getCourse(courseId);
        const modulesRes = await coursesApi.getCourseModules(courseId);

        let userProgress = {};
        if (user) {
          const progressRes = await progressApi.getUserProgress(courseId);
          userProgress = progressRes.data || {};
        }

        const currentModule = urlModuleId || modulesRes.data?.[0]?.id;
        if (!urlModuleId && currentModule) {
          navigate(`/course/${courseId}/module/${currentModule}`, { replace: true });
        }

        setState({
          course: courseRes.data,
          modules: modulesRes.data,
          currentModuleId: currentModule,
          currentContent: modulesRes.data.find((m) => m.id === currentModule),
          userProgress,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load course data",
          status: "error",
        });
        setState((prev) => ({ ...prev, error: err.message, isLoading: false }));
      }
    };

    fetchData();
  }, [courseId, urlModuleId, user, navigate, toast]);

  if (state.isLoading) return <Spinner />;

  return (
    <Flex h="calc(100vh - 64px)" bg="white">
      <ContentSidebar
        modules={state.modules}
        currentModuleId={state.currentModuleId}
        onModuleSelect={handleModuleSelect}
        userProgress={state.userProgress}
      />
      <ContentViewer content={state.currentContent} onComplete={handleContentComplete} />
    </Flex>
  );
};

export default CourseContentLayout;
