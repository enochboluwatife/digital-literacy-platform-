import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
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
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { authApi } from '../../services/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  
  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidToken(false);
        return;
      }
      
      try {
        // Check if the reset token is valid
        const response = await authApi.verifyResetToken(token);
        setIsValidToken(response.data?.valid || false);
      } catch (error) {
        console.error('Token validation error:', error);
        setIsValidToken(false);
        setError('The password reset link is invalid or has expired.');
      }
    };
    
    validateToken();
  }, [token]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await authApi.resetPassword({
        token,
        new_password: formData.password,
      });
      
      if (response.data?.success) {
        setIsSubmitted(true);
        toast({
          title: 'Password updated',
          description: 'Your password has been reset successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error(response.data?.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.response?.data?.detail || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isValidToken === null) {
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
          textAlign="center"
        >
          <Text>Verifying reset link...</Text>
        </Box>
      </Box>
    );
  }
  
  if (!isValidToken) {
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
          <Stack spacing={4} textAlign="center">
            <Heading size="lg">Invalid or Expired Link</Heading>
            
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>This password reset link is invalid or has expired</AlertTitle>
                <AlertDescription>
                  Please request a new password reset link to continue.
                </AlertDescription>
              </Box>
            </Alert>
            
            <Button
              as={RouterLink}
              to="/forgot-password"
              colorScheme="blue"
              mt={4}
            >
              Request New Reset Link
            </Button>
            
            <Text>
              <Link as={RouterLink} to="/login" color="blue.500">
                Back to login
              </Link>
            </Text>
          </Stack>
        </Box>
      </Box>
    );
  }
  
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
          textAlign="center"
        >
          <Stack spacing={6}>
            <Box>
              <Heading size="lg" mb={2}>Password Updated</Heading>
              <Text color="gray.600">
                Your password has been reset successfully. You can now log in with your new password.
              </Text>
            </Box>
            
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              Password has been updated successfully!
            </Alert>
            
            <Button
              as={RouterLink}
              to="/login"
              colorScheme="blue"
              mt={4}
            >
              Go to Login
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
            <Heading fontSize="2xl">Reset Your Password</Heading>
            <Text color="gray.600" textAlign="center">
              Enter your new password below
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
              <FormControl id="password" isInvalid={!!errors.password} isRequired>
                <FormLabel>New Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your new password"
                  />
                  <InputRightElement h="full">
                    <Button
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                      _focus={{ boxShadow: 'none' }}
                    >
                      {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>
              
              <FormControl id="confirmPassword" isInvalid={!!errors.confirmPassword} isRequired>
                <FormLabel>Confirm New Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your new password"
                  />
                  <InputRightElement h="full">
                    <Button
                      variant="ghost"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      _focus={{ boxShadow: 'none' }}
                    >
                      {showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
              </FormControl>
              
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                fontSize="md"
                isLoading={isLoading}
                loadingText="Updating password..."
                mt={4}
              >
                Reset Password
              </Button>
            </Stack>
          </form>
        </Stack>
      </Box>
    </Box>
  );
};

export default ResetPassword;
