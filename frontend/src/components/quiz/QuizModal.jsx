import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Progress,
  HStack,
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  RadioGroup,
  Radio,
  Stack,
  useToast,
  Spinner,
  Badge,
  Divider
} from '@chakra-ui/react';
import { CheckCircle, ArrowLeft, ArrowRight, X, AlertCircle } from 'lucide-react';
import { quizApi } from '../../services/api';

const QuizModal = ({ isOpen, onClose, moduleId, onComplete }) => {
  // State management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  
  const toast = useToast();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const activeBg = useColorModeValue('blue.50', 'blue.900');

  // Fetch quiz questions when modal opens
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!isOpen || !moduleId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const response = await quizApi.getQuizQuestions(moduleId);
        setQuizData(response.data);
        
        // Initialize userAnswers with null for each question
        const initialAnswers = {};
        response.data.questions.forEach((q) => {
          initialAnswers[q.id] = null;
        });
        setUserAnswers(initialAnswers);
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Failed to load quiz. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [isOpen, moduleId]);

  // Reset state when modal closes
  const handleClose = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setUserAnswers({});
    setShowResults(false);
    setResults(null);
    onClose();
  };

  // Handle option selection
  const handleOptionSelect = (optionId) => {
    if (!quizData?.questions?.[currentQuestionIndex]) return;
    
    setUserAnswers(prev => ({
      ...prev,
      [quizData.questions[currentQuestionIndex].id]: optionId
    }));
  };

  // Navigation between questions
  const handleNext = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Submit quiz
  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Prepare submission data
      const submission = {
        answers: Object.entries(userAnswers)
          .filter(([_, optionId]) => optionId !== null)
          .map(([questionId, optionId]) => ({
            question_id: parseInt(questionId),
            option_id: optionId
          }))
      };
      
      // Submit to backend
      const response = await quizApi.submitQuiz(moduleId, submission);
      setResults(response.data);
      setShowResults(true);
      
      // Notify parent component
      if (onComplete) {
        onComplete(response.data);
      }
      
      // Show success message
      toast({
        title: response.data.passed ? 'Quiz Passed!' : 'Quiz Completed',
        description: `Your score: ${response.data.score.toFixed(1)}%`,
        status: response.data.passed ? 'success' : 'info',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error submitting quiz:', err);
      toast({
        title: 'Error',
        description: 'Failed to submit quiz. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!quizData) return 0;
    const answered = Object.values(userAnswers).filter(Boolean).length;
    return (answered / quizData.questions.length) * 100;
  };

  // Helper variables
  const currentQuestion = quizData?.questions?.[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === (quizData?.questions?.length - 1);
  const hasAnsweredCurrent = currentQuestion && userAnswers[currentQuestion.id] !== null;
  const totalQuestions = quizData?.questions?.length || 0;
  const answeredQuestions = quizData ? Object.values(userAnswers).filter(Boolean).length : 0;

  // Loading state
  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Loading Quiz...</ModalHeader>
          <ModalBody p={6} textAlign="center">
            <Spinner size="xl" mb={4} />
            <Text>Preparing your quiz. Please wait...</Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  // Error state
  if (error) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Error</ModalHeader>
          <ModalCloseButton isDisabled={isSubmitting} />
          <ModalBody p={6}>
            <Alert status="error" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
            <Button onClick={handleClose} colorScheme="blue">
              Close
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  // No quiz data available
  if (!quizData) {
    return null;
  }

  // Results view
  if (showResults && results) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={2}>
              <Text>Quiz Results</Text>
              <Badge 
                colorScheme={results.passed ? 'green' : 'red'} 
                fontSize="0.8em"
                px={2} py={0.5} rounded="full"
              >
                {results.passed ? 'Passed' : 'Not Passed'}
              </Badge>
            </HStack>
          </ModalHeader>
          <ModalCloseButton isDisabled={isSubmitting} />
          <ModalBody p={6}>
            <VStack spacing={6} align="stretch">
              {/* Score Summary */}
              <Box 
                p={6} 
                bg={results.passed ? 'green.50' : 'red.50'}
                borderRadius="lg"
                borderWidth="1px"
                borderColor={results.passed ? 'green.200' : 'red.200'}
                textAlign="center"
              >
                <Text fontSize="4xl" fontWeight="bold" mb={2}>
                  {results.score.toFixed(1)}%
                </Text>
                <Text fontSize="lg" mb={4}>
                  {results.passed 
                    ? 'Congratulations! You passed the quiz!' 
                    : `You needed ${results.passing_score}% to pass.`}
                </Text>
                <Text color="gray.600">
                  {results.correct_answers} out of {results.total_questions} questions correct
                </Text>
              </Box>

              {/* Detailed Results */}
              <Box>
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                  Question Review:
                </Text>
                <VStack spacing={4} align="stretch">
                  {quizData.questions.map((question, index) => {
                    const userAnswerId = userAnswers[question.id];
                    const userAnswer = question.options.find(o => o.id === userAnswerId);
                    const correctAnswer = question.options.find(o => o.is_correct);
                    const isCorrect = userAnswer?.is_correct;
                    
                    return (
                      <Box 
                        key={question.id}
                        p={4}
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor={isCorrect ? 'green.200' : 'red.200'}
                        bg={isCorrect ? 'green.50' : 'red.50'}
                      >
                        <HStack mb={2}>
                          <Text fontWeight="bold">
                            Question {index + 1}:
                          </Text>
                          <Badge 
                            colorScheme={isCorrect ? 'green' : 'red'}
                            fontSize="0.7em"
                            px={2}
                            py={0.5}
                            rounded="full"
                          >
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </Badge>
                        </HStack>
                        
                        <Text mb={3} fontWeight="medium">{question.question}</Text>
                        
                        <Box mb={2}>
                          <Text fontSize="sm" color="gray.600" mb={1}>
                            Your answer:
                          </Text>
                          <Box 
                            p={2} 
                            bg="white" 
                            borderRadius="md"
                            borderWidth="1px"
                            borderColor={isCorrect ? 'green.200' : 'red.200'}
                          >
                            {userAnswer ? (
                              <Text>{userAnswer.option_text}</Text>
                            ) : (
                              <Text color="gray.500">No answer provided</Text>
                            )}
                          </Box>
                        </Box>
                        
                        {!isCorrect && (
                          <Box>
                            <Text fontSize="sm" color="gray.600" mb={1}>
                              Correct answer:
                            </Text>
                            <Box 
                              p={2} 
                              bg="white" 
                              borderRadius="md"
                              borderWidth="1px"
                              borderColor="green.200"
                            >
                              <Text>{correctAnswer?.option_text}</Text>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </VStack>
              </Box>

              <Button 
                colorScheme="blue" 
                onClick={handleClose}
                size="lg"
                mt={4}
              >
                Close Quiz
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  // Main quiz view
  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl" closeOnOverlayClick={!isSubmitting}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack justify="space-between" w="full">
            <Text>Question {currentQuestionIndex + 1} of {quizData.questions.length}</Text>
            <Badge colorScheme="blue" px={2} py={0.5} rounded="full">
              {answeredQuestions} / {totalQuestions} answered
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton isDisabled={isSubmitting} />
        
        <ModalBody p={6}>
          {/* Progress Bar */}
          <Box mb={8}>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="sm" color="gray.500">
                Progress: {Math.round(calculateProgress())}%
              </Text>
              <Text fontSize="sm" color="gray.500">
                {answeredQuestions} of {totalQuestions} answered
              </Text>
            </HStack>
            <Progress 
              value={calculateProgress()} 
              size="sm" 
              colorScheme="blue" 
              borderRadius="full"
              bg={useColorModeValue('gray.100', 'gray.700')}
            />
          </Box>

          {/* Question */}
          <Text fontSize="xl" fontWeight="medium" mb={6}>
            {currentQuestion.question}
          </Text>

          {/* Options */}
          <RadioGroup 
            value={userAnswers[currentQuestion.id] || ''}
            onChange={handleOptionSelect}
            mb={8}
          >
            <Stack spacing={3}>
              {currentQuestion.options.map((option) => (
                <Box
                  key={option.id}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor={
                    userAnswers[currentQuestion.id] === option.id
                      ? 'blue.500'
                      : borderColor
                  }
                  bg={
                    userAnswers[currentQuestion.id] === option.id
                      ? 'blue.50'
                      : 'transparent'
                  }
                  _hover={{
                    borderColor: 'blue.300',
                    bg: hoverBg,
                    cursor: 'pointer',
                  }}
                  _active={{
                    bg: activeBg,
                  }}
                  onClick={() => handleOptionSelect(option.id)}
                  transition="all 0.2s"
                >
                  <Radio 
                    value={option.id}
                    colorScheme="blue"
                    isChecked={userAnswers[currentQuestion.id] === option.id}
                    size="lg"
                  >
                    <Text ml={2} fontSize="md">
                      {option.option_text}
                    </Text>
                  </Radio>
                </Box>
              ))}
            </Stack>
          </RadioGroup>

          {/* Navigation Buttons */}
          <HStack justify="space-between" mt={8} pt={4} borderTopWidth="1px" borderTopColor={borderColor}>
            <Button
              leftIcon={<ArrowLeft size={18} />}
              onClick={handlePrevious}
              isDisabled={currentQuestionIndex === 0 || isSubmitting}
              variant="outline"
              size="lg"
            >
              Previous
            </Button>

            {isLastQuestion ? (
              <Button
                colorScheme="green"
                rightIcon={<CheckCircle size={18} />}
                onClick={handleSubmit}
                isLoading={isSubmitting}
                isDisabled={!hasAnsweredCurrent}
                size="lg"
                px={8}
              >
                Submit Quiz
              </Button>
            ) : (
              <Button
                rightIcon={<ArrowRight size={18} />}
                onClick={handleNext}
                isDisabled={!hasAnsweredCurrent || isSubmitting}
                colorScheme="blue"
                size="lg"
                px={8}
              >
                Next
              </Button>
            )}
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default QuizModal;