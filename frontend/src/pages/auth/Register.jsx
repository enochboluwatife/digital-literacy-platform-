import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
  Select,
  FormHelperText,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    institution: '',
  });
  const [errors, setErrors] = useState({});
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.institution) {
      newErrors.institution = 'Institution is required';
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
      // Prepare user data for registration
      const userData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email,
        password: formData.password,
        role: formData.role,
        institution: formData.institution,
      };
      
      const result = await register(userData);
      
      if (result.success) {
        toast({
          title: 'Registration successful',
          description: 'Your account has been created successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Redirect to dashboard after successful registration and login
        navigate('/dashboard');
      } else {
        toast({
          title: 'Registration failed',
          description: result.error || 'Failed to create account. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'An error occurred',
        description: 'Failed to create account. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
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
        maxW="2xl"
        p={8}
        borderRadius="lg"
        boxShadow="lg"
        bg={cardBg}
      >
        <Stack spacing={6}>
          <Stack align="center">
            <Heading fontSize="2xl">Create an account</Heading>
            <Text color="gray.600" textAlign="center">
              Join our digital literacy platform today
            </Text>
          </Stack>
          
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <Stack direction={['column', 'row']} spacing={4}>
                <FormControl id="first_name" isInvalid={!!errors.first_name} isRequired>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                  />
                  <FormErrorMessage>{errors.first_name}</FormErrorMessage>
                </FormControl>
                
                <FormControl id="last_name" isInvalid={!!errors.last_name} isRequired>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                  />
                  <FormErrorMessage>{errors.last_name}</FormErrorMessage>
                </FormControl>
              </Stack>
              
              <FormControl id="email" isInvalid={!!errors.email} isRequired>
                <FormLabel>Email address</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>
              
              <FormControl id="institution" isInvalid={!!errors.institution} isRequired>
                <FormLabel>Institution</FormLabel>
                <Select
                  name="institution"
                  value={formData.institution}
                  onChange={handleInputChange}
                  placeholder="Select your institution"
                >
                  <option value="unilag">University of Lagos</option>
                  <option value="unilag">University of Ibadan</option>
                  <option value="unilag">University of Nigeria, Nsukka</option>
                  <option value="unilag">Obafemi Awolowo University</option>
                  <option value="unilag">Covenant University</option>
                  <option value="other">Other</option>
                </Select>
                <FormHelperText>Select your institution or choose 'Other' if not listed</FormHelperText>
                <FormErrorMessage>{errors.institution}</FormErrorMessage>
              </FormControl>
              
              <FormControl id="role" isRequired>
                <FormLabel>I am a</FormLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </Select>
              </FormControl>
              
              <Stack direction={['column', 'row']} spacing={4}>
                <FormControl id="password" isInvalid={!!errors.password} isRequired>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a password"
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
                  <FormHelperText>At least 8 characters</FormHelperText>
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>
                
                <FormControl id="confirmPassword" isInvalid={!!errors.confirmPassword} isRequired>
                  <FormLabel>Confirm Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
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
              </Stack>
              
              <Stack spacing={6} pt={4}>
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  fontSize="md"
                  isLoading={isLoading}
                  loadingText="Creating account..."
                >
                  Create Account
                </Button>
                
                <Text textAlign="center">
                  Already have an account?{' '}
                  <Link as={RouterLink} to="/login" color="blue.500">
                    Sign in
                  </Link>
                </Text>
              </Stack>
            </Stack>
          </form>
        </Stack>
      </Box>
    </Box>
  );
};

export default Register;
