// Register.jsx
import React, { useState } from "react";
import {
  Box, Button, Container, VStack, Text, Heading, useToast
} from "@chakra-ui/react";
import { BookOpen, GraduationCap, User } from "lucide-react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfilePictureUploader from "../components/register/ProfilePictureUploader";
import RegistrationForm from "../components/register/RegistrationForm";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const { success, error } = await register(
        { ...formData },
        from
      );
      if (!success) throw new Error(error || "Registration failed");

      toast({
        title: "Registration successful!",
        description: "Your account has been created successfully.",
        status: "success",
      });
    } catch (err) {
      toast({
        title: "Registration failed",
        description: err.message,
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="md" py={12}>
      <VStack spacing={8}>
        <VStack textAlign="center">
          <Box p={3} bg="blue.50" borderRadius="full">
            <BookOpen size={24} color="#4F46E5" />
          </Box>
          <Heading>Create an account</Heading>
          <Text color="gray.600">
            Join thousands of students advancing their digital skills
          </Text>
        </VStack>

        <ProfilePictureUploader onImageSelect={setProfilePicture} />

        <Box w="full" bg="white" p={8} borderRadius="lg" boxShadow="sm">
          <RegistrationForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            profilePicture={profilePicture}
          />
          <Text mt={6} textAlign="center">
            Already have an account?{" "}
            <RouterLink to="/login" style={{ color: "blue" }}>
              Log in
            </RouterLink>
          </Text>
        </Box>
      </VStack>
    </Container>
  );
};

export default Register;
