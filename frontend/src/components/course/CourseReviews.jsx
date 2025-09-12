import React, { useState } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Avatar,
  Divider,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Textarea,
  FormControl,
  FormLabel,
  Icon,
  useToast,
  Badge,
  Flex,
  useColorModeValue,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup
} from '@chakra-ui/react';
import { Star, MessageSquare, ThumbsUp, User, CheckCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Star rating component
const StarRating = ({ rating, setRating, isInteractive = false, size = 5 }) => {
  const stars = [];
  
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Icon
        key={i}
        as={Star}
        boxSize={size}
        color={i <= rating ? 'yellow.400' : 'gray.300'}
        fill={i <= rating ? 'currentColor' : 'none'}
        cursor={isInteractive ? 'pointer' : 'default'}
        onClick={() => isInteractive && setRating(i)}
        onMouseEnter={() => isInteractive && setRating(i)}
        transition="color 0.2s"
      />
    );
  }
  
  return <HStack spacing={1}>{stars}</HStack>;
};

// Individual review component
const ReviewItem = ({ review }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(review.likes || 0);
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.800');
  
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };
  
  return (
    <Box 
      borderWidth="1px" 
      borderRadius="md" 
      p={4} 
      mb={4}
      borderColor={borderColor}
      _hover={{ bg: hoverBg, borderColor: 'blue.200' }}
      transition="all 0.2s"
    >
      <Flex justify="space-between" mb={3}>
        <HStack spacing={3}>
          <Avatar 
            name={review.user.name} 
            src={review.user.avatar} 
            size="sm" 
          />
          <Box>
            <Text fontWeight="medium">{review.user.name}</Text>
            <HStack spacing={1}>
              <StarRating rating={review.rating} size={4} />
              <Text fontSize="sm" color="gray.500">
                {new Date(review.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </Text>
            </HStack>
          </Box>
        </HStack>
        
        {review.verified && (
          <Badge colorScheme="green" variant="subtle" fontSize="xs">
            <HStack spacing={1}>
              <Icon as={CheckCircle} size={12} />
              <Text>Verified Student</Text>
            </HStack>
          </Badge>
        )}
      </Flex>
      
      <Text mb={3}>{review.comment}</Text>
      
      <Flex justify="space-between" align="center">
        <Button 
          variant="ghost" 
          size="sm" 
          leftIcon={<Icon as={ThumbsUp} />}
          colorScheme={isLiked ? 'blue' : 'gray'}
          onClick={handleLike}
        >
          {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
        </Button>
        
        <Button variant="ghost" size="sm">
          Reply
        </Button>
      </Flex>
      
      {review.replies && review.replies.length > 0 && (
        <Box mt={4} pl={4} borderLeftWidth="2px" borderColor="blue.200">
          <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.600">
            Instructor's Response:
          </Text>
          <Text fontSize="sm" color="gray.600">
            {review.replies[0].text}
          </Text>
          <Text fontSize="xs" color="gray.500" mt={1} textAlign="right">
            - {review.replies[0].author}, {review.replies[0].role}
          </Text>
        </Box>
      )}
    </Box>
  );
};

// Review statistics component
const ReviewStats = ({ reviews }) => {
  const totalRatings = reviews.length;
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalRatings;
  
  // Calculate rating distribution
  const ratingCounts = [0, 0, 0, 0, 0]; // 1-5 stars
  reviews.forEach(review => {
    ratingCounts[review.rating - 1]++;
  });
  
  return (
    <Box mb={8}>
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" mb={6}>
        <Box textAlign={{ base: 'center', md: 'left' }} mb={{ base: 4, md: 0 }}>
          <Text fontSize="5xl" fontWeight="bold" lineHeight="1">
            {averageRating.toFixed(1)}
            <Text as="span" fontSize="lg" color="gray.500" fontWeight="normal">/5</Text>
          </Text>
          <StarRating rating={Math.round(averageRating)} size={6} />
          <Text color="gray.500">
            Based on {totalRatings} {totalRatings === 1 ? 'review' : 'reviews'}
          </Text>
        </Box>
        
        <Box w={{ base: '100%', md: '60%' }}>
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingCounts[rating - 1] || 0;
            const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
            
            return (
              <Flex key={rating} align="center" mb={2}>
                <Text w="30px" fontSize="sm" color="gray.600">
                  {rating}
                </Text>
                <Icon as={Star} color="yellow.400" fill="currentColor" size={16} mx={2} />
                <Progress 
                  value={percentage} 
                  flex="1" 
                  size="sm" 
                  colorScheme="yellow" 
                  borderRadius="full"
                  bg={useColorModeValue('gray.100', 'gray.700')}
                />
                <Text w="50px" textAlign="right" fontSize="sm" color="gray.600" ml={2}>
                  {count}
                </Text>
              </Flex>
            );
          })}
        </Box>
      </Flex>
      
      <StatGroup mb={6} textAlign="center">
        <Stat px={3} py={2} borderWidth="1px" borderRadius="md" borderColor={useColorModeValue('gray.200', 'gray.700')}>
          <StatLabel>Course Rating</StatLabel>
          <StatNumber>{averageRating.toFixed(1)}</StatNumber>
          <StatHelpText>
            <StatArrow type={averageRating >= 4.5 ? 'increase' : 'decrease'} />
            {averageRating >= 4.5 ? 'Excellent' : 'Good'} rating
          </StatHelpText>
        </Stat>
        
        <Stat px={3} py={2} borderWidth="1px" borderRadius="md" borderColor={useColorModeValue('gray.200', 'gray.700')} ml={4}>
          <StatLabel>Would Recommend</StatLabel>
          <StatNumber>92%</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            Based on {Math.floor(totalRatings * 0.85)} reviews
          </StatHelpText>
        </Stat>
        
        <Stat px={3} py={2} borderWidth="1px" borderRadius="md" borderColor={useColorModeValue('gray.200', 'gray.700')} ml={4}>
          <StatLabel>Difficulty</StatLabel>
          <StatNumber>Beginner</StatNumber>
          <StatHelpText>Most students found this course easy to follow</StatHelpText>
        </Stat>
      </StatGroup>
    </Box>
  );
};

