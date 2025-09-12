import React, { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Image,
  VStack,
  HStack,
  Badge,
  Spinner,
  Center,
  useColorModeValue,
  Alert,
  AlertIcon,
  Flex
} from '@chakra-ui/react';
import { BookOpen, Clock, Users, Star, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import CourseImagePlaceholder from '../components/CourseImagePlaceholder';

const CourseList = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  // Mock course data
  const mockCourses = [
    {
      id: 1,
      title: "Basic Computer Skills",
      description: "Learn fundamental computer operations, file management, and basic software usage.",
      duration: "4 weeks",
      students: 1250,
      rating: 4.8,
      level: "Beginner",
      image: "/computer-basics.png",
      instructor: "Dr. Adebayo Ogundimu",
    },
    {
      id: 2,
      title: "Internet Safety & Security",
      description: "Understand online threats, privacy protection, and safe browsing practices.",
      duration: "3 weeks",
      students: 980,
      rating: 4.9,
      level: "Beginner",
      image: "/internet-security.jpg",
      instructor: "Prof. Kemi Adeyemi",
    },
    {
      id: 3,
      title: "Digital Communication",
      description: "Master email, social media, and professional online communication.",
      duration: "5 weeks",
      students: 1100,
      rating: 4.7,
      level: "Intermediate",
      image: "/digital-communication.png",
      instructor: "Mr. Chidi Okwu",
    },
    {
      id: 4,
      title: "Microsoft Office Suite",
      description: "Comprehensive training in Word, Excel, PowerPoint, and Outlook.",
      duration: "6 weeks",
      students: 1500,
      rating: 4.8,
      level: "Intermediate",
      image: "/office-suite.png",
      instructor: "Mrs. Fatima Hassan",
    },
    {
      id: 5,
      title: "Web Development Basics",
      description: "Introduction to HTML, CSS, and basic web development concepts.",
      duration: "8 weeks",
      students: 750,
      rating: 4.6,
      level: "Advanced",
      image: "/web-dev.png",
      instructor: "Eng. Samuel Okafor",
    },
    {
      id: 6,
      title: "Data Analysis with Excel",
      description: "Learn data visualization, pivot tables, and basic statistical analysis.",
      duration: "5 weeks",
      students: 650,
      rating: 4.7,
      level: "Intermediate",
      image: "/data-analysis.jpg",
      instructor: "Dr. Aisha Bello",
    },
  ];

  // Fetch courses with proper cleanup
  useEffect(() => {
    let isMounted = true;

    const fetchCourses = async () => {
      try {
        // Simulate API call
        const timer = setTimeout(() => {
          if (isMounted) {
            setCourses(mockCourses);
            setLoading(false);
          }
        }, 1000);

        return () => clearTimeout(timer);
      } catch (error) {
        console.error("Error fetching courses:", error);
        if (isMounted) {
          setError("Failed to load courses. Please try again later.");
          setLoading(false);
        }
      }
    };

    // Check authentication
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    fetchCourses();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, navigate]);

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Center minH="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color={textColor}>Loading courses...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center minH="50vh">
        <Alert status="error" maxW="md">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text>{error}</Text>
            <Button size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </VStack>
        </Alert>
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg={bg}>
      <Container maxW="7xl" py={8}>
        {/* Search Bar */}
        <VStack spacing={8} mb={8}>
          <Heading size="xl" textAlign="center">
            Available Courses
          </Heading>
          <InputGroup maxW="2xl">
            <InputLeftElement pointerEvents="none">
              <Search size={20} color="gray" />
            </InputLeftElement>
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg={cardBg}
              borderColor={borderColor}
            />
          </InputGroup>
        </VStack>

        {/* Courses Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredCourses.map((course) => (
            <Box
              key={course.id}
              bg={cardBg}
              borderRadius="xl"
              overflow="hidden"
              boxShadow="sm"
              _hover={{ boxShadow: "md" }}
              transition="box-shadow 0.2s"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Box as={RouterLink} to={`/courses/${course.id}`}>
                <Box h="48" bg="gray.100" position="relative">
                  <Image
                    src={course.image}
                    alt={course.title}
                    w="full"
                    h="full"
                    objectFit="cover"
                    fallback={
                      <CourseImagePlaceholder 
                        courseTitle={course.title} 
                        height="192px" 
                      />
                    }
                  />
                  <Badge
                    position="absolute"
                    bottom={2}
                    right={2}
                    colorScheme="blue"
                    fontSize="xs"
                  >
                    {course.level}
                  </Badge>
                </Box>
              </Box>
              
              <Box p={5}>
                <Flex justify="space-between" align="start" mb={2}>
                  <Heading
                    as={RouterLink}
                    to={`/courses/${course.id}`}
                    size="md"
                    noOfLines={2}
                    _hover={{ textDecoration: "underline" }}
                  >
                    {course.title}
                  </Heading>
                  <HStack>
                    <Star size={12} fill="gold" color="gold" />
                    <Text fontSize="xs" fontWeight="medium">
                      {course.rating}
                    </Text>
                  </HStack>
                </Flex>
                
                <Text color={textColor} fontSize="sm" mb={4} noOfLines={2}>
                  {course.description}
                </Text>
                
                <Flex justify="space-between" fontSize="sm" color={textColor} mb={4}>
                  <HStack>
                    <Users size={16} />
                    <Text>{course.students} students</Text>
                  </HStack>
                  <HStack>
                    <Clock size={16} />
                    <Text>{course.duration}</Text>
                  </HStack>
                </Flex>
                
                <Box borderTopWidth="1px" borderColor={borderColor} pt={4} mb={4}>
                  <Text fontSize="sm" color={textColor}>
                    Instructor: <Text as="span" color="inherit" fontWeight="medium">{course.instructor}</Text>
                  </Text>
                </Box>
                
                <Button colorScheme="blue" w="full" size="sm">
                  Enroll Now
                </Button>
              </Box>
            </Box>
          ))}
        </SimpleGrid>

        {filteredCourses.length === 0 && (
          <Center py={12}>
            <VStack spacing={4} textAlign="center">
              <BookOpen size={64} color="gray" />
              <Heading size="lg">No courses found</Heading>
              <Text color={textColor}>
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "There are no courses available at the moment"}
              </Text>
            </VStack>
          </Center>
        )}
      </Container>
    </Box>
  );
};

export default CourseList;
