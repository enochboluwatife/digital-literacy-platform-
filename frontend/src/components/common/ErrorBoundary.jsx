import React, { Component } from 'react';
import { Box, Button, Heading, Text, Container, useColorModeValue, Stack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    // You can also log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error} 
          errorInfo={this.state.errorInfo} 
          onRetry={() => this.setState({ hasError: false, error: null, errorInfo: null })}
        />
      );
    }

    return this.props.children; 
  }
}

const ErrorFallback = ({ error, errorInfo, onRetry }) => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Container maxW="container.md" py={10}>
      <Box 
        p={6} 
        borderWidth="1px" 
        borderRadius="lg" 
        borderColor="red.500" 
        bg={bg}
        boxShadow="sm"
      >
        <Heading as="h1" size="xl" mb={4} color="red.500">
          Something went wrong
        </Heading>
        
        <Text mb={4}>
          We're sorry, but an unexpected error occurred. Please try again or contact support if the problem persists.
        </Text>

        {process.env.NODE_ENV === 'development' && (
          <Box 
            mt={4} 
            p={4} 
            bg={useColorModeValue('gray.100', 'gray.700')} 
            borderRadius="md"
            fontFamily="monospace"
            fontSize="sm"
            overflowX="auto"
          >
            <Text fontWeight="bold" mb={2}>
              {error && error.toString()}
            </Text>
            <Text fontSize="xs" opacity={0.8}>
              {errorInfo?.componentStack}
            </Text>
          </Box>
        )}

        <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} mt={6}>
          <Button 
            colorScheme="blue" 
            onClick={onRetry}
          >
            Try again
          </Button>
          
          <Button 
            as={RouterLink} 
            to="/" 
            variant="outline"
          >
            Go to homepage
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default ErrorBoundary;
