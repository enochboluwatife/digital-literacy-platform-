import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ChakraProvider, Box, Spinner } from '@chakra-ui/react';
import { AnimatePresence } from 'framer-motion';
import theme from '../theme';
import Layout from '../components/layout/Layout';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Lazy load page components with error boundaries
const createLazyComponent = (importFn, errorMessage) =>
  lazy(() => importFn().catch(() => ({ default: () => <div>{errorMessage}</div> })));

// Page components
const Dashboard = createLazyComponent(
  () => import('../pages/StudentDashboard'),
  'Error loading Dashboard'
);

const Courses = createLazyComponent(
  () => import('../pages/Courses'),
  'Error loading Courses'
);

const CourseDetail = createLazyComponent(
  () => import('../pages/CourseDetail'),
  'Error loading Course Details'
);

const CourseView = createLazyComponent(
  () => import('../pages/CourseView'),
  'Error loading Course View'
);

const AdminDashboard = createLazyComponent(
  () => import('../pages/AdminDashboard'),
  'Error loading Admin Dashboard'
);

const Login = createLazyComponent(
  () => import('../pages/auth/Login'),
  'Error loading Login'
);

const Register = createLazyComponent(
  () => import('../pages/auth/Register'),
  'Error loading Register'
);

const ForgotPassword = createLazyComponent(
  () => import('../pages/auth/ForgotPassword'),
  'Error loading Forgot Password'
);

const ResetPassword = createLazyComponent(
  () => import('../pages/auth/ResetPassword'),
  'Error loading Reset Password'
);

const NotFound = createLazyComponent(
  () => import('../pages/NotFound'),
  'Page Not Found'
);

// Placeholder components
const Profile = () => <div>Profile Page - Coming Soon</div>;
const Settings = () => <div>Settings Page - Coming Soon</div>;
const Unauthorized = () => <div>Unauthorized - You don't have permission to view this page</div>;

// Loading component for Suspense fallback
const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
    <Spinner size="xl" />
  </Box>
);

const AppRouter = () => {
  return (
    <ChakraProvider theme={theme}>
      <Suspense fallback={<LoadingFallback />}>
        <ScrollToTop />
        <AnimatePresence mode="wait">
          <Routes>
              {/* Public Routes */}
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
              </Route>

              {/* Protected Routes */}
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Nested Courses Routes */}
                <Route path="courses">
                  <Route index element={<Courses />} />
                  <Route path=":id" element={<CourseDetail />} />
                  <Route path=":id/view" element={<CourseView />} />
                </Route>
                
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                
                {/* Admin Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
              </Route>

              {/* Error Pages */}
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
    </ChakraProvider>
  );
};

export default AppRouter;
