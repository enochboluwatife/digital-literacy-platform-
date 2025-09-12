import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useColorModeValue
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <Box p={8} maxW="1200px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            Welcome back, {user?.first_name || 'Student'}! 👋
          </Heading>
          <Text color="gray.500">Here's what's happening with your learning today</Text>
        </Box>

        <Box 
          p={6} 
          bg={useColorModeValue('white', 'gray.700')} 
          borderRadius="lg" 
          shadow="md"
          border="1px"
          borderColor={useColorModeValue('gray.200', 'gray.600')}
        >
          <Heading size="md" mb={4} color={useColorModeValue('gray.800', 'white')}>
            Your Dashboard
          </Heading>
          <Text mb={4} color={useColorModeValue('gray.600', 'gray.300')}>
            Welcome to your digital literacy learning platform! This is where you'll track your progress,
            access your courses, and continue your learning journey.
          </Text>
          
          <VStack spacing={4} align="stretch">
            <Box 
              p={4} 
              bg={useColorModeValue('blue.50', 'blue.900')} 
              borderRadius="md"
              border="1px"
              borderColor={useColorModeValue('blue.200', 'blue.700')}
            >
              <Text fontWeight="bold" mb={2} color={useColorModeValue('blue.800', 'blue.200')}>
                Quick Stats:
              </Text>
              <VStack align="start" spacing={1}>
                <Text color={useColorModeValue('gray.700', 'gray.300')}>• Enrolled Courses: 2</Text>
                <Text color={useColorModeValue('gray.700', 'gray.300')}>• Completed Lessons: 8</Text>
                <Text color={useColorModeValue('gray.700', 'gray.300')}>• Learning Streak: 5 days</Text>
              </VStack>
            </Box>
            
            <Button 
              colorScheme="blue" 
              size="lg"
              _hover={{ transform: 'translateY(-1px)', shadow: 'lg' }}
              transition="all 0.2s"
            >
              Continue Learning
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default StudentDashboard;
