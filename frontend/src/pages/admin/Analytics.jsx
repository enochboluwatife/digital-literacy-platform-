import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  useToast,
  Spinner,
  Center,
  VStack,
  Text,
  useColorModeValue,
  Progress,
  HStack,
  Badge
} from '@chakra-ui/react';
import { adminApi } from '../../services/api';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getDashboardStats();
      setStats(response.data || {});
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics');
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
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

  if (error) {
    return (
      <Center h="400px">
        <VStack>
          <Text color="red.500">{error}</Text>
          <Button onClick={fetchAnalytics}>Retry</Button>
        </VStack>
      </Center>
    );
  }

  const mockStats = {
    totalUsers: 1250,
    totalCourses: 45,
    totalEnrollments: 3420,
    activeUsers: 892,
    completionRate: 78,
    popularCourses: [
      { title: 'Introduction to Digital Literacy', enrollments: 450 },
      { title: 'Basic Computer Skills', enrollments: 380 },
      { title: 'Internet Safety', enrollments: 320 }
    ]
  };

  const displayStats = stats || mockStats;

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6}>
        <Heading size="lg">Analytics Dashboard</Heading>
        
        {/* Key Metrics */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card bg={bgColor} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Total Users</StatLabel>
                <StatNumber>{displayStats.totalUsers?.toLocaleString() || 0}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  12% from last month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Total Courses</StatLabel>
                <StatNumber>{displayStats.totalCourses || 0}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  5 new this month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Total Enrollments</StatLabel>
                <StatNumber>{displayStats.totalEnrollments?.toLocaleString() || 0}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  23% from last month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Active Users</StatLabel>
                <StatNumber>{displayStats.activeUsers?.toLocaleString() || 0}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  8% from last week
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Course Completion Rate */}
        <Card bg={bgColor} border="1px" borderColor={borderColor}>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Course Completion Rate</Heading>
              <HStack justify="space-between">
                <Text>Overall Completion</Text>
                <Badge colorScheme="green" fontSize="md">
                  {displayStats.completionRate || 0}%
                </Badge>
              </HStack>
              <Progress
                value={displayStats.completionRate || 0}
                colorScheme="green"
                size="lg"
                borderRadius="md"
              />
            </VStack>
          </CardBody>
        </Card>

        {/* Popular Courses */}
        <Card bg={bgColor} border="1px" borderColor={borderColor}>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Most Popular Courses</Heading>
              {displayStats.popularCourses?.map((course, index) => (
                <HStack key={index} justify="space-between" p={3} borderRadius="md" bg={useColorModeValue('gray.50', 'gray.700')}>
                  <Text fontWeight="medium">{course.title}</Text>
                  <Badge colorScheme="blue">
                    {course.enrollments} enrollments
                  </Badge>
                </HStack>
              )) || (
                <Text color="gray.500" textAlign="center">
                  No course data available
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default Analytics;
