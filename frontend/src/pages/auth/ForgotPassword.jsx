import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  Link,
  useToast,
  Heading,
  useColorModeValue,
  FormErrorMessage,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { authApi } from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const toast = useToast();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  
  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const response = await authApi.forgotPassword({ email });
      
      if (response.data?.success) {
        setIsSubmitted(true);
        toast({
          title: 'Email sent',
          description: 'Check your email for instructions to reset your password.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error(response.data?.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.response?.data?.detail || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isSubmitted) {
    return (
      <Box
        minH="100vh"
        bg={bgColor}
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        <Box
          w="100%"
          maxW="md"
          p={8}
          borderRadius="lg"
          boxShadow="lg"
          bg={cardBg}
        >
          <Stack spacing={6} textAlign="center">
            <Box>
              <Heading size="lg" mb={2}>Check your email</Heading>
              <Text color="gray.600">
                We've sent a password reset link to <strong>{email}</strong>
              </Text>
            </Box>
            
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Didn't receive the email?</AlertTitle>
                <AlertDescription>
                  Check your spam folder or <Link color="blue.500" onClick={() => setIsSubmitted(false)}>try again</Link> with a different email address.
                </AlertDescription>
              </Box>
            </Alert>
            
            <Button
              as={RouterLink}
              to="/login"
              colorScheme="blue"
              variant="outline"
              mt={4}
            >
              Back to login
            </Button>
          </Stack>
        </Box>
      </Box>
    );
  }
  
  return (
    <Box
      minH="100vh"
      bg={bgColor}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        w="100%"
        maxW="md"
        p={8}
        borderRadius="lg"
        boxShadow="lg"
        bg={cardBg}
      >
        <Stack spacing={6}>
          <Stack align="center">
            <Heading fontSize="2xl">Forgot your password?</Heading>
            <Text color="gray.600" textAlign="center">
              Enter your email address and we'll send you a link to reset your password.
            </Text>
          </Stack>
          
          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="email" isInvalid={!!error} isRequired>
                <FormLabel>Email address</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your email"
                  autoFocus
                />
              </FormControl>
              
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                fontSize="md"
                isLoading={isLoading}
                loadingText="Sending reset link..."
                mt={4}
              >
                Send reset link
              </Button>
              
              <Text textAlign="center" mt={4}>
                Remember your password?{' '}
                <Link as={RouterLink} to="/login" color="blue.500">
                  Back to login
                </Link>
              </Text>
            </Stack>
          </form>
        </Stack>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
