import React, { Suspense } from 'react';
import { ChakraProvider, Box, Spinner } from '@chakra-ui/react';
import { AuthProvider } from './context/AuthContext';
import { RouterProvider } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import theme from './theme';
import { createRouter } from './routes/routes';

// Global styles and fonts are imported in index.html

// Error boundary fallback component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <Box p={4}>
    <h2>Something went wrong</h2>
    <pre>{error.message}</pre>
    <button onClick={resetErrorBoundary}>Try again</button>
  </Box>
);

// Loading component
const LoadingSpinner = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
    <Spinner size="xl" />
  </Box>
);

function App() {
  const router = createRouter();

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <RouterProvider router={router} />
          </Suspense>
        </AuthProvider>
      </ChakraProvider>
    </ErrorBoundary>
  );
}

export default App;
