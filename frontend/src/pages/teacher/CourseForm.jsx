import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Heading,
  useToast,
  FormErrorMessage,
  Switch,
  HStack,
  Text,
  Spinner,
  Image,
  IconButton,
  Tooltip,
  Select,
} from '@chakra-ui/react';
import { FiUpload, FiX } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import { adminApi } from '../../services/api';

const CourseForm = () => {
  const { courseId } = useParams();
  const isEditing = !!courseId;
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_published: false,
    thumbnail: null,
    thumbnail_url: '',
    video_url: '',
    content_type: 'text',
  });

  // Load course data if editing
  useEffect(() => {
    if (isEditing) {
      const loadCourse = async () => {
        try {
          setIsLoading(true);
          const response = await adminApi.getCourse(courseId);
          const course = response.data;
          setFormData({
            title: course.title,
            description: course.description || '',
            is_published: course.is_published || false,
            thumbnail: null,
            thumbnail_url: course.thumbnail_url || '',
            video_url: course.video_url || '',
            content_type: course.content_type || 'text',
          });
        } catch (error) {
          console.error('Error loading course:', error);
          toast({
            title: 'Error',
            description: 'Failed to load course data',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          navigate('/teacher/dashboard');
        } finally {
          setIsLoading(false);
        }
      };
      
      loadCourse();
    }
  }, [courseId, isEditing, navigate, toast]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setFormData(prev => ({
          ...prev,
          thumbnail: file,
          thumbnail_url: file ? URL.createObjectURL(file) : prev.thumbnail_url,
        }));
      }
    },
  });

  const removeThumbnail = (e) => {
    e.stopPropagation();
    setFormData(prev => ({
      ...prev,
      thumbnail: null,
      thumbnail_url: '',
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Handle file upload if a new thumbnail is selected
      let thumbnailUrl = formData.thumbnail_url;
      
      if (formData.thumbnail) {
        const formDataFile = new FormData();
        formDataFile.append('file', formData.thumbnail);
        
        const uploadResponse = await adminApi.uploadFile(formDataFile);
        
        thumbnailUrl = uploadResponse.data.url;
      }
      
      const courseData = {
        title: formData.title,
        description: formData.description,
        is_published: formData.is_published,
        thumbnail_url: thumbnailUrl,
        video_url: formData.video_url,
        content_type: formData.content_type,
      };
      
      if (isEditing) {
        await adminApi.updateCourse(courseId, courseData);
        toast({
          title: 'Success',
          description: 'Course updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await adminApi.createCourse(courseData);
        toast({
          title: 'Success',
          description: 'Course created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      navigate('/teacher/dashboard');
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to save course',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="60vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <Box mb={8}>
        <Heading size="lg" mb={2}>
          {isEditing ? 'Edit Course' : 'Create New Course'}
        </Heading>
        <Text color="gray.500">
          {isEditing 
            ? 'Update your course information' 
            : 'Fill in the details below to create a new course'}
        </Text>
      </Box>

      <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
        <form onSubmit={handleSubmit}>
          <VStack spacing={6}>
            {/* Course Thumbnail */}
            <FormControl>
              <FormLabel>Course Thumbnail</FormLabel>
              <Box
                {...getRootProps()}
                border="2px dashed"
                borderColor="gray.300"
                borderRadius="lg"
                p={6}
                textAlign="center"
                cursor="pointer"
                _hover={{ borderColor: 'blue.400' }}
                transition="all 0.2s"
                position="relative"
                minH="200px"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
              >
                <input {...getInputProps()} />
                
                {formData.thumbnail_url ? (
                  <Box position="relative" width="100%" maxW="400px">
                    <Image
                      src={formData.thumbnail_url}
                      alt="Course thumbnail"
                      maxH="200px"
                      mx="auto"
                      borderRadius="md"
                      objectFit="cover"
                    />
                    <Tooltip label="Remove thumbnail">
                      <IconButton
                        aria-label="Remove thumbnail"
                        icon={<FiX />}
                        size="sm"
                        position="absolute"
                        top={2}
                        right={2}
                        colorScheme="red"
                        isRound
                        onClick={removeThumbnail}
                      />
                    </Tooltip>
                  </Box>
                ) : (
                  <VStack spacing={2}>
                    <FiUpload size={32} color="#718096" />
                    <Text>Drag & drop an image here, or click to select</Text>
                    <Text fontSize="sm" color="gray.500">
                      Recommended size: 1280x720px (16:9)
                    </Text>
                  </VStack>
                )}
              </Box>
            </FormControl>

            {/* Course Title */}
            <FormControl isInvalid={!!errors.title} isRequired>
              <FormLabel>Course Title</FormLabel>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter course title"
                size="lg"
              />
              <FormErrorMessage>{errors.title}</FormErrorMessage>
            </FormControl>

            {/* Course Description */}
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter course description"
                rows={6}
              />
            </FormControl>

            {/* Content Type */}
            <FormControl>
              <FormLabel>Content Type</FormLabel>
              <Select
                name="content_type"
                value={formData.content_type}
                onChange={handleChange}
              >
                <option value="text">Text Only</option>
                <option value="video">Video Only</option>
                <option value="mixed">Text + Video</option>
              </Select>
            </FormControl>

            {/* Video URL */}
            {(formData.content_type === 'video' || formData.content_type === 'mixed') && (
              <FormControl>
                <FormLabel>Video URL</FormLabel>
                <Input
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleChange}
                  placeholder="Enter YouTube or video URL"
                  type="url"
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Supports YouTube, Vimeo, and direct video links
                </Text>
              </FormControl>
            )}

            {/* Publish Toggle */}
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="is_published" mb="0">
                Publish Course
              </FormLabel>
              <Switch
                id="is_published"
                name="is_published"
                isChecked={formData.is_published}
                onChange={handleChange}
                colorScheme="blue"
              />
              <Text ml={2} color="gray.600" fontSize="sm">
                {formData.is_published ? 'Published' : 'Draft'}
              </Text>
            </FormControl>

            {/* Form Actions */}
            <HStack spacing={4} w="100%" pt={4} borderTopWidth="1px">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                isDisabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isSubmitting}
                loadingText={isEditing ? 'Updating...' : 'Creating...'}
              >
                {isEditing ? 'Update Course' : 'Create Course'}
              </Button>
            </HStack>
          </VStack>
        </form>
      </Box>
    </Container>
  );
};

export default CourseForm;
