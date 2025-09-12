import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button,
  Flex,
  Grid,
  Heading, 
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid, 
  Spinner, 
  Stack,
  Text, 
  useToast,
  Badge,
  Icon
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { coursesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CourseImagePlaceholder from '../components/CourseImagePlaceholder';
import { BookOpen, Search, Filter, Star, Clock, Users as UsersIcon } from 'lucide-react';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const toast = useToast();
  
  // Mock categories - replace with actual categories from your backend
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
    { id: 'programming', name: 'Programming' },
    { id: 'design', name: 'Design' },
    { id: 'business', name: 'Business' },
  ];
  
  const difficultyLevels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
  ];

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await coursesApi.getAllCourses();
        setCourses(response.data);
        setFilteredCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        console.error('Error details:', error.response?.data || error.message);
        toast({
          title: 'Error',
          description: 'Failed to load courses. Please try again later.',
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
  
  // Filter courses based on search and filters
  useEffect(() => {
    let result = [...courses];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        course => 
          course.title.toLowerCase().includes(searchLower) ||
          (course.description && course.description.toLowerCase().includes(searchLower)) ||
          (course.instructor_name && course.instructor_name.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply category filter
    if (category !== 'all') {
      result = result.filter(course => 
        course.categories && course.categories.includes(category)
      );
    }
    
    // Apply difficulty filter
    if (difficulty !== 'all') {
      result = result.filter(course => 
        course.difficulty_level && course.difficulty_level.toLowerCase() === difficulty
      );
    }
    
    setFilteredCourses(result);
  }, [searchTerm, category, difficulty, courses]);

  if (loading) {
    return (
      <Box textAlign="center" py={20}>
        <Spinner size="xl" />
        <Text mt={4}>Loading courses...</Text>
      </Box>
    );
  }

  // Calculate course duration in hours
  const getCourseDuration = (minutes) => {
    if (!minutes) return 'Self-paced';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }} py={12}>
      <Box textAlign="center" mb={12}>
        <Heading as="h1" size="2xl" fontWeight="bold" mb={4}>
          Explore Our Courses
        </Heading>
        <Text fontSize="xl" color="gray.600" maxW="2xl" mx="auto">
          Start learning from the best courses. Improve your digital skills today.
        </Text>
      </Box>
      
      {/* Search and Filter Section */}
      <Box mb={8}>
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr 1fr' }} gap={4} mb={6}>
          <Box>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={Search} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="white"
                borderColor="gray.200"
                _hover={{ borderColor: 'gray.300' }}
                _focus={{
                  borderColor: 'blue.500',
                  boxShadow: '0 0 0 1px #3182ce',
                }}
              />
            </InputGroup>
          </Box>
          
          <Box>
            <Select
              placeholder="Select category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              bg="white"
              borderColor="gray.200"
              _hover={{ borderColor: 'gray.300' }}
              leftIcon={<Icon as={Filter} />}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </Box>
          
          <Box>
            <Select
              placeholder="Difficulty level"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              bg="white"
              borderColor="gray.200"
              _hover={{ borderColor: 'gray.300' }}
            >
              {difficultyLevels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </Select>
          </Box>
        </Grid>
        
        <Flex justify="space-between" align="center" mb={4}>
          <Text color="gray.600">
            {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
          </Text>
        </Flex>
      </Box>

      {loading ? (
        <Box textAlign="center" py={20}>
          <Spinner size="xl" />
          <Text mt={4}>Loading courses...</Text>
        </Box>
      ) : filteredCourses.length === 0 ? (
        <Box textAlign="center" py={20} bg="gray.50" borderRadius="lg">
          <BookOpen size={48} style={{ margin: '0 auto 1rem' }} />
          <Heading size="lg" mb={2}>
            No courses found
          </Heading>
          <Text color="gray.600" mb={6}>
            We couldn't find any courses matching your search. Try adjusting your filters.
          </Text>
          <Button 
            colorScheme="blue" 
            leftIcon={<Icon as={Filter} />}
            onClick={() => {
              setSearchTerm('');
              setCategory('all');
              setDifficulty('all');
            }}
          >
            Clear all filters
          </Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          {filteredCourses.map((course) => (
            <Box
              key={course.id}
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              bg="white"
              boxShadow="sm"
              _hover={{
                transform: 'translateY(-4px)',
                boxShadow: 'lg',
                transition: 'all 0.2s',
              }}
              transition="all 0.2s"
              display="flex"
              flexDirection="column"
              h="100%"
            >
              <Box position="relative">
                <Image
                  src={course.thumbnail_url}
                  alt={course.title}
                  h="180px"
                  w="100%"
                  objectFit="cover"
                  fallback={
                    <CourseImagePlaceholder 
                      courseTitle={course.title} 
                      height="180px" 
                    />
                  }
                />
                {course.is_featured && (
                  <Badge 
                    position="absolute" 
                    top={3} 
                    left={3} 
                    colorScheme="yellow"
                    px={2}
                    py={1}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    Featured
                  </Badge>
                )}
                <Badge 
                  position="absolute" 
                  top={3} 
                  right={3} 
                  colorScheme={course.difficulty_level === 'beginner' ? 'green' : 
                              course.difficulty_level === 'intermediate' ? 'blue' : 'red'}
                  px={2}
                  py={1}
                  borderRadius="full"
                  fontSize="xs"
                  textTransform="capitalize"
                >
                  {course.difficulty_level || 'All Levels'}
                </Badge>
              </Box>
              
              <Box p={6} flexGrow={1} display="flex" flexDirection="column">
                <Flex justify="space-between" align="flex-start" mb={3}>
                  <Box>
                    <Badge colorScheme={course.is_published ? 'green' : 'gray'} mb={2}>
                      {course.is_published ? 'Available' : 'Coming Soon'}
                    </Badge>
                    <Heading as="h3" size="md" mb={2} noOfLines={2}>
                      {course.title}
                    </Heading>
                  </Box>
                </Flex>
                
                <Text color="gray.600" mb={4} noOfLines={3} flexGrow={1}>
                  {course.description || 'No description available.'}
                </Text>
                
                <Box mt="auto">
                  <Flex justify="space-between" align="center" mb={4} color="gray.500" fontSize="sm">
                    <Flex align="center">
                      <Icon as={Clock} size={16} mr={1} />
                      <Text>{getCourseDuration(course.duration_minutes)}</Text>
                    </Flex>
                    <Flex align="center">
                      <Icon as={UsersIcon} size={16} mr={1} />
                      <Text>{course.enrollment_count || 0} enrolled</Text>
                    </Flex>
                    <Flex align="center">
                      <Icon as={Star} size={16} mr={1} fill="currentColor" color={course.rating ? 'yellow.400' : 'gray.300'} />
                      <Text>{course.rating ? course.rating.toFixed(1) : 'N/A'}</Text>
                    </Flex>
                  </Flex>
                  
                  <Button
                    as={Link}
                    to={`/courses/${course.id}`}
                    colorScheme="blue"
                    size="md"
                    width="100%"
                    variant={course.is_published ? 'solid' : 'outline'}
                    rightIcon={<BookOpen size={16} />}
                    isDisabled={!course.is_published}
                  >
                    {course.is_published ? 'Start Learning' : 'Coming Soon'}
                  </Button>
                </Box>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default CourseList;
