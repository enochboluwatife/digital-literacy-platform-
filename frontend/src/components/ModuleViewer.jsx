import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Divider,
  useToast,
  Progress,
  Card,
  CardBody,
  CardFooter,
  Radio,
  RadioGroup,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  IconButton,
  Center,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import { ArrowBackIcon, ArrowForwardIcon, CheckIcon, TimeIcon } from '@chakra-ui/icons';
import ReactPlayer from 'react-player';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesApi } from '../services/api';

const ModuleViewer = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [nextModule, setNextModule] = useState(null);
  const [prevModule, setPrevModule] = useState(null);
  const [progress, setProgress] = useState(0);
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const fetchModule = async () => {
      try {
        setLoading(true);
        
        // Fetch module data from API
        const response = await coursesApi.getModule(courseId, moduleId);
        const moduleData = response.data;
        
        setModule(moduleData);
        setNextModule(parseInt(moduleId) + 1);
        setPrevModule(parseInt(moduleId) > 1 ? parseInt(moduleId) - 1 : null);
        setProgress((parseInt(moduleId) / 10) * 100); // Mock progress for now
        setLoading(false);
      } catch (err) {
        console.error('Error fetching module:', err);
        setError('Failed to load module. Please try again.');
        setLoading(false);
        toast({
          title: 'Error',
          description: 'Failed to load module.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchModule();
  }, [courseId, moduleId, toast]);

  const handleOptionSelect = (value) => {
    setSelectedOption(parseInt(value));
  };

  const handleSubmit = () => {
    if (module.contentType === 'quiz') {
      const selectedAnswer = module.quizQuestions[0].options.find(
        (opt) => opt.id === selectedOption
      );
      
      const correct = selectedAnswer?.isCorrect || false;
      setIsCorrect(correct);
      setSubmitted(true);
      
      // In a real app, this would be an API call to submit the quiz attempt
      // await axios.post(`/api/courses/${courseId}/modules/${moduleId}/quiz`, {
      //   selectedOptionId: selectedOption
      // });
      
      setQuizResult({
        correct,
        feedback: correct 
          ? 'Correct! Well done.' 
          : 'Incorrect. The correct answer is: ' + module.quizQuestions[0].options.find(opt => opt.isCorrect)?.text,
      });
    }
  };

  const navigateToModule = (moduleNumber) => {
    navigate(`/courses/${courseId}/modules/${moduleNumber}`);
  };

  const markAsComplete = async () => {
    try {
      // In a real app, this would be an API call to mark the module as complete
      // await axios.post(`/api/courses/${courseId}/modules/${moduleId}/complete`);
      
      toast({
        title: 'Module completed!',
        description: 'Your progress has been saved.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Navigate to next module or course completion page
      if (nextModule) {
        navigate(`/courses/${courseId}/modules/${nextModule}`);
      } else {
        navigate(`/courses/${courseId}/complete`);
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to mark module as complete.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box maxW="4xl" mx="auto" p={4}>
      {/* Progress Bar */}
      <Box mb={8}>
        <HStack justify="space-between" mb={2}>
          <Text fontSize="sm" color="gray.500">
            Module {module.order} of 10
          </Text>
          <HStack>
            <TimeIcon mr={1} />
            <Text fontSize="sm" color="gray.500">
              {module.duration} min
            </Text>
          </HStack>
        </HStack>
        <Progress value={progress} size="sm" colorScheme="blue" borderRadius="full" />
      </Box>

      {/* Module Content */}
      <Card bg={cardBg} border="1px" borderColor={borderColor} mb={6}>
        <CardBody>
          <Heading size="lg" mb={4}>
            {module.title}
          </Heading>
          
          {module.contentType === 'text' && (
            <Text whiteSpace="pre-line">{module.content}</Text>
          )}
          
          {module.contentType === 'video' && (
            <Box 
              position="relative" 
              pt="56.25%" /* 16:9 Aspect Ratio */
              borderRadius="md" 
              overflow="hidden"
              bg="black"
              my={4}
            >
              <Box position="absolute" top={0} left={0} right={0} bottom={0}>
                <ReactPlayer
                  url={module.content}
                  width="100%"
                  height="100%"
                  controls
                  style={{ position: 'absolute', top: 0, left: 0 }}
                />
              </Box>
            </Box>
          )}
          
          {module.contentType === 'quiz' && (
            <Box>
              <Text fontSize="xl" fontWeight="bold" mb={4}>
                {module.quizQuestions[0].question}
              </Text>
              
              {!submitted ? (
                <RadioGroup onChange={handleOptionSelect} value={selectedOption}>
                  <Stack spacing={3}>
                    {module.quizQuestions[0].options.map((option) => (
                      <Card 
                        key={option.id} 
                        variant="outline" 
                        borderColor={selectedOption === option.id ? 'blue.500' : 'gray.200'}
                        _hover={{ borderColor: 'blue.300', cursor: 'pointer' }}
                        onClick={() => setSelectedOption(option.id)}
                      >
                        <CardBody p={4}>
                          <HStack>
                            <Radio value={option.id} />
                            <Text>{option.text}</Text>
                          </HStack>
                        </CardBody>
                      </Card>
                    ))}
                  </Stack>
                </RadioGroup>
              ) : (
                <Alert 
                  status={isCorrect ? 'success' : 'error'}
                  variant="subtle"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                  height="200px"
                  borderRadius="md"
                >
                  <AlertIcon boxSize="40px" mr={0} />
                  <AlertTitle mt={4} mb={1} fontSize="lg">
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </AlertTitle>
                  <AlertDescription maxWidth="sm">
                    {quizResult.feedback}
                  </AlertDescription>
                </Alert>
              )}
            </Box>
          )}
        </CardBody>
        
        <CardFooter>
          <HStack spacing={4} w="100%" justify="space-between">
            <Button
              leftIcon={<ArrowBackIcon />}
              isDisabled={!prevModule}
              onClick={() => prevModule && navigateToModule(prevModule)}
              variant="ghost"
            >
              Previous
            </Button>
            
            {module.contentType === 'quiz' ? (
              !submitted ? (
                <Button
                  colorScheme="blue"
                  onClick={handleSubmit}
                  isDisabled={!selectedOption}
                  rightIcon={<ArrowForwardIcon />}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button
                  colorScheme="green"
                  onClick={markAsComplete}
                  rightIcon={<CheckIcon />}
                >
                  Continue
                </Button>
              )
            ) : (
              <Button
                colorScheme="blue"
                onClick={markAsComplete}
                rightIcon={<CheckIcon />}
              >
                Mark as Complete
              </Button>
            )}
            
            {nextModule && (
              <Button
                rightIcon={<ArrowForwardIcon />}
                onClick={() => navigateToModule(nextModule)}
                variant="ghost"
              >
                Next
              </Button>
            )}
          </HStack>
        </CardFooter>
      </Card>
      
      {/* Module Navigation */}
      <HStack justify="space-between" mt={8}>
        {prevModule ? (
          <Button
            leftIcon={<ArrowBackIcon />}
            onClick={() => navigateToModule(prevModule)}
            variant="outline"
          >
            Previous Module
          </Button>
        ) : (
          <Box />
        )}
        
        {nextModule ? (
          <Button
            rightIcon={<ArrowForwardIcon />}
            onClick={() => navigateToModule(nextModule)}
            colorScheme="blue"
          >
            Next Module
          </Button>
        ) : (
          <Button
            rightIcon={<CheckIcon />}
            onClick={markAsComplete}
            colorScheme="green"
          >
            Complete Course
          </Button>
        )}
      </HStack>
    </Box>
  );
};

export default ModuleViewer;
