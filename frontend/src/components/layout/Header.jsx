import React from 'react';
import { 
  Box, 
  Flex, 
  Button, 
  useColorModeValue, 
  useColorMode,
  Text,
  IconButton,
  HStack,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <Box bg={bg} px={4} borderBottomWidth="1px" borderColor={borderColor} shadow="sm">
      <Flex h={16} alignItems="center" justifyContent="space-between" maxW="container.xl" mx="auto">
        <Text 
          fontSize="xl" 
          fontWeight="bold" 
          as={RouterLink} 
          to="/" 
          color={useColorModeValue('blue.600', 'blue.300')}
          _hover={{ textDecoration: 'none', opacity: 0.8 }}
        >
          Digital Literacy Platform
        </Text>

        <HStack spacing={4}>
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            size="sm"
          />
          
          {isAuthenticated ? (
            <>
              <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
                Welcome, {user?.first_name || user?.email}!
              </Text>
              <Button onClick={handleLogout} variant="outline" size="sm" colorScheme="red">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button as={RouterLink} to="/login" variant="ghost" size="sm">
                Sign in
              </Button>
              <Button as={RouterLink} to="/register" colorScheme="blue" size="sm">
                Sign up
              </Button>
            </>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
