import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Badge,
  useToast,
  Spinner,
  Center,
  HStack,
  VStack,
  Text,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea
} from '@chakra-ui/react';
import { adminApi } from '../../services/api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getCourses();
      setCourses(response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses');
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

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await adminApi.deleteCourse(courseId);
      setCourses(courses.filter(course => course.id !== courseId));
      toast({
        title: 'Success',
        description: 'Course deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete course',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    onOpen();
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
          <Button onClick={fetchCourses}>Retry</Button>
        </VStack>
      </Center>
    );
  }

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between">
          <Heading size="lg">Course Management</Heading>
          <Button colorScheme="blue" onClick={() => handleEditCourse(null)}>
            Add New Course
          </Button>
        </HStack>
        
        <Box
          bg={bgColor}
          borderRadius="lg"
          border="1px"
          borderColor={borderColor}
          overflow="hidden"
        >
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Category</Th>
                <Th>Level</Th>
                <Th>Status</Th>
                <Th>Enrollments</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {courses.length === 0 ? (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={8}>
                    <Text color="gray.500">No courses found</Text>
                  </Td>
                </Tr>
              ) : (
                courses.map((course) => (
                  <Tr key={course.id}>
                    <Td>{course.title}</Td>
                    <Td>{course.category}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          course.level === 'beginner' ? 'green' :
                          course.level === 'intermediate' ? 'yellow' : 'red'
                        }
                        variant="subtle"
                      >
                        {course.level}
                      </Badge>
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
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleEditCourse(course)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          Delete
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </VStack>

      {/* Course Edit/Create Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedCourse ? 'Edit Course' : 'Create New Course'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Course Title</FormLabel>
                <Input
                  placeholder="Enter course title"
                  defaultValue={selectedCourse?.title || ''}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  placeholder="Enter course description"
                  defaultValue={selectedCourse?.description || ''}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Category</FormLabel>
                <Input
                  placeholder="Enter course category"
                  defaultValue={selectedCourse?.category || ''}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue">
              {selectedCourse ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Courses;
