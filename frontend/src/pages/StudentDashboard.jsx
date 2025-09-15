import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useColorModeValue,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Badge,
  Icon,
  Flex,
  Divider
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Award, Clock, TrendingUp, Play, Users, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { coursesApi, progressApi } from '../services/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedLessons: 0,
    totalProgress: 0,
    streak: 0
  });

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const enrollmentsResponse = await coursesApi.getEnrollments();
        const enrollmentsData = enrollmentsResponse.data || [];
        setEnrollments(enrollmentsData);
        
        // Calculate stats
        const totalCourses = enrollmentsData.length;
        const completedLessons = enrollmentsData.reduce((acc, enrollment) => 
          acc + (enrollment.progress || 0), 0);
        const totalProgress = totalCourses > 0 ? 
          Math.round(enrollmentsData.reduce((acc, enrollment) => 
            acc + (enrollment.progress || 0), 0) / totalCourses) : 0;
        
        setStats({
          totalCourses,
          completedLessons,
          totalProgress,
          streak: Math.floor(Math.random() * 10) + 1 // Mock streak for now
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleContinueLearning = () => {
    navigate('/courses');
  };

  const handleViewCourse = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  return (
    <Box p={8} maxW="1200px" mx="auto">
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="2xl" mb={2} color={headingColor}>
            Welcome back, {user?.first_name || 'Student'}! 👋
          </Heading>
          <Text fontSize="lg" color={textColor}>
            Ready to continue your digital literacy journey?
          </Text>
        </Box>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <Flex align="center" mb={2}>
                  <Icon as={BookOpen} color="blue.500" mr={2} />
                  <StatLabel color={textColor}>Enrolled Courses</StatLabel>
                </Flex>
                <StatNumber color={headingColor}>{stats.totalCourses}</StatNumber>
                <StatHelpText color={textColor}>Active enrollments</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <Flex align="center" mb={2}>
                  <Icon as={Target} color="green.500" mr={2} />
                  <StatLabel color={textColor}>Overall Progress</StatLabel>
                </Flex>
                <StatNumber color={headingColor}>{stats.totalProgress}%</StatNumber>
                <Progress value={stats.totalProgress} colorScheme="green" size="sm" mt={2} />
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <Flex align="center" mb={2}>
                  <Icon as={Award} color="yellow.500" mr={2} />
                  <StatLabel color={textColor}>Completed Lessons</StatLabel>
                </Flex>
                <StatNumber color={headingColor}>{stats.completedLessons}</StatNumber>
                <StatHelpText color={textColor}>Keep it up!</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <Flex align="center" mb={2}>
                  <Icon as={TrendingUp} color="purple.500" mr={2} />
                  <StatLabel color={textColor}>Learning Streak</StatLabel>
                </Flex>
                <StatNumber color={headingColor}>{stats.streak} days</StatNumber>
                <StatHelpText color={textColor}>Amazing consistency!</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Quick Actions */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardHeader>
            <Heading size="md" color={headingColor}>Quick Actions</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Button
                leftIcon={<Play />}
                colorScheme="blue"
                size="lg"
                onClick={handleContinueLearning}
                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                transition="all 0.2s"
              >
                Continue Learning
              </Button>
              <Button
                leftIcon={<BookOpen />}
                variant="outline"
                size="lg"
                onClick={() => navigate('/courses')}
                _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                transition="all 0.2s"
              >
                Browse Courses
              </Button>
              <Button
                leftIcon={<Users />}
                variant="outline"
                size="lg"
                onClick={() => navigate('/profile')}
                _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                transition="all 0.2s"
              >
                View Profile
              </Button>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Recent Courses */}
        {enrollments.length > 0 && (
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardHeader>
              <Heading size="md" color={headingColor}>Your Courses</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {enrollments.slice(0, 3).map((enrollment) => (
                  <Box
                    key={enrollment.id}
                    p={4}
                    borderRadius="md"
                    border="1px"
                    borderColor={borderColor}
                    _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                    cursor="pointer"
                    onClick={() => handleViewCourse(enrollment.course_id)}
                    transition="all 0.2s"
                  >
                    <Flex justify="space-between" align="center">
                      <Box flex="1">
                        <Text fontWeight="bold" color={headingColor} mb={1}>
                          {enrollment.course?.title || `Course ${enrollment.course_id}`}
                        </Text>
                        <Text fontSize="sm" color={textColor} mb={2}>
                          {enrollment.course?.description || 'Digital literacy course'}
                        </Text>
                        <Flex align="center" gap={4}>
                          <Box flex="1">
                            <Text fontSize="xs" color={textColor} mb={1}>
                              Progress: {enrollment.progress || 0}%
                            </Text>
                            <Progress 
                              value={enrollment.progress || 0} 
                              colorScheme="blue" 
                              size="sm" 
                            />
                          </Box>
                          <Badge 
                            colorScheme={enrollment.completed ? 'green' : 'blue'}
                            variant="subtle"
                          >
                            {enrollment.completed ? 'Completed' : 'In Progress'}
                          </Badge>
                        </Flex>
                      </Box>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        rightIcon={<Play size={16} />}
                      >
                        Continue
                      </Button>
                    </Flex>
                  </Box>
                ))}
                
                {enrollments.length === 0 && (
                  <Box textAlign="center" py={8}>
                    <Icon as={BookOpen} size="48px" color="gray.400" mb={4} />
                    <Text color={textColor} mb={4}>
                      You haven't enrolled in any courses yet.
                    </Text>
                    <Button colorScheme="blue" onClick={handleContinueLearning}>
                      Explore Courses
                    </Button>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Learning Tips */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardHeader>
            <Heading size="md" color={headingColor}>💡 Learning Tips</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="start" spacing={3}>
              <Text color={textColor}>
                • Set aside 15-30 minutes daily for consistent learning
              </Text>
              <Text color={textColor}>
                • Complete quizzes to reinforce your understanding
              </Text>
              <Text color={textColor}>
                • Take notes while watching video lessons
              </Text>
              <Text color={textColor}>
                • Practice what you learn in real-world scenarios
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default StudentDashboard;