// Main component
export const CourseReviews = ({ reviews = [], courseId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const { user } = useAuth();
  const toast = useToast();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Sample reviews if none provided
  const sampleReviews = [
    {
      id: 1,
      user: {
        name: 'Adebayo Johnson',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
      },
      rating: 5,
      date: '2023-10-15T14:30:00Z',
      comment: 'This course was absolutely fantastic! The instructor explained complex concepts in a very simple way. I highly recommend it to anyone looking to improve their digital skills.',
      likes: 24,
      verified: true,
      replies: [
        {
          id: 1,
          text: 'Thank you for your kind words, Adebayo! I\'m thrilled to hear you found the course valuable. Best of luck with your digital journey!',
          author: 'Dr. Adebayo Ogundimu',
          role: 'Instructor',
          date: '2023-10-16T09:15:00Z'
        }
      ]
    },
    {
      id: 2,
      user: {
        name: 'Chioma Eze',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
      },
      rating: 4,
      date: '2023-09-28T16:45:00Z',
      comment: 'Great course with lots of practical examples. The only reason I\'m giving it 4 stars is because I wish there were more advanced topics covered.',
      likes: 12,
      verified: true
    },
    {
      id: 3,
      user: {
        name: 'Oluwaseun Adebayo',
        avatar: 'https://randomuser.me/api/portraits/men/67.jpg'
      },
      rating: 5,
      date: '2023-09-10T11:20:00Z',
      comment: 'I was a complete beginner when I started this course, and now I feel much more confident using technology in my daily life. The step-by-step instructions were very helpful.',
      likes: 8,
      verified: true
    }
  ];
  
  const displayReviews = reviews.length > 0 ? reviews : sampleReviews;
  
  const handleSubmitReview = () => {
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to leave a review.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (!reviewText.trim()) {
      toast({
        title: 'Review cannot be empty',
        description: 'Please write your review before submitting.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // In a real app, you would submit to your API here
    console.log('Submitting review:', { rating, comment: reviewText });
    
    // Show success message
    toast({
      title: 'Review submitted!',
      description: 'Thank you for your feedback.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    
    // Reset form and close modal
    setReviewText('');
    setRating(5);
    onClose();
  };
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold">Student Reviews</Text>
          <Text color="gray.500">
            What students are saying about this course
          </Text>
        </Box>
        <Button 
          colorScheme="blue" 
          leftIcon={<Icon as={MessageSquare} />}
          onClick={onOpen}
        >
          Write a Review
        </Button>
      </Flex>
      
      <ReviewStats reviews={displayReviews} />
      
      <VStack spacing={4} align="stretch" divider={<Divider borderColor={borderColor} />}>
        {displayReviews.map(review => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </VStack>
      
      {displayReviews.length > 3 && (
        <Box textAlign="center" mt={6}>
          <Button variant="outline" rightIcon={<ChevronRight />}>
            See All Reviews
          </Button>
        </Box>
      )}
      
      {/* Review Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Write a Review</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <Box>
                <Text mb={2} fontWeight="medium">How would you rate this course?</Text>
                <StarRating 
                  rating={rating} 
                  setRating={setRating} 
                  isInteractive={true}
                  size={8}
                />
                <Text mt={1} color="gray.500" fontSize="sm">
                  {rating} star{rating !== 1 ? 's' : ''} - 
                  {rating === 5 ? 'Excellent' : 
                   rating === 4 ? 'Good' : 
                   rating === 3 ? 'Average' : 
                   rating === 2 ? 'Below Average' : 'Poor'}
                </Text>
              </Box>
              
              <FormControl>
                <FormLabel>Your Review</FormLabel>
                <Textarea 
                  placeholder="Share your experience with this course. What did you like or dislike?"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={6}
                />
              </FormControl>
              
              {!user && (
                <Box 
                  bg="yellow.50" 
                  borderLeftWidth="4px" 
                  borderLeftColor="yellow.400" 
                  p={3}
                  borderRadius="md"
                >
                  <Text fontSize="sm" color="yellow.800">
                    You need to be signed in to leave a review. Your review will be posted publicly.
                  </Text>
                </Box>
              )}
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSubmitReview}
              isDisabled={!reviewText.trim()}
            >
              Submit Review
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CourseReviews;
