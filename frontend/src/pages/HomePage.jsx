import React from 'react';
import { 
  Box, Container, Heading, Text, Button, HStack, SimpleGrid, 
  Icon, Flex, useColorModeValue, Stack
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { BookOpen, Users, Award, ArrowRight, TrendingUp } from 'lucide-react';

const FeatureCard = ({ icon, title, children }) => (
  <Box p={6} bg="white" borderRadius="lg" boxShadow="sm" textAlign="center">
    <Icon as={icon} w={8} h={8} color="blue.500" mb={4} />
    <Heading size="md" mb={3}>{title}</Heading>
    <Text color="gray.600">{children}</Text>
  </Box>
);

const HomePage = () => {
  return (
    <Box>
      {/* Header */}
      <Box py={4} bg="white" borderBottomWidth="1px">
        <Container maxW="6xl">
          <Flex justify="space-between" align="center">
            <HStack>
              <Icon as={BookOpen} w={8} h={8} color="blue.500" />
              <Heading size="lg">DigiLearn</Heading>
            </HStack>
            <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
              <Text as={RouterLink} to="/courses">Courses</Text>
              <Text as={RouterLink} to="/about">About</Text>
              <Text as={RouterLink} to="/contact">Contact</Text>
            </HStack>
            <Button as={RouterLink} to="/register" colorScheme="blue">
              Get Started
            </Button>
          </Flex>
        </Container>
      </Box>

      {/* Hero */}
      <Box py={20} bgGradient="linear(to-r, blue.600, blue.400)" color="white">
        <Container maxW="6xl" textAlign="center">
          <Heading size="3xl" mb={6}>
            Master Digital Skills for the Modern World
          </Heading>
          <Text fontSize="xl" mb={8} maxW="2xl" mx="auto">
            Unlock your potential with comprehensive digital literacy courses designed for all skill levels.
          </Text>
          <Stack direction={{ base: 'column', sm: 'row' }} justify="center" spacing={4}>
            <Button 
              as={RouterLink} to="/courses" size="lg" 
              colorScheme="whiteAlpha" rightIcon={<ArrowRight />}
            >
              Explore Courses
            </Button>
            <Button as={RouterLink} to="/about" size="lg" variant="outline" colorScheme="whiteAlpha">
              Learn More
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Features */}
      <Box py={20} bg="gray.50">
        <Container maxW="6xl">
          <Heading size="2xl" textAlign="center" mb={4}>
            Why Choose DigiLearn?
          </Heading>
          <Text fontSize="lg" color="gray.600" textAlign="center" mb={16}>
            Learn digital skills the right way with our comprehensive platform.
          </Text>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
            <FeatureCard icon={BookOpen} title="Interactive Courses">
              Engaging video content and hands-on exercises for all levels.
            </FeatureCard>
            <FeatureCard icon={TrendingUp} title="Track Progress">
              Monitor your journey with detailed progress tracking.
            </FeatureCard>
            <FeatureCard icon={Users} title="Community">
              Connect and learn with fellow students.
            </FeatureCard>
            <FeatureCard icon={Award} title="Certificates">
              Earn recognized certificates upon completion.
            </FeatureCard>
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA */}
      <Box py={20} bgGradient="linear(to-r, blue.600, blue.400)" color="white">
        <Container maxW="4xl" textAlign="center">
          <Heading size="2xl" mb={6}>Ready to Start Learning?</Heading>
          <Text fontSize="xl" mb={8}>
            Join thousands who have transformed their careers with digital literacy.
          </Text>
          <Button as={RouterLink} to="/register" size="lg" colorScheme="whiteAlpha">
            Create Your Account
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg="gray.900" color="white" py={12}>
        <Container maxW="6xl">
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8}>
            <Box>
              <HStack mb={4}>
                <Icon as={BookOpen} w={6} h={6} color="blue.400" />
                <Heading size="md">DigiLearn</Heading>
              </HStack>
              <Text color="gray.400" fontSize="sm">
                Empowering individuals with digital skills.
              </Text>
            </Box>
            <Box>
              <Heading size="sm" mb={4}>Quick Links</Heading>
              <Stack spacing={2}>
                <Text as={RouterLink} to="/" color="gray.400" fontSize="sm">Home</Text>
                <Text as={RouterLink} to="/courses" color="gray.400" fontSize="sm">Courses</Text>
                <Text as={RouterLink} to="/about" color="gray.400" fontSize="sm">About</Text>
              </Stack>
            </Box>
            <Box>
              <Heading size="sm" mb={4}>Support</Heading>
              <Stack spacing={2}>
                <Text color="gray.400" fontSize="sm">Help Center</Text>
                <Text color="gray.400" fontSize="sm">FAQ</Text>
              </Stack>
            </Box>
            <Box>
              <Heading size="sm" mb={4}>Contact</Heading>
              <Text color="gray.400" fontSize="sm">support@digilearn.ng</Text>
            </Box>
          </SimpleGrid>
          <Box pt={8} borderTopWidth="1px" borderColor="gray.700">
            <Text color="gray.400" fontSize="sm" textAlign="center">
              © 2024 DigiLearn. All rights reserved.
            </Text>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;