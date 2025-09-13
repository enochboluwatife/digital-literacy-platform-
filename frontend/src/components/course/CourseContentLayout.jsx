import React, { useState, useEffect } from 'react';
import { Box, Flex, Progress, Text, VStack, HStack, IconButton, Button, useDisclosure } from '@chakra-ui/react';
import { ChevronLeft, ChevronRight, CheckCircle, Lock, Unlock } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { coursesApi } from '../../services/api';

const ContentSidebar = ({ modules, currentModuleId, onModuleSelect, userProgress }) => {
  return (
    <Box w="300px" borderRight="1px" borderColor="gray.200" p={4} overflowY="auto">
      <VStack align="stretch" spacing={2}>
        {modules.map((module) => (
          <Box
            key={module.id}
            p={3}
            borderRadius="md"
            bg={currentModuleId === module.id ? 'blue.50' : 'transparent'}
            borderLeftWidth={currentModuleId === module.id ? '4px' : '1px'}
            borderLeftColor={currentModuleId === module.id ? 'blue.500' : 'gray.200'}
            cursor="pointer"
            onClick={() => onModuleSelect(module.id)}
            _hover={{ bg: 'gray.50' }}
          >
            <HStack justify="space-between">
              <Text fontWeight={currentModuleId === module.id ? 'semibold' : 'normal'}>
                {module.title}
              </Text>
              {userProgress[module.id]?.status === 'completed' ? (
                <CheckCircle size={16} color="green" />
              ) : userProgress[module.id]?.status === 'in_progress' ? (
                <Unlock size={16} color="blue" />
              ) : (
                <Lock size={16} color="gray" />
              )}
            </HStack>
            {userProgress[module.id]?.progress > 0 && (
              <Progress
                value={userProgress[module.id].progress}
                size="xs"
                colorScheme="blue"
                mt={2}
                borderRadius="full"
              />
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

const ContentViewer = ({ content, onComplete, onNext, onPrevious, hasNext, hasPrevious }) => {
  // Content rendering logic based on content type
  const renderContent = () => {
    switch (content.type) {
      case 'video':
        return (
          <Box>
            <video controls width="100%" style={{ maxHeight: '70vh' }}>
              <source src={content.mediaUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <Box mt={4}>
              <Text fontSize="lg" fontWeight="semibold">{content.title}</Text>
              <Text mt={2} color="gray.600">{content.description}</Text>
            </Box>
          </Box>
        );
      case 'quiz':
        return (
          <Box>
            <Text fontSize="xl" fontWeight="bold" mb={4}>Quiz: {content.title}</Text>
            <Text color="gray.600" mb={6}>{content.description}</Text>
            {/* Quiz questions would be rendered here */}
          </Box>
        );
      default: // text
        return (
          <Box>
            <Text fontSize="2xl" fontWeight="bold" mb={4}>{content.title}</Text>
            <Box
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: content.content }}
            />
          </Box>
        );
    }
  };

  return (
    <Box flex={1} p={8} overflowY="auto">
      {renderContent()}
      <HStack mt={8} justify="space-between">
        <IconButton
          icon={<ChevronLeft />}
          aria-label="Previous"
          isDisabled={!hasPrevious}
          onClick={onPrevious}
        />
        <Button colorScheme="blue" onClick={onComplete}>
          {content.type === 'quiz' ? 'Submit Quiz' : 'Mark as Complete'}
        </Button>
        <IconButton
          icon={<ChevronRight />}
          aria-label="Next"
          isDisabled={!hasNext}
          onClick={onNext}
        />
      </HStack>
    </Box>
  );
};

export const CourseContentLayout = ({ courseId, initialModuleId }) => {
  const { user } = useAuth();
  const [currentModuleId, setCurrentModuleId] = useState(initialModuleId);
  const [modules, setModules] = useState([]);
  const [currentContent, setCurrentContent] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // Fetch course modules
        const modulesResponse = await coursesApi.getCourseModules(courseId);
        setModules(modulesResponse.data);

        // Fetch user progress
        const progressResponse = await coursesApi.getUserProgress(user.id, courseId);
        setUserProgress(progressResponse.data);

        // Set initial content
        if (initialModuleId) {
          const contentResponse = await coursesApi.getModuleContent(initialModuleId);
          setCurrentContent(contentResponse.data);
        } else if (modulesResponse.data.length > 0) {
          const firstModuleId = modulesResponse.data[0].id;
          const contentResponse = await coursesApi.getModuleContent(firstModuleId);
          setCurrentContent(contentResponse.data);
          setCurrentModuleId(firstModuleId);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, initialModuleId, user.id]);

  const handleModuleSelect = async (moduleId) => {
    try {
      setLoading(true);
      const response = await coursesApi.getModuleContent(moduleId);
      setCurrentContent(response.data);
      setCurrentModuleId(moduleId);
    } catch (error) {
      console.error('Error loading module content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContentComplete = async () => {
    try {
      await coursesApi.updateUserProgress(user.id, currentModuleId, {
        status: 'completed',
        progress: 100
      });
      
      // Update local state
      setUserProgress(prev => ({
        ...prev,
        [currentModuleId]: {
          ...prev[currentModuleId],
          status: 'completed',
          progress: 100
        }
      }));
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const currentIndex = modules.findIndex(m => m.id === currentModuleId);
  const hasNext = currentIndex < modules.length - 1;
  const hasPrevious = currentIndex > 0;

  const handleNext = () => {
    if (hasNext) {
      const nextModule = modules[currentIndex + 1];
      handleModuleSelect(nextModule.id);
    }
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      const prevModule = modules[currentIndex - 1];
      handleModuleSelect(prevModule.id);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="50vh">
        <Text>Loading...</Text>
      </Box>
    );
  }

  if (!currentContent) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="50vh">
        <Text>No content available</Text>
      </Box>
    );
  }

  return (
    <Flex h="calc(100vh - 64px)" bg="white">
      <ContentSidebar
        modules={modules}
        currentModuleId={currentModuleId}
        onModuleSelect={handleModuleSelect}
        userProgress={userProgress}
      />
      <ContentViewer
        content={currentContent}
        onComplete={handleContentComplete}
        onNext={handleNext}
        onPrevious={handlePrevious}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
      />
    </Flex>
  );
};

export default CourseContentLayout;