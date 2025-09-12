import React, { useState } from "react";
import {
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  Button,
  Checkbox,
  Link as ChakraLink,
  useToast,
  Icon,
  Box,
  Text,
  Stack,
  Tooltip,
  RadioGroup,
  Radio,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { User, GraduationCap } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";

const RegistrationForm = ({ onSubmit, isLoading, profilePicture }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    institution: "",
    agreeToTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.role === "teacher" && !formData.institution.trim()) {
      newErrors.institution = "Institution is required for teachers";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        profilePicture,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <HStack w="full" spacing={4}>
          <FormControl id="firstName" isRequired isInvalid={!!errors.firstName}>
            <FormLabel>First Name</FormLabel>
            <Input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
            />
            <FormErrorMessage>{errors.firstName}</FormErrorMessage>
          </FormControl>

          <FormControl id="lastName" isRequired isInvalid={!!errors.lastName}>
            <FormLabel>Last Name</FormLabel>
            <Input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
            />
            <FormErrorMessage>{errors.lastName}</FormErrorMessage>
          </FormControl>
        </HStack>

        <FormControl id="email" isRequired isInvalid={!!errors.email}>
          <FormLabel>Email address</FormLabel>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
          />
          <FormErrorMessage>{errors.email}</FormErrorMessage>
        </FormControl>

        <FormControl id="password" isRequired isInvalid={!!errors.password}>
          <FormLabel>Password</FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
            <InputRightElement>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <ViewOffIcon /> : <ViewIcon />}
              </Button>
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage>{errors.password}</FormErrorMessage>
        </FormControl>

        <FormControl
          id="confirmPassword"
          isRequired
          isInvalid={!!errors.confirmPassword}
        >
          <FormLabel>Confirm Password</FormLabel>
          <InputGroup>
            <Input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
            />
            <InputRightElement>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
              </Button>
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
        </FormControl>

        <FormControl id="role" isRequired isInvalid={!!errors.role}>
          <FormLabel>I am a</FormLabel>
          <RadioGroup
            name="role"
            value={formData.role}
            onChange={(value) => setFormData({ ...formData, role: value })}
            mb={4}
          >
            <Stack direction="row" spacing={6} justify="center">
              <Tooltip
                label="Access course materials, track progress, and complete assignments"
                placement="top"
              >
                <Box
                  as="label"
                  p={4}
                  borderWidth="1px"
                  borderRadius="lg"
                  cursor="pointer"
                  bg={formData.role === "student" ? "blue.50" : "white"}
                  borderColor={
                    formData.role === "student" ? "blue.200" : "gray.200"
                  }
                  _hover={{ borderColor: "blue.300" }}
                  transition="all 0.2s"
                >
                  <VStack spacing={2}>
                    <Icon
                      as={User}
                      boxSize={6}
                      color={
                        formData.role === "student" ? "blue.500" : "gray.500"
                      }
                    />
                    <Text>Student</Text>
                    <Radio value="student" colorScheme="blue" display="none" />
                  </VStack>
                </Box>
              </Tooltip>

              <Tooltip
                label="Create and manage courses, track student progress"
                placement="top"
              >
                <Box
                  as="label"
                  p={4}
                  borderWidth="1px"
                  borderRadius="lg"
                  cursor="pointer"
                  bg={formData.role === "teacher" ? "blue.50" : "white"}
                  borderColor={
                    formData.role === "teacher" ? "blue.200" : "gray.200"
                  }
                  _hover={{ borderColor: "blue.300" }}
                  transition="all 0.2s"
                >
                  <VStack spacing={2}>
                    <Icon
                      as={GraduationCap}
                      boxSize={6}
                      color={
                        formData.role === "teacher" ? "blue.500" : "gray.500"
                      }
                    />
                    <Text>Teacher</Text>
                    <Radio value="teacher" colorScheme="blue" display="none" />
                  </VStack>
                </Box>
              </Tooltip>
            </Stack>
          </RadioGroup>
          <FormErrorMessage>{errors.role}</FormErrorMessage>
        </FormControl>

        {formData.role === "teacher" && (
          <FormControl
            id="institution"
            isRequired
            isInvalid={!!errors.institution}
          >
            <FormLabel>Institution</FormLabel>
            <Input
              type="text"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              placeholder="Your school or organization"
            />
            <FormErrorMessage>{errors.institution}</FormErrorMessage>
          </FormControl>
        )}

        <FormControl isRequired isInvalid={!!errors.agreeToTerms}>
          <Checkbox
            name="agreeToTerms"
            isChecked={formData.agreeToTerms}
            onChange={handleChange}
          >
            I agree to the{" "}
            <ChakraLink as={RouterLink} to="/terms" color="blue.500">
              Terms of Service
            </ChakraLink>{" "}
            and{" "}
            <ChakraLink as={RouterLink} to="/privacy" color="blue.500">
              Privacy Policy
            </ChakraLink>
          </Checkbox>
          <FormErrorMessage>{errors.agreeToTerms}</FormErrorMessage>
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          width="full"
          isLoading={isLoading}
          loadingText="Creating account..."
          leftIcon={
            formData.role === "teacher" ? (
              <GraduationCap size={20} />
            ) : (
              <User size={20} />
            )
          }
          mt={4}
        >
          Create {formData.role === "teacher" ? "Teacher" : "Student"} Account
        </Button>
      </VStack>
    </form>
  );
};

export default RegistrationForm;
