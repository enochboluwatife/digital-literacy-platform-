import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Heading, Text, VStack } from '@chakra-ui/react';

const NotFound = () => {
  return (
    <Container maxW="container.md" py={20}>
      <VStack spacing={8} textAlign="center">
        <Box>
          <Heading as="h1" size="2xl" mb={4}>
            404 - Page Not Found
          </Heading>
          <Text fontSize="xl" color="gray.600">
            Oops! The page you are looking for doesn't exist or has been moved.
          </Text>
        </Box>
        <Button as={RouterLink} to="/" colorScheme="blue">
          Go to Home
        </Button>
      </VStack>
    </Container>
  );
};

export default NotFound;
