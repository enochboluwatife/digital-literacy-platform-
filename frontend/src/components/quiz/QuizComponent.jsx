import React, { useState, useCallback } from 'react';
import {
  Box, Button, VStack, HStack, Text, Radio, RadioGroup, Progress,
  Alert, AlertIcon, useToast, Heading, Badge, Icon, Spinner
} from '@chakra-ui/react';
import { ArrowRight, ArrowLeft, AlertTriangle } from 'lucide-react';
import QuestionReview from './QuestionReview';
import ErrorBoundary from '../common/ErrorBoundary';

// Quiz content component that can be wrapped in ErrorBoundary
const QuizContent = ({ moduleId, onComplete, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState(null);
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);

  // In a real app, this would be an API call
  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Sample questions - in a real app, these would come from an API
      const sampleQuestions = [
    {
      id: 1,
      question: 'What is the main purpose of a firewall?',
      options: [
        { id: 1, text: 'To block all internet traffic', isCorrect: false },
        { id: 2, text: 'To monitor and control incoming and outgoing network traffic', isCorrect: true },
        { id: 3, text: 'To speed up internet connection', isCorrect: false },
        { id: 4, text: 'To store website data', isCorrect: false },
      ],
    },
    {
      id: 2,
      question: 'What does HTTPS stand for?',
      options: [
        { id: 1, text: 'HyperText Transfer Protocol Secure', isCorrect: true },
        { id: 2, text: 'HyperText Transfer Protocol Standard', isCorrect: false },
        { id: 3, text: 'HyperText Transfer Protocol System', isCorrect: false },
        { id: 4, text: 'HyperText Transfer Protocol Service', isCorrect: false },
      ],
    },
    {
      id: 3,
      question: 'Which of the following is a strong password?',
      options: [
        { id: 1, text: 'password123', isCorrect: false },
        { id: 2, text: '12345678', isCorrect: false },
        { id: 3, text: 'Tr0ub4d0ur&3', isCorrect: true },
        { id: 4, text: 'qwerty', isCorrect: false },
      ],
    },
      ];
      
      setQuestions(sampleQuestions);
      setError(null);
    } catch (err) {
      console.error('Failed to load questions:', err);
      setError('Failed to load quiz questions. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to load quiz questions.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Load questions on mount
  React.useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleRetryLoad = () => {
    setError(null);
    fetchQuestions();
  };

  const handleOptionSelect = (questionId, optionId) => {
    setSelectedOptions(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Calculate score
    let correctAnswers = 0;
    questions.forEach(question => {
      const selectedOptionId = selectedOptions[question.id];
      if (selectedOptionId) {
        const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
        if (selectedOption?.isCorrect) {
          correctAnswers++;
        }
      }
    });

    const scorePercentage = Math.round((correctAnswers / questions.length) * 100);
    const passed = scorePercentage >= 70; // Passing score is 70%
    
    setScore(scorePercentage);
    setResults({
      score: scorePercentage,
      totalQuestions: questions.length,
      correctAnswers,
      passed,
      passingScore: 70
    });
    
    setShowResults(true);
    setIsSubmitting(false);
    
    if (onComplete) {
      onComplete({
        score: scorePercentage,
        passed,
        totalQuestions: questions.length,
        correctAnswers
      });
    }

    // Show success/error toast
    toast({
      title: passed ? 'Quiz Passed!' : 'Quiz Completed',
      description: `You scored ${scorePercentage}% (${correctAnswers} out of ${questions.length} correct)`,
      status: passed ? 'success' : 'info',
      duration: 5000,
      isClosable: true,
    });
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setSelectedOptions({});
    setShowResults(false);
    setScore(0);
    setResults(null);
  };

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const hasSelectedOption = selectedOptions[currentQ?.id] !== undefined;

  // Loading state
  if (isLoading) {
    return (
      <Box p={6} textAlign="center">
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text mt={4}>Loading quiz questions...</Text>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box p={6} textAlign="center">
        <Icon as={AlertTriangle} boxSize={12} color="red.500" mb={4} />
        <Heading size="md" mb={2}>Failed to load quiz</Heading>
        <Text color="gray.600" mb={6}>{error}</Text>
        <Button 
          colorScheme="blue" 
          onClick={handleRetryLoad}
          leftIcon={<Icon as={ArrowRight} />}
        >
          Retry
        </Button>
      </Box>
    );
  }

  // Results state
  if (showResults && results) {
    return (
      <Box p={6}>
        <VStack spacing={6} align="stretch">
          <Alert
            status={results.passed ? 'success' : 'error'}
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            py={8}
            borderRadius="md"
          >
            <AlertIcon boxSize="40px" mr={0} />
            <Heading size="md" mt={4} mb={1}>
              {results.passed ? 'Quiz Passed! 🎉' : 'Quiz Not Passed'}
            </Heading>
            <Text>
              You scored {results.score}% ({results.correctAnswers} out of {results.totalQuestions} correct)
            </Text>
          </Alert>

          <QuestionReview 
            questions={questions}
            selectedOptions={selectedOptions}
          />

          <HStack spacing={4} justify="center" mt={6}>
            <Button
              colorScheme="blue"
              onClick={handleRetake}
              leftIcon={<Icon as={ArrowLeft} />}
            >
              Retake Quiz
            </Button>
            {onClose && (
              <Button
                variant="outline"
                onClick={onClose}
              >
                Close
              </Button>
            )}
          </HStack>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Progress Bar */}
        <Box>
          <HStack justify="space-between" mb={1}>
            <Text fontSize="sm" color="gray.600">
              Question {currentQuestion + 1} of {questions.length}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {Math.round(progress)}% Complete
            </Text>
          </HStack>
          <Progress value={progress} size="sm" colorScheme="blue" borderRadius="full" />
        </Box>

        {/* Question */}
        <Box>
          <Text fontSize="lg" fontWeight="medium" mb={4}>
            {currentQ.question}
          </Text>
          
          <RadioGroup
            value={selectedOptions[currentQ.id] || ''}
            onChange={(value) => handleOptionSelect(currentQ.id, parseInt(value))}
          >
            <VStack align="stretch" spacing={3}>
              {currentQ.options.map((option) => (
                <Box
                  key={option.id}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor={selectedOptions[currentQ.id] === option.id ? 'blue.500' : 'gray.200'}
                  bg={selectedOptions[currentQ.id] === option.id ? 'blue.50' : 'white'}
                  _hover={{
                    borderColor: 'blue.300',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleOptionSelect(currentQ.id, option.id)}
                >
                  <Radio value={option.id} colorScheme="blue">
                    <Text ml={2}>{option.text}</Text>
                  </Radio>
                </Box>
              ))}
            </VStack>
          </RadioGroup>
        </Box>

        {/* Navigation Buttons */}
        <HStack justify="space-between" mt={8} pt={4} borderTopWidth="1px" borderTopColor="gray.200">
          <Button
            leftIcon={<ArrowLeft size={18} />}
            variant="outline"
            onClick={handlePrevious}
            isDisabled={currentQuestion === 0 || isSubmitting}
          >
            Previous
          </Button>

          <Button
            rightIcon={isLastQuestion ? null : <ArrowRight size={18} />}
            colorScheme={isLastQuestion ? 'green' : 'blue'}
            onClick={handleNext}
            isDisabled={!hasSelectedOption || isSubmitting}
            isLoading={isSubmitting}
            loadingText={isLastQuestion ? 'Submitting...' : 'Loading...'}
          >
            {isLastQuestion ? 'Submit Quiz' : 'Next'}
          </Button>
        </HStack>

        <Alert status="info" mt={6} borderRadius="md">
          <AlertIcon />
          You need to score at least 70% to pass this quiz. You can retake the quiz if needed.
        </Alert>
      </VStack>
    </Box>
  );
};

// Main Quiz component with error boundary
const QuizComponent = (props) => (
  <ErrorBoundary>
    <QuizContent {...props} />
  </ErrorBoundary>
);

export default QuizComponent;
