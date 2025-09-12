import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  useColorModeValue,
  Button,
  AspectRatio,
  Divider,
  Progress
} from '@chakra-ui/react';
import { Play, CheckCircle, Lock, ArrowRight } from 'lucide-react';

const CourseModule = ({ 
  module, 
  index, 
  isActive, 
  isLast, 
  onClick, 
  progress = 0 
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeBorderColor = useColorModeValue('blue.200', 'blue.700');

  return (
    <Box
      p={4}
      bg={isActive ? activeBg : bgColor}
      borderWidth="1px"
      borderColor={isActive ? activeBorderColor : borderColor}
      borderRadius="md"
      _hover={!module.locked ? { bg: isActive ? activeBg : hoverBg, cursor: 'pointer' } : {}}
      onClick={() => !module.locked && onClick(module, index)}
      opacity={module.locked ? 0.7 : 1}
      transition="all 0.2s"
      position="relative"
      overflow="hidden"
    >
      {module.locked && (
        <Box
          position="absolute"
          top={0}
          right={0}
          bg="gray.600"
          color="white"
          px={2}
          py={0.5}
          fontSize="xs"
          borderBottomLeftRadius="md"
        >
          Locked
        </Box>
      )}
      
      <HStack spacing={4} align="flex-start">
        <Box
          w={10}
          h={10}
          borderRadius="full"
          bg={module.completed ? 'green.100' : 'blue.50'}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          color={module.completed ? 'green.600' : 'blue.500'}
        >
          {module.completed ? (
            <CheckCircle size={20} />
          ) : (
            <Text fontWeight="bold">{index + 1}</Text>
          )}
        </Box>

        <Box flex={1}>
          <HStack justify="space-between" mb={1}>
            <Text fontWeight="medium" color={module.locked ? 'gray.500' : 'inherit'}>
              {module.title}
            </Text>
            {module.type === 'quiz' && (
              <Badge colorScheme="purple" fontSize="xs">
                Quiz
              </Badge>
            )}
          </HStack>
          
          <Text fontSize="sm" color="gray.500" mb={2} noOfLines={2}>
            {module.description}
          </Text>
          
          <HStack spacing={4} fontSize="sm" color="gray.500">
            <HStack spacing={1}>
              <Icon as={Play} size={14} />
              <Text>{module.duration} min</Text>
            </HStack>
            
            {module.completed ? (
              <HStack spacing={1} color="green.500">
                <Icon as={CheckCircle} size={14} />
                <Text>Completed</Text>
              </HStack>
            ) : progress > 0 && progress < 100 ? (
              <HStack spacing={2} w="100px">
                <Progress 
                  value={progress} 
                  size="xs" 
                  colorScheme="blue" 
                  borderRadius="full" 
                  flex={1}
                />
                <Text fontSize="xs">{Math.round(progress)}%</Text>
              </HStack>
            ) : null}
          </HStack>
        </Box>
        
        {!module.locked && (
          <Box color="gray.400" alignSelf="center">
            <ArrowRight size={18} />
          </Box>
        )}
      </HStack>
      
      {!isLast && (
        <Divider mt={4} borderStyle="dashed" />
      )}
    </Box>
  );
};

export default CourseModule;
