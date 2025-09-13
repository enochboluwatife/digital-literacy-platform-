import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  SimpleGrid,
  Card,
  CardBody,
  CardFooter,
  Stack,
  Badge,
  useColorModeValue,
  Center,
  Spinner,
  useToast,
  ButtonGroup
} from '@chakra-ui/react';
import { BookOpen, Star, ArrowRight } from 'lucide-react';
import { coursesApi } from '../services/api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await coursesApi.getCourses();
        setCourses(response.data || []);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
        toast({
          title: 'Error',
          description: 'Failed to load courses. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [toast]);

  if (loading) {
    return (
      <Center minH="60vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center minH="60vh">
        <Text color="red.500">{error}</Text>
      </Center>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading as="h1" size="2xl" mb={4} color={headingColor}>
            Available Courses
          </Heading>
          <Text fontSize="lg" color={textColor} maxW="3xl">
            Explore our comprehensive courses designed to enhance your digital literacy skills.
            Start learning today and unlock new opportunities.
          </Text>
        </Box>

        {courses.length === 0 ? (
          <Center minH="300px">
            <VStack spacing={4}>
              <Text fontSize="lg" color={textColor}>
                No courses available at the moment.
              </Text>
              <Button
                colorScheme="blue"
                rightIcon={<ArrowRight size={18} />}
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </VStack>
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {courses.map((course) => (
              <Card
                key={course.id}
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                _hover={{
                  transform: 'translateY(-4px)',
                  boxShadow: 'lg',
                  transition: 'all 0.2s',
                }}
                height="100%"
                display="flex"
                flexDirection="column"
              >
                <Box h="160px" bg="gray.100" overflow="hidden">
                  {course.imageUrl ? (
                    <Box
                      as="img"
                      src={course.imageUrl}
                      alt={course.title}
                      objectFit="cover"
                      w="100%"
                      h="100%"
                    />
                  ) : (
                    <Center h="100%" bg="blue.50">
                      <BookOpen size={48} color="#CBD5E0" />
                    </Center>
                  )}
                </Box>
                
                <CardBody flexGrow={1}>
                  <Stack spacing={3}>
                    <HStack>
                      <Badge colorScheme="blue">{course.level || 'Beginner'}</Badge>
                      <Text fontSize="sm" color={textColor}>
                        {course.duration || '4 weeks'}
                      </Text>
                    </HStack>
                    
                    <Heading size="md" color={headingColor} noOfLines={2}>
                      {course.title}
                    </Heading>
                    
                    <Text color={textColor} noOfLines={3}>
                      {course.description}
                    </Text>
                    
                    <HStack spacing={2} color="yellow.500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          fill={star <= Math.floor(course.rating || 4.5) ? 'currentColor' : 'none'}
                        />
                      ))}
                      <Text fontSize="sm" color={textColor} ml={1}>
                        ({course.reviews || 0} reviews)
                      </Text>
                    </HStack>
                  </Stack>
                </CardBody>
                
                <CardFooter pt={0}>
                  <ButtonGroup spacing={2} width="100%">
                    <Button
                      variant="outline"
                      flex={1}
                      onClick={() => navigate(`/courses/${course.id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      colorScheme="blue"
                      flex={1}
                      rightIcon={<ArrowRight size={18} />}
                      onClick={() => navigate(`/courses/${course.id}/view`)}
                    >
                      Start
                    </Button>
                  </ButtonGroup>
                </CardFooter>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  );
};

export default Courses;
