import React from 'react';
import {
  Box,
  Heading,
  Text,
  HStack,
  Badge,
  Icon,
  Button,
  useColorModeValue,
  Stack,
  useBreakpointValue,
  Avatar,
  Progress
} from '@chakra-ui/react';
import { ArrowLeft, Star, Users, Clock, BookOpen, Award } from 'lucide-react';

const CourseHeader = ({ course, onBack }) => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const isMobile = useBreakpointValue({ base: true, md: false });
  const progress = course?.progress || 0;

  if (!course) {
    return null;
  }

  return (
    <Box
      bg={bg}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      p={6}
      mb={6}
      boxShadow="sm"
    >
      <Button
        variant="ghost"
        leftIcon={<ArrowLeft size={18} />}
        onClick={onBack}
        mb={4}
        size="sm"
      >
        Back to Courses
      </Button>

      <Stack direction={{ base: 'column', md: 'row' }} spacing={6}>
        <Box flex={1}>
          <Heading size="xl" mb={2}>
            {course.title}
          </Heading>

          <Text color="gray.600" mb={4}>
            {course.description}
          </Text>

          <HStack spacing={4} flexWrap="wrap" mb={4}>
            <HStack>
              <Icon as={BookOpen} size={16} color="gray.500" />
              <Text fontSize="sm" color="gray.500">
                {course.modules?.length || 0} Modules
              </Text>
            </HStack>

            <HStack>
              <Icon as={Clock} size={16} color="gray.500" />
              <Text fontSize="sm" color="gray.500">
                {course.duration || 'N/A'}
              </Text>
            </HStack>

            <HStack>
              <Icon as={Users} size={16} color="gray.500" />
              <Text fontSize="sm" color="gray.500">
                {course.enrolled_count || 0} Students
              </Text>
            </HStack>

            {course.rating && (
              <HStack>
                <Icon as={Star} size={16} color="yellow.400" fill="currentColor" />
                <Text fontSize="sm" color="gray.700" fontWeight="medium">
                  {course.rating.toFixed(1)}
                </Text>
              </HStack>
            )}

            {course.tags?.map((tag, index) => (
              <Badge key={index} colorScheme="blue" variant="subtle" px={2} py={0.5}>
                {tag}
              </Badge>
            ))}
          </HStack>

          {progress > 0 && (
            <Box>
              <HStack justify="space-between" mb={1}>
                <Text fontSize="sm" color="gray.600">
                  Progress: {Math.round(progress)}%
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {course.completed_modules || 0} of {course.modules?.length || 0} modules
                </Text>
              </HStack>
              <Progress
                value={progress}
                size="sm"
                colorScheme="blue"
                borderRadius="full"
                bg={useColorModeValue('gray.100', 'gray.700')}
              />
            </Box>
          )}
        </Box>

        {course.instructor && (
          <Box
            minW={{ base: '100%', md: '250px' }}
            borderLeft={{ base: 'none', md: '1px solid' }}
            borderColor={{ base: 'transparent', md: borderColor }}
            pl={{ base: 0, md: 6 }}
            pt={{ base: 4, md: 0 }}
            borderTop={{ base: '1px solid', md: 'none' }}
            borderTopColor={borderColor}
          >
            <Text fontSize="sm" color="gray.500" mb={2} fontWeight="medium">
              Instructor
            </Text>
            <HStack spacing={3}>
              <Avatar
                size="md"
                name={course.instructor.name}
                src={course.instructor.avatar_url}
              />
              <Box>
                <Text fontWeight="medium">{course.instructor.name}</Text>
                <Text fontSize="sm" color="gray.500">
                  {course.instructor.title || 'Instructor'}
                </Text>
              </Box>
            </HStack>

            {course.certificate_available && (
              <Box mt={4} pt={4} borderTopWidth="1px" borderTopColor={borderColor}>
                <HStack color="green.500" mb={2}>
                  <Icon as={Award} size={18} />
                  <Text fontSize="sm" fontWeight="medium">
                    Certificate Available
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  Complete the course to earn your certificate
                </Text>
              </Box>
            )}
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default CourseHeader;
