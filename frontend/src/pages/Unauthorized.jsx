import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { isAdmin, isTeacher, isStudent } = useAuth();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const getDashboardPath = () => {
    if (isAdmin) return '/admin';
    if (isTeacher) return '/teacher/dashboard';
    return '/dashboard';
  };

  return (
    <Box bg={bgColor} minH="100vh" py={16}>
      <Container maxW="md">
        <VStack spacing={8} textAlign="center">
          <Box
            bg={cardBg}
            p={8}
            borderRadius="lg"
            boxShadow="lg"
            w="100%"
          >
            <VStack spacing={6}>
              <Icon as={Shield} w={16} h={16} color="red.500" />
              
              <VStack spacing={2}>
                <Heading size="lg" color="red.500">
                  Access Denied
                </Heading>
                <Text color="gray.600" fontSize="lg">
                  You don't have permission to access this page
                </Text>
              </VStack>
              
              <Text color="gray.500" textAlign="center">
                This page requires specific permissions that your account doesn't have. 
                Please contact your administrator if you believe this is an error.
              </Text>
              
              <VStack spacing={3} w="100%">
                <Button
                  as={RouterLink}
                  to={getDashboardPath()}
                  colorScheme="blue"
                  size="lg"
                  w="100%"
                >
                  Go to Dashboard
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  w="100%"
                >
                  Go Back
                </Button>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default Unauthorized;
