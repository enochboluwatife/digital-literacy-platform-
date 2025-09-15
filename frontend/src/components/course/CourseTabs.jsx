import React from 'react';
import { 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel, 
  Box, 
  Text,
  VStack,
  Heading,
  useColorModeValue,
  Button,
  HStack,
  Icon,
  Badge
} from '@chakra-ui/react';
import { Play, FileText, CheckCircle, Lock } from 'lucide-react';

const ModuleItem = ({ 
  module, 
  isActive, 
  isCompleted,
  onClick 
}) => {
  const bg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <Box
      p={4}
      borderRadius="md"
      borderWidth="1px"
      borderColor={isActive ? 'blue.300' : borderColor}
      bg={isActive ? activeBg : bg}
      _hover={!isActive ? { bg: hoverBg, cursor: 'pointer' } : {}}
      onClick={onClick}
      position="relative"
      transition="all 0.2s"
    >
      <HStack spacing={4} align="flex-start">
        <Box
          w={10}
          h={10}
          borderRadius="full"
          bg={isActive ? 'blue.100' : 'gray.100'}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          color={isActive ? 'blue.600' : 'gray.500'}
        >
          {module.content_type === 'video' ? (
            <Play size={16} fill="currentColor" />
          ) : module.content_type === 'quiz' ? (
            <FileText size={16} />
          ) : (
            <FileText size={16} />
          )}
        </Box>
        
        <Box flex={1}>
          <HStack mb={1}>
            <Text fontWeight="medium">{module.title}</Text>
            {module.content_type === 'quiz' && (
              <Badge colorScheme="purple" size="sm">
                Quiz
              </Badge>
            )}
          </HStack>
          
          <Text fontSize="sm" color="gray.500" noOfLines={1}>
            {module.description || 'No description available'}
          </Text>
          
          {module.duration && (
            <Text fontSize="xs" color="gray.500" mt={1}>
              {module.duration} min
            </Text>
          )}
          
          {module.content_type === 'quiz' && isActive && (
            <Button
              size="sm"
              colorScheme="purple"
              mt={2}
              onClick={(e) => {
                e.stopPropagation();
                // This will be handled by the parent component
                if (onClick) onClick(module, true); // Pass true to indicate quiz start
              }}
            >
              Take Quiz
            </Button>
          )}
        </Box>
        
        <Box>
          {isCompleted ? (
            <Icon as={CheckCircle} color="green.500" />
          ) : module.locked ? (
            <Icon as={Lock} color="gray.400" />
          ) : null}
        </Box>
      </HStack>
    </Box>
  );
};

const CourseTabs = ({ course, activeModule, onModuleClick }) => {
  const handleModuleSelect = (module, index) => {
    onModuleClick(module, index);
  };

  if (!course?.modules?.length) {
    return (
      <Box p={6} textAlign="center" bg="white" borderRadius="md" boxShadow="sm">
        <Text color="gray.500">No modules available for this course yet.</Text>
      </Box>
    );
  }

  return (
    <Box mt={8}>
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Course Content</Tab>
          <Tab>Overview</Tab>
        </TabList>
        
        <TabPanels mt={4}>
          <TabPanel px={0}>
            <VStack spacing={3} align="stretch">
              {course.modules.map((module, index) => (
                <ModuleItem
                  key={module.id}
                  module={module}
                  isActive={activeModule?.id === module.id}
                  isCompleted={module.completed}
                  onClick={() => handleModuleSelect(module, index)}
                />
              ))}
            </VStack>
          </TabPanel>
          
          <TabPanel px={0}>
            <Box
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: course.description || 'No description available' }}
            />
            
            {course.learning_outcomes?.length > 0 && (
              <Box mt={8}>
                <Heading size="md" mb={4}>What You'll Learn</Heading>
                <VStack align="start" spacing={2}>
                  {course.learning_outcomes.map((outcome, index) => (
                    <HStack key={index}>
                      <CheckCircle size={16} color="#3182ce" />
                      <Text>{outcome}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default CourseTabs;
