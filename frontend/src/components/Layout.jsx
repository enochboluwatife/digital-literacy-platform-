import React, { useContext } from 'react';
import { Box, Flex, Heading, Button, useColorModeValue, Container, Text, Avatar, Menu, MenuButton, MenuList, MenuItem, MenuDivider, HStack } from '@chakra-ui/react';
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, User, Settings, BookMarked } from 'lucide-react';
import ColorModeSwitcher from './ColorModeSwitcher';
import { AuthContext } from '../context/AuthContext';

const Layout = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const colorMode = useColorModeValue('light', 'dark');
  const location = useLocation();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const isAuthPage = ['/login', 'register'].some(path => location.pathname.includes(path));
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg="gray.50">
      {/* Header */}
      <Box as="header" borderBottom="1px" borderColor={borderColor} bg={bg} position="sticky" top={0} zIndex={10}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" py={4}>
            <Flex align="center">
              <BookOpen size={24} color="#4F46E5" />
              <Heading as={RouterLink} to="/" size="lg" ml={2} color="#4F46E5">
                DigiLearn
              </Heading>
            </Flex>
            
            <Flex align="center" gap={4}>
              <ColorModeSwitcher />
              {user ? (
                <Menu>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    rounded="full"
                    px={2}
                  >
                    <HStack spacing={2}>
                      <Avatar size="sm" name={user.name || user.email} src={user.avatar} />
                      <Text display={{ base: 'none', md: 'block' }}>{user.name || user.email.split('@')[0]}</Text>
                    </HStack>
                  </MenuButton>
                  <MenuList>
                    <MenuItem 
                      icon={<User size={16} />} 
                      as={RouterLink} 
                      to="/profile"
                    >
                      Profile
                    </MenuItem>
                    {user?.role === 'teacher' && (
                      <MenuItem 
                        icon={<BookMarked size={16} />} 
                        as={RouterLink} 
                        to="/teacher"
                      >
                        Teacher Dashboard
                      </MenuItem>
                    )}
                    <MenuItem 
                      icon={<Settings size={16} />} 
                      as={RouterLink} 
                      to="/settings"
                    >
                      Settings
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem 
                      icon={<LogOut size={16} />} 
                      onClick={handleLogout} 
                      color="red.500"
                    >
                      Sign Out
                    </MenuItem>
                  </MenuList>
                </Menu>
              ) : !isAuthPage ? (
                <>
                  <Button as={RouterLink} to="/login" variant="outline" size="sm">
                    Log In
                  </Button>
                  <Button as={RouterLink} to="/register" colorScheme="blue" size="sm">
                    Sign Up
                  </Button>
                </>
              ) : null}
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Box as="main" flex="1">
        <Outlet />
      </Box>

      {/* Footer */}
      <Box as="footer" bg={bg} borderTop="1px" borderColor={borderColor} py={6}>
        <Container maxW="container.xl">
          <Text textAlign="center" color="gray.500" fontSize="sm">
            &copy; {new Date().getFullYear()} DigiLearn. All rights reserved.
          </Text>
        </Container>
      </Box>
    </Box>
  )
}

export default Layout
