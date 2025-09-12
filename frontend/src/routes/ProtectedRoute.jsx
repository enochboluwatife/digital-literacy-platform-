import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Spinner, Center } from '@chakra-ui/react';

/**
 * ProtectedRoute component that redirects to login if user is not authenticated
 * and shows a loading spinner while authentication state is being determined
 */
const ProtectedRoute = ({ children, roles = [], ...rest }) => {
  const { isAuthenticated, isAdmin, isTeacher, isStudent, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
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

  return children;
};

export default ProtectedRoute;
