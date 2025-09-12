import React from 'react';
import { 
  Box, 
  Container, 
  Text, 
  Link as ChakraLink,
  Stack,
  SimpleGrid,
  useColorModeValue
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      header: 'Platform',
      links: [
        { label: 'Courses', to: '/courses' },
        { label: 'Pricing', to: '/pricing' },
        { label: 'Features', to: '/#features' },
      ],
    },
    {
      header: 'Company',
      links: [
        { label: 'About Us', to: '/about' },
        { label: 'Contact', to: '/contact' },
        { label: 'Careers', to: '/careers' },
      ],
    },
    {
      header: 'Legal',
      links: [
        { label: 'Privacy Policy', to: '/privacy' },
        { label: 'Terms of Service', to: '/terms' },
        { label: 'Cookie Policy', to: '/cookies' },
      ],
    },
  ];

  return (
    <Box 
      bg={bg}
      borderTopWidth="1px"
      borderColor={borderColor}
      mt={8}
    >
      <Container as="footer" maxW="container.xl" py={10}>
        <SimpleGrid 
          templateColumns={{ sm: '1fr 1fr', md: '2fr 1fr 1fr 1fr' }} 
          spacing={8}
        >
          <Box>
            <Text fontWeight="bold" fontSize="lg" mb={4}>
              Digital Literacy Platform
            </Text>
            <Text color={textColor} mb={4}>
              Empowering individuals with essential digital skills for the modern world.
            </Text>
          </Box>

          {footerLinks.map((section, index) => (
            <Box key={index}>
              <Text fontWeight="bold" mb={4}>
                {section.header}
              </Text>
              <Stack spacing={2}>
                {section.links.map((link, linkIndex) => (
                  <ChakraLink 
                    key={linkIndex} 
                    as={RouterLink} 
                    to={link.to}
                    color={textColor}
                    _hover={{ color: 'blue.500' }}
                  >
                    {link.label}
                  </ChakraLink>
                ))}
              </Stack>
            </Box>
          ))}
        </SimpleGrid>

        <Box 
          borderTopWidth="1px" 
          borderColor={borderColor} 
          mt={10} 
          pt={6}
          textAlign="center"
        >
          <Text color={textColor} fontSize="sm">
            &copy; {currentYear} Digital Literacy Platform. All rights reserved.
          </Text>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
