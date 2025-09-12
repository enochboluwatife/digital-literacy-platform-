import React from 'react';
import { Box, VStack, HStack, Text, Heading, Badge, Icon } from '@chakra-ui/react';
import { CheckCircle, XCircle } from 'lucide-react';

const QuestionReview = ({ questions, selectedOptions, onRetake }) => {
  return (
    <VStack spacing={4} align="stretch">
      <Heading size="md">Question Review</Heading>
      {questions.map((q, index) => {
        const selectedOptionId = selectedOptions[q.id];
        const selectedOption = q.options.find(opt => opt.id === selectedOptionId);
        const isCorrect = selectedOption?.isCorrect;
        
        return (
          <Box
            key={q.id}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            borderColor={isCorrect ? 'green.200' : 'red.200'}
            bg={isCorrect ? 'green.50' : 'red.50'}
          >
            <HStack mb={2}>
              <Text fontWeight="bold">Question {index + 1}:</Text>
              {isCorrect ? (
                <Badge colorScheme="green">
                  <HStack spacing={1}>
                    <Icon as={CheckCircle} />
                    <Text>Correct</Text>
                  </HStack>
                </Badge>
              ) : (
                <Badge colorScheme="red">
                  <HStack spacing={1}>
                    <Icon as={XCircle} />
                    <Text>Incorrect</Text>
                  </HStack>
                </Badge>
              )}
            </HStack>
            <Text mb={2} fontWeight="medium">{q.question}</Text>
            <Text fontSize="sm" color="gray.600" mb={1}>Your answer:</Text>
            <Box p={2} bg="white" borderRadius="md" borderWidth="1px" mb={2}>
              <Text>{selectedOption?.text || 'No answer provided'}</Text>
            </Box>
            {!isCorrect && (
              <>
                <Text fontSize="sm" color="gray.600" mb={1}>Correct answer:</Text>
                <Box p={2} bg="white" borderRadius="md" borderWidth="1px">
                  <Text>{q.options.find(opt => opt.isCorrect)?.text}</Text>
                </Box>
              </>
            )}
          </Box>
        );
      })}
    </VStack>
  );
};

export default QuestionReview;
