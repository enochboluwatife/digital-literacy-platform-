import React from 'react';
import {
  Box,
  VStack,
  Text,
  Heading,
  Progress,
  HStack,
  Icon,
  useColorModeValue,
  Button,
  Divider,
  Badge
} from '@chakra-ui/react';
import { CheckCircleIcon, TimeIcon, StarIcon } from '@chakra-ui/icons';

const QuizResults = ({ results, onRetry, onContinue }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const correctColor = useColorModeValue('green.100', 'green.900');
  const incorrectColor = useColorModeValue('red.50', 'red.900');

  const { score, total_questions, correct_answers, feedback, passed, answers } = results;

  return (
    <Box p={6} bg={bgColor} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading size="lg" mb={2}>
            {passed ? 'Quiz Completed!' : 'Quiz Attempted'}
          </Heading>
          <Text color="gray.500">
            {passed 
              ? 'Congratulations! You have passed the quiz.'
              : 'Review your answers and try again.'}
          </Text>
        </Box>

        {/* Score */}
        <Box textAlign="center" py={4}>
          <Box
            mx="auto"
            w="150px"
            h="150px"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderWidth="8px"
            borderColor={passed ? 'green.300' : 'red.300'}
            position="relative"
            mb={4}
          >
            <Box textAlign="center">
              <Heading size="2xl">{Math.round(score)}%</Heading>
              <Text fontSize="sm" color="gray.500">Score</Text>
            </Box>
          </Box>
          
          <HStack justify="center" spacing={6} mt={4}>
            <VStack>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {correct_answers}
              </Text>
              <Text fontSize="sm" color="gray.500">Correct</Text>
            </VStack>
            <VStack>
              <Text fontSize="2xl" fontWeight="bold" color="red.500">
                {total_questions - correct_answers}
              </Text>
              <Text fontSize="sm" color="gray.500">Incorrect</Text>
            </VStack>
            <VStack>
              <Text fontSize="2xl" fontWeight="bold">
                {total_questions}
              </Text>
              <Text fontSize="sm" color="gray.500">Total</Text>
            </VStack>
          </HStack>
        </Box>

        {/* Feedback */}
        {feedback && (
          <Box 
            p={4} 
            bg={passed ? 'green.50' : 'yellow.50'}
            borderRadius="md"
            borderLeftWidth="4px"
            borderLeftColor={passed ? 'green.500' : 'yellow.500'}
          >
            <Text fontSize="md">{feedback}</Text>
          </Box>
        )}

        {/* Question Review */}
        <Box mt={6}>
          <Heading size="md" mb={4}>Your Answers</Heading>
          <VStack spacing={4} align="stretch">
            {answers?.map((item, index) => (
              <Box 
                key={index}
                p={4}
                borderRadius="md"
                bg={item.is_correct ? correctColor : incorrectColor}
                borderWidth="1px"
                borderColor={item.is_correct ? 'green.200' : 'red.200'}
              >
                <HStack mb={2}>
                  <Text fontWeight="bold">Question {index + 1}:</Text>
                  {item.is_correct ? (
                    <Badge colorScheme="green">
                      <Icon as={CheckCircleIcon} mr={1} /> Correct
                    </Badge>
                  ) : (
                    <Badge colorScheme="red">
                      <Icon as={TimeIcon} mr={1} /> Incorrect
                    </Badge>
                  )}
                </HStack>
                <Text mb={2} fontWeight="medium">{item.question_text}</Text>
                <Text>Your answer: <Text as="span" color={item.is_correct ? 'green.700' : 'red.700'} fontWeight="medium">
                  {item.selected_option}
                </Text></Text>
                {!item.is_correct && (
                  <Text>Correct answer: <Text as="span" color="green.700" fontWeight="medium">
                    {item.correct_option}
                  </Text></Text>
                )}
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Actions */}
        <HStack spacing={4} mt={8} justify="flex-end">
          {!passed && (
            <Button 
              variant="outline" 
              colorScheme="blue"
              onClick={onRetry}
            >
              Try Again
            </Button>
          )}
          <Button 
            colorScheme="blue"
            onClick={onContinue}
          >
            {passed ? 'Continue' : 'Back to Course'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default QuizResults;
