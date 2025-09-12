import React from 'react';
import { Box, Center, VStack, Text, Icon } from '@chakra-ui/react';
import { BookOpen, Shield, Monitor, Mail, Users } from 'lucide-react';

const CourseImagePlaceholder = ({ courseTitle, width = "100%", height = "180px" }) => {
  // Map course titles to specific gradients and icons
  const courseStyles = {
    "Digital Literacy Fundamentals": {
      gradient: "linear(to-br, blue.400, purple.600)",
      icon: BookOpen,
      color: "white"
    },
    "Internet Safety and Security": {
      gradient: "linear(to-br, red.400, orange.500)",
      icon: Shield,
      color: "white"
    },
    "Basic Computer Skills": {
      gradient: "linear(to-br, green.400, teal.500)",
      icon: Monitor,
      color: "white"
    },
    "Email and Communication": {
      gradient: "linear(to-br, cyan.400, blue.500)",
      icon: Mail,
      color: "white"
    },
    "Social Media Literacy": {
      gradient: "linear(to-br, pink.400, purple.500)",
      icon: Users,
      color: "white"
    }
  };

  // Default style for unknown courses
  const defaultStyle = {
    gradient: "linear(to-br, gray.400, gray.600)",
    icon: BookOpen,
    color: "white"
  };

  const style = courseStyles[courseTitle] || defaultStyle;

  return (
    <Box
      width={width}
      height={height}
      bgGradient={style.gradient}
      borderRadius="lg"
      position="relative"
      overflow="hidden"
    >
      {/* Decorative pattern overlay */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.1}
        bgImage="radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)"
        bgSize="30px 30px"
      />
      
      <Center height="100%" position="relative" zIndex={1}>
        <VStack spacing={3}>
          <Icon as={style.icon} boxSize={8} color={style.color} />
          <Text
            fontSize="sm"
            fontWeight="semibold"
            color={style.color}
            textAlign="center"
            px={4}
            noOfLines={2}
          >
            {courseTitle}
          </Text>
        </VStack>
      </Center>
    </Box>
  );
};

export default CourseImagePlaceholder;
