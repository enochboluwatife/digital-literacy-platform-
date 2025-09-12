import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, GraduationCap, User } from 'lucide-react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  HStack,
  Heading,
  Text,
  useToast,
  Checkbox,
  Link,
  RadioGroup,
  Radio,
  Stack,
  Divider,
  Icon,
  Tooltip
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
    role: 'student', // Default role
  });
  const toast = useToast();
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Add role to login data
      const loginData = {
        email: formData.email,
        password: formData.password,
        role: formData.role
      };

      const { success, message, user } = await login(
        formData.email, 
        formData.password,
        from  // Pass the redirect path to the login function
      );
      
      if (!success) {
        throw new Error(message || 'Login failed. Please check your credentials.');
      }
      
      // Show success message with user role
      const roleDisplay = formData.role === 'teacher' ? 'Teacher' : 'Student';
      
      toast({
        title: `Welcome back, ${user?.first_name || roleDisplay}!`,
        description: `You have successfully logged in as a ${roleDisplay}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      
      // Navigation is handled by the AuthContext
    } catch (error) {
      console.error('Login error:', error);
      // Handle different types of error messages
      let errorMessage = 'Failed to log in. Please try again.';
      
      if (error.message) {
        // If the error message is a string, use it directly
        if (typeof error.message === 'string') {
          errorMessage = error.message;
        } 
        // If it's an array of error messages, join them
        else if (Array.isArray(error.message)) {
          const errorMessages = error.message.map(err => err.msg || JSON.stringify(err));
          errorMessage = errorMessages.join('\n');
        }
      }
      
      toast({
        title: 'Login Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  return (
    <Container maxW="md" py={20}>
      <VStack spacing={8}>
        {/* Logo and Title */}
        <VStack spacing={4} textAlign="center">
          <Box p={3} bg="blue.50" borderRadius="full" display="inline-flex">
            <BookOpen size={24} color="#4F46E5" />
          </Box>
          <Heading as="h1" size="xl" fontWeight="bold" color="gray.800">
            Welcome back
          </Heading>
          <Text color="gray.600">Sign in to continue to your account</Text>
        </VStack>

        {/* Login Form */}
        <Box w="full" bg="white" p={8} borderRadius="lg" boxShadow="sm">
          <form onSubmit={handleSubmit}>
            <VStack spacing={6}>
              {/* Role Selection */}
              <FormControl id="role" isRequired>
                <FormLabel>I am a</FormLabel>
                <RadioGroup 
                  name="role" 
                  value={formData.role} 
                  onChange={(value) => setFormData({...formData, role: value})}
                  mb={4}
                >
                  <Stack direction="row" spacing={6} justify="center">
                    <Tooltip label="Access course materials, track progress, and complete assignments" placement="top">
                      <Box 
                        as="label" 
                        p={4} 
                        borderWidth="1px" 
                        borderRadius="lg" 
                        cursor="pointer"
                        bg={formData.role === 'student' ? 'blue.50' : 'white'}
                        borderColor={formData.role === 'student' ? 'blue.200' : 'gray.200'}
                        _hover={{ borderColor: 'blue.300' }}
                        transition="all 0.2s"
                      >
                        <VStack spacing={2}>
                          <Icon as={User} boxSize={6} color={formData.role === 'student' ? 'blue.500' : 'gray.500'} />
                          <Text>Student</Text>
                          <Radio value="student" colorScheme="blue" display="none" />
                        </VStack>
                      </Box>
                    </Tooltip>
                    
                    <Tooltip label="Create and manage courses, track student progress" placement="top">
                      <Box 
                        as="label" 
                        p={4} 
                        borderWidth="1px" 
                        borderRadius="lg" 
                        cursor="pointer"
                        bg={formData.role === 'teacher' ? 'blue.50' : 'white'}
                        borderColor={formData.role === 'teacher' ? 'blue.200' : 'gray.200'}
                        _hover={{ borderColor: 'blue.300' }}
                        transition="all 0.2s"
                      >
                        <VStack spacing={2}>
                          <Icon as={GraduationCap} boxSize={6} color={formData.role === 'teacher' ? 'blue.500' : 'gray.500'} />
                          <Text>Teacher</Text>
                          <Radio value="teacher" colorScheme="blue" display="none" />
                        </VStack>
                      </Box>
                    </Tooltip>
                  </Stack>
                </RadioGroup>
              </FormControl>

              {/* Email Field */}
              <FormControl id="email" isRequired>
                <FormLabel>Email address</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={formData.role === 'teacher' ? 'teacher@example.com' : 'student@example.com'}
                  size="lg"
                  autoComplete="username"
                />
              </FormControl>

              {/* Password Field */}
              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    pr="4.5rem"
                  />
                  <InputRightElement width="4.5rem" mr={1}>
                    <Button
                      h="1.75rem"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                    >
                      {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              {/* Remember Me & Forgot Password */}
              <Box w="full" display="flex" justifyContent="space-between" alignItems="center">
                <Checkbox
                  name="rememberMe"
                  isChecked={formData.rememberMe}
                  onChange={handleChange}
                  colorScheme="blue"
                >
                  Remember me
                </Checkbox>
                <Link as={RouterLink} to="/forgot-password" color="blue.500" fontSize="sm">
                  Forgot password?
                </Link>
              </Box>

              {/* Submit Button */}
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                width="full"
                isLoading={isLoading}
                loadingText="Signing in..."
                mt={4}
                leftIcon={formData.role === 'teacher' ? <GraduationCap size={20} /> : <User size={20} />}
              >
                Sign in as {formData.role === 'teacher' ? 'Teacher' : 'Student'}
              </Button>

              <Divider my={4} />
              
              {/* Sign Up Link */}
              <Text textAlign="center" mt={2}>
                {formData.role === 'teacher' 
                  ? "Don't have a teacher account? "
                  : "Don't have a student account? "}
                <Link 
                  as={RouterLink} 
                  to={
                    formData.role === 'teacher' 
                      ? "/register?role=teacher" 
                      : "/register?role=student"
                  } 
                  color="blue.500" 
                  fontWeight="medium"
                >
                  Sign up as {formData.role === 'teacher' ? 'Teacher' : 'Student'}
                </Link>
              </Text>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Container>
  );
};

export default Login;
