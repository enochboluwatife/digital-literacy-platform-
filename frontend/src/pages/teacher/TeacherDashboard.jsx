import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Button,
  VStack,
  HStack,
  Card,
  CardBody,
  useColorModeValue,
  Icon,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Spinner,
  Center
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { BookOpen, Users, TrendingUp, Plus, Edit, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalEnrollments: 0
  });
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { user } = useAuth();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Fetch teacher's courses
      const response = await adminApi.getCourses({ teacher_id: user?.id });
      setCourses(response.data || []);
      
      // Update stats
      setStats({
        totalCourses: response.data?.length || 0,
        totalStudents: response.data?.reduce((acc, course) => acc + (course.enrollment_count || 0), 0) || 0,
        totalEnrollments: response.data?.reduce((acc, course) => acc + (course.enrollment_count || 0), 0) || 0
      });
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load courses',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Container maxW="7xl" py={8}>
      <VStack align="stretch" spacing={8}>
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            Welcome back, {user?.first_name}!
          </Heading>
          <Text color="gray.600">
            Manage your courses and track student progress
          </Text>
        </Box>

        {/* Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Card bg={bgColor} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Total Courses</StatLabel>
                <StatNumber>{stats.totalCourses}</StatNumber>
                <StatHelpText>
                  <Icon as={BookOpen} mr={1} />
                  Your created courses
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Total Students</StatLabel>
                <StatNumber>{stats.totalStudents}</StatNumber>
                <StatHelpText>
                  <Icon as={Users} mr={1} />
                  Enrolled students
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Total Enrollments</StatLabel>
                <StatNumber>{stats.totalEnrollments}</StatNumber>
                <StatHelpText>
                  <Icon as={TrendingUp} mr={1} />
                  Course enrollments
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Quick Actions */}
        <Card bg={bgColor} border="1px" borderColor={borderColor}>
          <CardBody>
            <HStack justify="space-between" mb={4}>
              <Heading size="md">Quick Actions</Heading>
            </HStack>
            <HStack spacing={4}>
              <Button
                as={RouterLink}
                to="/teacher/courses"
                leftIcon={<Icon as={Plus} />}
                colorScheme="blue"
              >
                Create New Course
              </Button>
              <Button
                as={RouterLink}
                to="/courses"
                leftIcon={<Icon as={Eye} />}
                variant="outline"
              >
                View All Courses
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* My Courses */}
        <Card bg={bgColor} border="1px" borderColor={borderColor}>
          <CardBody>
            <HStack justify="space-between" mb={4}>
              <Heading size="md">My Courses</Heading>
              <Button
                as={RouterLink}
                to="/teacher/courses"
                size="sm"
                leftIcon={<Icon as={Plus} />}
              >
                Add Course
              </Button>
            </HStack>
            
            {courses.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Icon as={BookOpen} w={12} h={12} color="gray.400" mb={4} />
                <Text color="gray.500" mb={4}>
                  You haven't created any courses yet
                </Text>
                <Button
                  as={RouterLink}
                  to="/teacher/courses"
                  colorScheme="blue"
                  leftIcon={<Icon as={Plus} />}
                >
                  Create Your First Course
                </Button>
              </Box>
            ) : (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Course Title</Th>
                    <Th>Status</Th>
                    <Th>Enrollments</Th>
                    <Th>Created</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {courses.map((course) => (
                    <Tr key={course.id}>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">{course.title}</Text>
                          <Text fontSize="sm" color="gray.500" noOfLines={1}>
                            {course.description}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={course.is_published ? 'green' : 'gray'}
                          variant="subtle"
                        >
                          {course.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </Td>
                      <Td>{course.enrollment_count || 0}</Td>
                      <Td>{new Date(course.created_at).toLocaleDateString()}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <Button
                            as={RouterLink}
                            to={`/courses/${course.id}`}
                            size="sm"
                            leftIcon={<Icon as={Eye} />}
                          >
                            View
                          </Button>
                          <Button
                            as={RouterLink}
                            to={`/teacher/courses/${course.id}/edit`}
                            size="sm"
                            variant="outline"
                            leftIcon={<Icon as={Edit} />}
                          >
                            Edit
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default TeacherDashboard;
