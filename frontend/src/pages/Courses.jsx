import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Grid,
  GridItem,
  Image,
  Spinner,
  Center,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Collapse,
  Progress,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
  useDisclosure,
  Flex,
  Badge,
  Divider
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { BookOpen, Play, Clock, Users, Star, CheckCircle, Lock } from 'lucide-react';
import CourseImagePlaceholder from '../components/CourseImagePlaceholder';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [activeModule, setActiveModule] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    // Mock course detail data
    const mockCourse = {
      id: Number.parseInt(id),
      title: "Basic Computer Skills",
      description:
        "Learn fundamental computer operations, file management, and basic software usage essential for academic and professional success.",
      duration: "4 weeks",
      students: 1250,
      rating: 4.8,
      level: "Beginner",
      instructor: "Dr. Adebayo Ogundimu",
      image: "/computer-basics-course.jpg",
      modules: [
        {
          id: 1,
          title: "Introduction to Computers",
          duration: "45 min",
          type: "video",
          completed: true,
          locked: false,
          lessons: ["What is a Computer?", "Types of Computers", "Computer Components", "Basic Operations"],
        },
        {
          id: 2,
          title: "Operating System Basics",
          duration: "60 min",
          type: "video",
          completed: true,
          locked: false,
          lessons: ["Understanding Windows", "Desktop Navigation", "File Explorer", "System Settings"],
        },
        {
          id: 3,
          title: "File Management",
          duration: "50 min",
          type: "interactive",
          completed: false,
          locked: false,
          lessons: ["Creating Folders", "Organizing Files", "Copy, Move, Delete", "Search Functions"],
        },
        {
          id: 4,
          title: "Basic Software Applications",
          duration: "75 min",
          type: "video",
          completed: false,
          locked: true,
          lessons: ["Text Editors", "Web Browsers", "Media Players", "Productivity Tools"],
        },
        {
          id: 5,
          title: "Assessment Quiz",
          duration: "30 min",
          type: "quiz",
          completed: false,
          locked: true,
          lessons: ["Module 1-4 Review", "Practical Exercises", "Final Assessment"],
        },
      ],
      progress: 40,
      enrolled: false,
    };

    setTimeout(() => {
      setCourse(mockCourse);
      setLoading(false);
    }, 1000);
  }, [id]);

  if (loading) {
    return (
      <Center minH="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color={textColor}>Loading course...</Text>
        </VStack>
      </Center>
    );
  }

  if (!course) {
    return (
      <Center minH="50vh">
        <VStack spacing={4} textAlign="center">
          <BookOpen size={64} color="gray" />
          <Heading size="lg">Course not found</Heading>
          <Button as={RouterLink} to="/courses" colorScheme="blue">
            Browse Courses
          </Button>
        </VStack>
      </Center>
    );
  }

  return (
    <Container maxW="7xl" py={8}>
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
        {/* Course Content */}
        <GridItem>
          {/* Breadcrumb */}
          <Breadcrumb mb={6}>
            <BreadcrumbItem>
              <BreadcrumbLink as={RouterLink} to="/courses">
                Courses
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>{course.title}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          {/* Course Header */}
          <VStack align="start" spacing={6} mb={8}>
            <Heading size="xl">{course.title}</Heading>
            <Text fontSize="lg" color={textColor}>
              {course.description}
            </Text>

            <HStack spacing={6} fontSize="sm" color={textColor}>
              <HStack>
                <Clock size={16} />
                <Text>{course.duration}</Text>
              </HStack>
              <HStack>
                <Users size={16} />
                <Text>{course.students.toLocaleString()} students</Text>
              </HStack>
              <HStack>
                <Star size={16} />
                <Text>{course.rating}</Text>
              </HStack>
            </HStack>

            <Image
              src={course.image}
              alt={course.title}
              w="full"
              h="64"
              objectFit="cover"
              borderRadius="lg"
              fallback={
                <CourseImagePlaceholder 
                  courseTitle={course.title} 
                  height="256px" 
                />
              }
            />
          </VStack>

          {/* Course Modules */}
          <VStack align="start" spacing={4}>
            <Heading size="lg" mb={4}>Course Content</Heading>
            {course.modules.map((module, index) => (
              <Box
                key={module.id}
                w="full"
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                p={4}
              >
                <Flex justify="space-between" align="center">
                  <HStack spacing={3}>
                    <Box>
                      {module.completed ? (
                        <CheckCircle size={24} color="green" />
                      ) : module.locked ? (
                        <Lock size={24} color="gray" />
                      ) : (
                        <Play size={24} color="blue" />
                      )}
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Heading size="md">{module.title}</Heading>
                      <HStack spacing={2}>
                        <Text fontSize="sm" color={textColor}>
                          {module.duration}
                        </Text>
                        <Text fontSize="sm" color={textColor}>•</Text>
                        <Badge colorScheme="blue" size="sm">
                          {module.type}
                        </Badge>
                      </HStack>
                    </VStack>
                  </HStack>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    onClick={() => setActiveModule(activeModule === index ? -1 : index)}
                    isDisabled={module.locked}
                  >
                    {activeModule === index ? "Hide" : "Show"} Details
                  </Button>
                </Flex>

                <Collapse in={activeModule === index}>
                  <Box mt={4} pt={4} borderTopWidth="1px" borderColor={borderColor}>
                    <Heading size="sm" mb={2}>Lessons:</Heading>
                    <List spacing={1}>
                      {module.lessons.map((lesson, lessonIndex) => (
                        <ListItem key={lessonIndex} fontSize="sm" color={textColor}>
                          <ListIcon as={() => <Box w={1} h={1} bg="blue.500" borderRadius="full" />} />
                          {lesson}
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Collapse>
              </Box>
            ))}
          </VStack>
        </GridItem>

        {/* Sidebar */}
        <GridItem>
          <Box
            bg={cardBg}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            p={6}
            position="sticky"
            top="24"
          >
            <VStack spacing={6}>
              <VStack textAlign="center">
                <Heading size="2xl" color="blue.500">Free</Heading>
                <Text color={textColor}>Full access to all content</Text>
              </VStack>

              {course.enrolled ? (
                <VStack spacing={4} w="full">
                  <Box w="full">
                    <Flex justify="space-between" fontSize="sm" mb={2}>
                      <Text color={textColor}>Progress</Text>
                      <Text>{course.progress}%</Text>
                    </Flex>
                    <Progress value={course.progress} colorScheme="blue" />
                  </Box>
                  <Button colorScheme="blue" size="lg" w="full">
                    Continue Learning
                  </Button>
                </VStack>
              ) : (
                <Button colorScheme="blue" size="lg" w="full">
                  Enroll Now
                </Button>
              )}

              <Divider />

              <VStack align="start" w="full" spacing={4}>
                <Heading size="md">Course Includes:</Heading>
                <List spacing={2} fontSize="sm">
                  <ListItem>
                    <ListIcon as={CheckCircle} color="green.500" />
                    Video lectures
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckCircle} color="green.500" />
                    Interactive exercises
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckCircle} color="green.500" />
                    Quizzes and assessments
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckCircle} color="green.500" />
                    Certificate of completion
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckCircle} color="green.500" />
                    Lifetime access
                  </ListItem>
                </List>
              </VStack>

              <Divider />

              <VStack align="start" w="full">
                <Heading size="md">Instructor</Heading>
                <Text fontSize="sm" color={textColor}>
                  {course.instructor}
                </Text>
              </VStack>
            </VStack>
          </Box>
        </GridItem>
      </Grid>
    </Container>
  );
};

export default CourseDetail
