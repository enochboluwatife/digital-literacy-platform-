import { Center, Spinner } from '@chakra-ui/react';

const LoadingSpinner = ({ size = 'xl', ...props }) => {
  return (
    <Center h="100%" minH="200px" w="100%" {...props}>
      <Spinner 
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size={size}
      />
    </Center>
  );
};

export default LoadingSpinner;
