import React, { Suspense } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Spinner, Center, Text } from '@chakra-ui/react';

const LoadingFallback = ({ message = 'Loading...' }) => (
  <Center h="100vh" flexDirection="column" gap={4}>
    <Spinner size="xl" thickness="4px" speed="0.65s" />
    <Text mt={4} color="gray.500">{message}</Text>
  </Center>
);

const ErrorFallback = ({ error }) => (
  <Center h="100vh" flexDirection="column" gap={4}>
    <Text color="red.500" fontSize="lg">Something went wrong</Text>
    <Text color="gray.500" fontSize="sm">{error?.message || 'An unexpected error occurred'}</Text>
  </Center>
);

/**
 * ProtectedRoute component that handles:
 * - Authentication state loading
 * - Role-based access control
 * - Error boundaries
 * - Suspense for code-splitting
 */
const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, isAdmin, isTeacher, isStudent, loading, error } = useAuth();
  const location = useLocation();

  // Handle error state
  if (error) {
    return <ErrorFallback error={error} />;
  }

  // Show loading spinner while checking auth state
  if (loading) {
    return <LoadingFallback message="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    const redirectTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectTo}`} state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (roles.length > 0) {
    const hasRequiredRole = roles.some(role => {
      switch (role) {
        case 'admin':
          return isAdmin;
        case 'teacher':
          return isTeacher;
        case 'student':
          return isStudent;
        default:
          return false;
      }
    });

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  }

  // Wrap children in Suspense to handle lazy loading
  return (
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  );
};

export default ProtectedRoute;
