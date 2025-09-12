import React from 'react';
import {
  Box,
  Flex,
  Text,
  Avatar,
  VStack,
  HStack,
  Divider,
  Button,
  useColorModeValue,
  Badge,
  Icon,
  SimpleGrid,
  Link as ChakraLink,
  Tooltip
} from '@chakra-ui/react';
import { MessageCircle, BookOpen, Star, Award, Globe, Twitter, Linkedin, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

export const InstructorInfo = ({ instructor }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const secondaryText = useColorModeValue('gray.600', 'gray.400');
  
  // Default instructor data in case not provided
  const instructorData = {
    name: instructor?.name || 'Dr. Adebayo Ogundimu',
    title: instructor?.title || 'Professor of Computer Science',
    bio: instructor?.bio || 'Dr. Adebayo Ogundimu is a renowned expert in digital literacy with over 15 years of experience in technology education. He has trained thousands of students and professionals across Africa in digital skills and has been recognized with multiple awards for his contributions to technology education.',
    avatar: instructor?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg',
    rating: instructor?.rating || 4.8,
    reviews: instructor?.reviews || 1287,
    students: instructor?.students || 15000,
    courses: instructor?.courses || 12,
    social: {
      twitter: instructor?.social?.twitter || '#',
      linkedin: instructor?.social?.linkedin || '#',
      website: instructor?.social?.website || '#',
      github: instructor?.social?.github || '#'
    },
    skills: instructor?.skills || [
      'Digital Literacy', 
      'Computer Science', 
      'Web Development', 
      'Cybersecurity',
      'Data Science',
      'Teaching'
    ],
    achievements: instructor?.achievements || [
      'PhD in Computer Science',
      'Microsoft Certified Trainer',
      'Google Certified Educator',
      'Award for Excellence in Teaching'
    ]
  };

  return (
    <Box 
      bg={cardBg} 
      borderRadius="lg" 
      borderWidth="1px" 
      borderColor={borderColor}
      overflow="hidden"
    >
      <Box p={6}>
        <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
          <Box flexShrink={0} textAlign="center">
            <Avatar 
              size="2xl" 
              name={instructorData.name} 
              src={instructorData.avatar} 
              mb={4}
              borderWidth="2px"
              borderColor="blue.200"
            />
            <Button 
              as={Link}
              to="/messages/new"
              leftIcon={<Icon as={MessageCircle} />}
              colorScheme="blue"
              variant="outline"
              size="sm"
              w="100%"
              mb={3}
            >
              Message
            </Button>
            <Button 
              as={Link}
              to={`/instructors/${instructorData.id || '1'}`}
              variant="ghost"
              size="sm"
              w="100%"
            >
              View Profile
            </Button>
          </Box>
          
          <Box flex={1}>
            <Flex justify="space-between" align="flex-start" mb={2}>
              <Box>
                <Text fontSize="xl" fontWeight="bold">{instructorData.name}</Text>
                <Text color="blue.600" mb={2}>{instructorData.title}</Text>
                
                <HStack spacing={4} mb={4} flexWrap="wrap">
                  <HStack spacing={1}>
                    <Icon as={Star} size={16} color="yellow.500" fill="currentColor" />
                    <Text fontSize="sm">
                      {instructorData.rating} ({instructorData.reviews.toLocaleString()} reviews)
                    </Text>
                  </HStack>
                  <HStack spacing={1}>
                    <Icon as={BookOpen} size={16} />
                    <Text fontSize="sm">{instructorData.courses} courses</Text>
                  </HStack>
                  <HStack spacing={1}>
                    <Icon as={Users} size={16} />
                    <Text fontSize="sm">{instructorData.students.toLocaleString()} students</Text>
                  </HStack>
                </HStack>
              </Box>
              
              <HStack spacing={2}>
                {instructorData.social.website && (
                  <Tooltip label="Website">
                    <ChakraLink href={instructorData.social.website} isExternal>
                      <Icon as={Globe} size={20} color={secondaryText} _hover={{ color: 'blue.500' }} />
                    </ChakraLink>
                  </Tooltip>
                )}
                {instructorData.social.twitter && (
                  <Tooltip label="Twitter">
                    <ChakraLink href={instructorData.social.twitter} isExternal>
                      <Icon as={Twitter} size={20} color={secondaryText} _hover={{ color: '#1DA1F2' }} />
                    </ChakraLink>
                  </Tooltip>
                )}
                {instructorData.social.linkedin && (
                  <Tooltip label="LinkedIn">
                    <ChakraLink href={instructorData.social.linkedin} isExternal>
                      <Icon as={Linkedin} size={20} color={secondaryText} _hover={{ color: '#0077B5' }} />
                    </ChakraLink>
                  </Tooltip>
                )}
                {instructorData.social.github && (
                  <Tooltip label="GitHub">
                    <ChakraLink href={instructorData.social.github} isExternal>
                      <Icon as={Github} size={20} color={secondaryText} _hover={{ color: 'gray.800' }} />
                    </ChakraLink>
                  </Tooltip>
                )}
              </HStack>
            </Flex>
            
            <Text color={secondaryText} mb={6} lineHeight="tall">
              {instructorData.bio}
            </Text>
            
            <Box mb={6}>
              <Text fontWeight="bold" mb={2}>Skills</Text>
              <Flex wrap="wrap" gap={2}>
                {instructorData.skills.map((skill, index) => (
                  <Badge 
                    key={index} 
                    colorScheme="blue" 
                    variant="subtle" 
                    px={3} 
                    py={1} 
                    borderRadius="full"
                  >
                    {skill}
                  </Badge>
                ))}
              </Flex>
            </Box>
            
            <Box>
              <Text fontWeight="bold" mb={2}>Achievements</Text>
              <VStack align="stretch" spacing={3}>
                {instructorData.achievements.map((achievement, index) => (
                  <HStack key={index} spacing={3}>
                    <Box color="green.500">
                      <Icon as={Award} size={18} />
                    </Box>
                    <Text color={secondaryText}>{achievement}</Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          </Box>
        </Flex>
      </Box>
      
      <Divider />
      
      <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')}>
        <Text fontWeight="bold" mb={3}>More from {instructorData.name.split(' ')[0]}</Text>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
          {[1, 2, 3].map((course) => (
            <Box 
              key={course} 
              p={3} 
              bg={cardBg} 
              borderRadius="md" 
              borderWidth="1px" 
              borderColor={borderColor}
              _hover={{ transform: 'translateY(-2px)', shadow: 'sm' }}
              transition="all 0.2s"
            >
              <Text fontWeight="medium" mb={1} noOfLines={2}>
                {course === 1 && 'Advanced Digital Marketing Strategies'}
                {course === 2 && 'Introduction to Web Development'}
                {course === 3 && 'Cybersecurity Fundamentals'}
              </Text>
              <Text fontSize="sm" color={secondaryText} noOfLines={2} mb={2}>
                {course === 1 && 'Master the latest digital marketing techniques and tools to grow your business online.'}
                {course === 2 && 'Learn HTML, CSS, and JavaScript to build your first website from scratch.'}
                {course === 3 && 'Understand the basics of cybersecurity and how to protect yourself online.'}
              </Text>
              <Button 
                as={Link}
                to={`/courses/${course}`}
                size="sm"
                variant="outline"
                colorScheme="blue"
                w="100%"
              >
                View Course
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default InstructorInfo;
