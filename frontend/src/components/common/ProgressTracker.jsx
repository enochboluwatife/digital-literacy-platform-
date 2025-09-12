import React from 'react';
import {
  Box,
  Progress,
  Text,
  VStack,
  HStack,
  Badge,
  Card,
  CardBody,
  useColorModeValue
} from '@chakra-ui/react';
import { CheckCircle, Circle, Play } from 'lucide-react';

const ProgressTracker = ({ 
  totalCourses = 0, 
  completedCourses = 0, 
  currentCourse = null,
  enrollments = []
}) => {
  const progressPercentage = totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0;
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Card bg={bgColor} border="1px" borderColor={borderColor}>
      <CardBody>
        <VStack align="stretch" spacing={4}>
          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontWeight="semibold">Learning Progress</Text>
              <Badge colorScheme="blue" variant="subtle">
                {completedCourses}/{totalCourses} Completed
              </Badge>
            </HStack>
            <Progress 
              value={progressPercentage} 
              colorScheme="blue" 
              size="lg" 
              borderRadius="md"
            />
            <Text fontSize="sm" color="gray.600" mt={1}>
              {Math.round(progressPercentage)}% Complete
            </Text>
          </Box>

          {currentCourse && (
            <Box>
              <Text fontWeight="semibold" mb={2}>Currently Learning</Text>
              <HStack>
                <Play size={16} color="#3182ce" />
                <Text fontSize="sm">{currentCourse.title}</Text>
              </HStack>
            </Box>
          )}

          {enrollments.length > 0 && (
            <Box>
              <Text fontWeight="semibold" mb={2}>Recent Courses</Text>
              <VStack align="stretch" spacing={2}>
                {enrollments.slice(0, 3).map((enrollment) => (
                  <HStack key={enrollment.id} justify="space-between">
                    <HStack>
                      {enrollment.completed_at ? (
                        <CheckCircle size={16} color="#38a169" />
                      ) : (
                        <Circle size={16} color="#a0aec0" />
                      )}
                      <Text fontSize="sm" noOfLines={1}>
                        {enrollment.course?.title || 'Course'}
                      </Text>
                    </HStack>
                    <Badge 
                      size="sm" 
                      colorScheme={enrollment.completed_at ? 'green' : 'gray'}
                      variant="subtle"
                    >
                      {enrollment.completed_at ? 'Done' : 'In Progress'}
                    </Badge>
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default ProgressTracker;
