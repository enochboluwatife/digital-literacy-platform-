import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Icon,
  Badge,
  Button,
  Collapse,
  useDisclosure,
  useColorModeValue,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  useBreakpointValue,
  SlideFade,
  ScaleFade
} from '@chakra-ui/react';
import { Play, Lock, CheckCircle, ChevronDown, ChevronUp, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useCourseModules } from '../../hooks/useCourseModules';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const ModuleItem = React.memo(({ 
  module, 
  index, 
  isExpanded, 
  onToggle, 
  courseId, 
  enrolled, 
  onLessonComplete 
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.800');
  const isMobile = useBreakpointValue({ base: true, md: false });

  const calculateModuleProgress = useCallback((module) => {
    if (!module.lessons?.length) return 0;
    const completed = module.lessons.filter(l => l.completed).length;
    return Math.round((completed / module.lessons.length) * 100);
  }, []);

  const moduleProgress = useMemo(() => calculateModuleProgress(module), [module, calculateModuleProgress]);

  const formatDuration = useCallback((minutes) => {
    if (!minutes) return '0 min';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  }, []);

  const getModuleIcon = useCallback((type) => {
    const icons = {
      video: { icon: Play, color: 'blue.500' },
      quiz: { icon: FileText, color: 'green.500' },
      assignment: { icon: Award, color: 'purple.500' },
      default: { icon: FileText, color: 'gray.500' }
    };
    const { icon: Icon, color } = icons[type] || icons.default;
    return <Icon size={16} color={color} />;
  }, []);

  return (
    <MotionBox
      w="100%"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Flex
        p={4}
        align="center"
        cursor="pointer"
        onClick={onToggle}
        _hover={{ bg: hoverBg }}
        transition="background-color 0.2s"
      >
        <Flex align="center" flex={1} direction={{ base: 'column', md: 'row' }}>
          <Box 
            mr={{ base: 0, md: 4 }} 
            mb={{ base: 2, md: 0 }}
            color={moduleProgress === 100 ? 'green.500' : 'gray.400'}
          >
            {moduleProgress === 100 ? (
              <Icon as={CheckCircle} size={20} />
            ) : module.locked && !enrolled ? (
              <Icon as={Lock} size={20} />
            ) : (
              <Text w={5} textAlign="center" fontWeight="medium">
                {index + 1}
              </Text>
            )}
          </Box>
          
          <Box flex={1} textAlign={{ base: 'center', md: 'left' }}>
            <Flex 
              align={{ base: 'center', md: 'flex-start' }}
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
            >
              <Text 
                fontWeight={isExpanded ? 'semibold' : 'normal'} 
                mb={{ base: 2, md: 0 }}
              >
                {module.title}
              </Text>
              
              <HStack spacing={4}>
                {module.duration_minutes > 0 && (
                  <HStack spacing={1} color="gray.500">
                    <Icon as={Clock} size={14} />
                    <Text fontSize="sm">{formatDuration(module.duration_minutes)}</Text>
                  </HStack>
                )}
                <Icon 
                  as={isExpanded ? ChevronUp : ChevronDown} 
                  size={20} 
                  color="gray.400"
                />
              </HStack>
            </Flex>
            
            {moduleProgress > 0 && moduleProgress < 100 && (
              <Box mt={2} maxW="200px" mx={{ base: 'auto', md: 0 }}>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="xs" color="gray.500">
                    {moduleProgress}% complete
                  </Text>
                </Flex>
                <Box h="4px" bg="gray.100" borderRadius="full" overflow="hidden">
                  <Box 
                    h="100%" 
                    bg="blue.500" 
                    borderRadius="full"
                    style={{ width: `${moduleProgress}%` }}
                    transition="width 0.3s ease"
                  />
                </Box>
              </Box>
            )}
          </Box>
        </Flex>
      </Flex>
      
      <Collapse in={isExpanded} animateOpacity>
        <Box 
          pl={{ base: 4, md: 16 }} 
          pr={4} 
          pb={4} 
          bg={useColorModeValue('gray.50', 'gray.800')}
        >
          {module.description && (
            <Text color="gray.600" mb={3} fontSize="sm">
              {module.description}
            </Text>
          )}
          
          <VStack align="stretch" spacing={2} mt={2}>
            {module.lessons?.map((lesson, lessonIndex) => (
              <ScaleFade key={lesson.id} in={true} initialScale={0.95}>
                <Flex
                  as={enrolled && !lesson.locked ? Link : 'div'}
                  to={enrolled && !lesson.locked ? 
                    `/courses/${courseId}/modules/${module.id}/lessons/${lesson.id}` : '#'}
                  p={3}
                  borderRadius="md"
                  bg={cardBg}
                  borderWidth="1px"
                  borderColor={useColorModeValue('gray.200', 'gray.600')}
                  opacity={!enrolled && lesson.locked ? 0.7 : 1}
                  _hover={enrolled && !lesson.locked ? { 
                    transform: 'translateY(-2px)',
                    shadow: 'sm',
                    borderColor: 'blue.200'
                  } : {}}
                  transition="all 0.2s"
                >
                  <HStack spacing={3} flex={1}>
                    <Box color={lesson.completed ? 'green.500' : 'gray.400'}>
                      {lesson.completed ? (
                        <Icon as={CheckCircle} size={18} />
                      ) : (
                        <Text w={5} textAlign="center" fontSize="sm" color="gray.500">
                          {lessonIndex + 1}
                        </Text>
                      )}
                    </Box>
                    <Box flex={1}>
                      <Text 
                        fontSize="sm" 
                        fontWeight={lesson.active ? 'medium' : 'normal'}
                        noOfLines={1}
                      >
                        {lesson.title}
                      </Text>
                      <HStack 
                        spacing={3} 
                        mt={1} 
                        color="gray.500"
                        flexWrap="wrap"
                        rowGap={1}
                      >
                        {lesson.type && (
                          <HStack spacing={1} flexShrink={0}>
                            {getModuleIcon(lesson.type)}
                            <Text fontSize="xs" textTransform="capitalize">
                              {lesson.type}
                            </Text>
                          </HStack>
                        )}
                        {lesson.duration_minutes > 0 && (
                          <HStack spacing={1} flexShrink={0}>
                            <Icon as={Clock} size={14} />
                            <Text fontSize="xs">{formatDuration(lesson.duration_minutes)}</Text>
                          </HStack>
                        )}
                        {!enrolled && lesson.locked && (
                          <HStack spacing={1} flexShrink={0}>
                            <Icon as={Lock} size={14} />
                            <Text fontSize="xs">Locked</Text>
                          </HStack>
                        )}
                      </HStack>
                    </Box>
                    {lesson.preview && !enrolled && (
                      <Badge 
                        colorScheme="blue" 
                        variant="outline" 
                        fontSize="xs"
                        flexShrink={0}
                      >
                        Preview
                      </Badge>
                    )}
                  </HStack>
                </Flex>
              </ScaleFade>
            ))}
          </VStack>
        </Box>
      </Collapse>
    </MotionBox>
  );
});

const CourseModules = ({ courseId }) => {
  const { isOpen, onToggle } = useDisclosure();
  const [expandedModules, setExpandedModules] = useState({});
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const {
    modules,
    isLoading,
    error,
    enrolled,
    progress,
    refresh
  } = useCourseModules(courseId);
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const toggleModule = useCallback((moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  }, []);

  const handleRetry = useCallback(() => {
    refresh();
  }, [refresh]);

  const visibleModules = useMemo(() => {
    return isOpen ? modules : modules.slice(0, 3);
  }, [isOpen, modules]);

  const totalDuration = useMemo(() => {
    return modules.reduce((acc, mod) => acc + (mod.duration_minutes || 0), 0);
  }, [modules]);

  const totalLessons = useMemo(() => {
    return modules.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0);
  }, [modules]);

  const formatDuration = useCallback((minutes) => {
    if (!minutes) return '0 min';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  }, []);

  if (isLoading) {
    return (
      <Box borderWidth="1px" borderRadius="lg" overflow="hidden" borderColor={borderColor}>
        <Box p={6} borderBottomWidth="1px" borderColor={borderColor}>
          <Skeleton height="30px" width="200px" mb={2} />
          <Skeleton height="20px" width="150px" />
        </Box>
        {[1, 2, 3].map((i) => (
          <Box key={i} p={4} borderBottomWidth="1px" borderColor={borderColor}>
            <Skeleton height="24px" mb={2} />
            <Skeleton height="16px" width="80%" />
          </Box>
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="lg" variant="subtle" flexDirection="column">
        <AlertIcon as={AlertCircle} boxSize="24px" mr={0} mb={2} />
        <AlertTitle>Error Loading Course Content</AlertTitle>
        <AlertDescription mb={4}>
          {error.message || 'Failed to load course modules. Please try again.'}
        </AlertDescription>
        <Button 
          leftIcon={<RefreshCw size={16} />} 
          colorScheme="red" 
          variant="outline" 
          onClick={handleRetry}
          size="sm"
        >
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      overflow="hidden" 
      borderColor={borderColor}
      shadow="sm"
    >
      <Box 
        bg={useColorModeValue('gray.50', 'gray.800')} 
        px={6} 
        py={4} 
        borderBottomWidth="1px"
        borderColor={borderColor}
      >
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align={{ base: 'flex-start', md: 'center' }}
          gap={4}
        >
          <Box>
            <Text fontWeight="bold" fontSize="lg" mb={1}>Course Content</Text>
            <Text color="gray.600" fontSize="sm">
              {modules.length} modules • {totalLessons} lessons • {formatDuration(totalDuration)}
            </Text>
          </Box>
          
          {progress > 0 && (
            <Box>
              <Text fontSize="sm" color="gray.600" textAlign={{ base: 'left', md: 'right' }} mb={1}>
                {progress}% Complete
              </Text>
              <Box h="6px" bg="gray.200" borderRadius="full" w="120px" overflow="hidden">
                <Box 
                  h="100%" 
                  bg="green.500" 
                  borderRadius="full"
                  style={{ width: `${progress}%` }}
                  transition="width 0.5s ease-in-out"
                />
              </Box>
            </Box>
          )}
        </Flex>
      </Box>
      
      <VStack spacing={0} divider={<Box borderBottomWidth="1px" borderColor={borderColor} />}>
        <SlideFade in={!isLoading} offsetY="20px">
          {visibleModules.map((module, index) => (
            <ModuleItem
              key={module.id}
              module={module}
              index={index}
              isExpanded={!!expandedModules[module.id]}
              onToggle={() => toggleModule(module.id)}
              courseId={courseId}
              enrolled={enrolled}
              onLessonComplete={() => {}}
            />
          ))}
        </SlideFade>
      </VStack>
      
      {modules.length > 3 && (
        <Box 
          textAlign="center" 
          p={4} 
          borderTopWidth="1px" 
          borderColor={borderColor}
          bg={useColorModeValue('white', 'gray.900')}
        >
          <Button 
            variant="ghost" 
            colorScheme="blue" 
            size="sm"
            onClick={onToggle}
            rightIcon={isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          >
            {isOpen ? 'Show Less' : `Show All ${modules.length} Modules`}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CourseModules;