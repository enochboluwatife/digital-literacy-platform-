import React, { Suspense } from 'react';
import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import { lazy } from 'react';
import { Box, Spinner } from '@chakra-ui/react';
import ErrorBoundary from '../components/common/ErrorBoundary';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';

// Loading component
const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
    <Spinner size="xl" />
  </Box>
);

// Simple error fallback for routes
const RouteErrorFallback = ({ error, resetErrorBoundary }) => (
  <Box p={8} textAlign="center">
    <h2>Something went wrong</h2>
    <pre style={{ color: 'red', marginTop: '1rem' }}>{error?.message}</pre>
    <button 
      onClick={resetErrorBoundary}
      style={{ 
        marginTop: '1rem', 
        padding: '0.5rem 1rem', 
        backgroundColor: '#3182ce', 
        color: 'white', 
        border: 'none', 
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Try again
    </button>
  </Box>
);

// Create a route with lazy loading and error boundary
const createRoute = (path, importFn, options = {}) => {
  const { isPublic = false, roles, index = false } = options;
  
  const LazyComponent = lazy(importFn);
  
  const WrappedComponent = (props) => (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
  
  const route = {
    path,
    index,
    element: isPublic ? (
      <PublicRoute>
        <WrappedComponent />
      </PublicRoute>
    ) : (
      <ProtectedRoute roles={roles}>
        <WrappedComponent />
      </ProtectedRoute>
    )
  };
  
  return route;
};

// Create the router configuration
export const createRouter = () => {
  const Layout = lazy(() => import('../components/layout/Layout'));
  const HomePage = lazy(() => import('../pages/HomePage'));
  const Login = lazy(() => import('../pages/auth/Login'));
  const Register = lazy(() => import('../pages/auth/Register'));
  const StudentDashboard = lazy(() => import('../pages/StudentDashboard'));
  const TeacherDashboard = lazy(() => import('../pages/teacher/TeacherDashboard'));
  const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
  const Courses = lazy(() => import('../pages/Courses'));
  const CourseDetail = lazy(() => import('../pages/CourseDetail'));
  const CourseView = lazy(() => import('../pages/CourseView'));
  const NotFound = lazy(() => import('../pages/NotFound'));
  const Unauthorized = lazy(() => import('../pages/Unauthorized'));
  
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route
        path="/"
        element={
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <Layout />
            </Suspense>
          </ErrorBoundary>
        }
        errorElement={<RouteErrorFallback error={new Error('Route error')} resetErrorBoundary={() => window.location.reload()} />}
      >
        {/* Index/Home Route */}
        <Route
          index
          element={
            <Suspense fallback={<LoadingFallback />}>
              <HomePage />
            </Suspense>
          }
        />
        
        {/* Public Routes */}
        <Route
          path="login"
          element={
            <PublicRoute>
              <Suspense fallback={<LoadingFallback />}>
                <Login />
              </Suspense>
            </PublicRoute>
          }
        />
        <Route
          path="register"
          element={
            <PublicRoute>
              <Suspense fallback={<LoadingFallback />}>
                <Register />
              </Suspense>
            </PublicRoute>
          }
        />
        <Route
          path="forgot-password"
          element={
            <PublicRoute>
              <Suspense fallback={<LoadingFallback />}>
                {React.createElement(lazy(() => import('../pages/auth/ForgotPassword')))}
              </Suspense>
            </PublicRoute>
          }
        />
        <Route
          path="reset-password/:token"
          element={
            <PublicRoute>
              <Suspense fallback={<LoadingFallback />}>
                {React.createElement(lazy(() => import('../pages/auth/ResetPassword')))}
              </Suspense>
            </PublicRoute>
          }
        />
        
        {/* Protected Routes */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute roles={['student']}>
              <Suspense fallback={<LoadingFallback />}>
                <StudentDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        
        {/* Teacher Routes */}
        <Route
          path="teacher/dashboard"
          element={
            <ProtectedRoute roles={['teacher']}>
              <Suspense fallback={<LoadingFallback />}>
                <TeacherDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="teacher/courses"
          element={
            <ProtectedRoute roles={['teacher']}>
              <Suspense fallback={<LoadingFallback />}>
                {React.createElement(lazy(() => import('../pages/teacher/CourseForm')))}
              </Suspense>
            </ProtectedRoute>
          }
        />
        
        {/* Course Routes */}
        <Route
          path="courses"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                {React.createElement(lazy(() => import('../pages/Courses')))}
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="courses/:id"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                {React.createElement(lazy(() => import('../pages/CourseDetail')))}
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="courses/:id/view"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                {React.createElement(lazy(() => import('../pages/CourseView')))}
              </Suspense>
            </ProtectedRoute>
          }
        />
        
        {/* Unauthorized Route */}
        <Route
          path="unauthorized"
          element={
            <Suspense fallback={<LoadingFallback />}>
              {React.createElement(lazy(() => import('../pages/Unauthorized')))}
            </Suspense>
          }
        />
        
        {/* Admin Routes */}
        <Route
          path="admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <Suspense fallback={<LoadingFallback />}>
                <div>Admin Dashboard</div>
              </Suspense>
            </ProtectedRoute>
          }
        >
          <Route
            path="users"
            element={
              <Suspense fallback={<LoadingFallback />}>
                {React.createElement(lazy(() => import('../pages/admin/Users')))}
              </Suspense>
            }
          />
          <Route
            path="courses"
            element={
              <Suspense fallback={<LoadingFallback />}>
                {React.createElement(lazy(() => import('../pages/admin/Courses')))}
              </Suspense>
            }
          />
          <Route
            path="analytics"
            element={
              <Suspense fallback={<LoadingFallback />}>
                {React.createElement(lazy(() => import('../pages/admin/Analytics')))}
              </Suspense>
            }
          />
        </Route>
        
        {/* Error Routes */}
        <Route
          path="unauthorized"
          element={
            <ErrorBoundary>
              <div>Unauthorized</div>
            </ErrorBoundary>
          }
        />
        <Route
          path="404"
          element={
            <ErrorBoundary>
              <div>Not Found</div>
            </ErrorBoundary>
          }
        />
        <Route
          path="*"
          element={
            <ErrorBoundary>
              <div>Not Found</div>
            </ErrorBoundary>
          }
        />
      </Route>
    ),
    {
      future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
        v7_fetcherPersist: true,
        v7_normalizeFormMethod: true,
        v7_partialHydration: true,
        v7_skipActionErrorRevalidation: true
      },
      basename: '/'
    }
  );
  
  return router;
};
