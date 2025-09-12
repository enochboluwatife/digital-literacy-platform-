import React, { useCallback, useState } from 'react';
import { Box, Button, Image, Text, VStack, useToast } from '@chakra-ui/react';
import { FiUpload } from 'react-icons/fi';

const ImageUploader = ({
  onImageSelect,
  maxSizeMB = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  ...props
}) => {
  const [preview, setPreview] = useState(null);
  const toast = useToast();

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: `Please upload an image of type: ${allowedTypes.join(', ')}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Check file size (in bytes)
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: `Maximum file size is ${maxSizeMB}MB`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      onImageSelect(file);
    };
    reader.readAsDataURL(file);
  }, [maxSizeMB, allowedTypes, onImageSelect, toast]);

  return (
    <VStack spacing={4} align="center" {...props}>
      <Box
        border="2px"
        borderColor="gray.300"
        borderStyle="dashed"
        borderRadius="md"
        p={6}
        textAlign="center"
        width="100%"
        _hover={{ borderColor: 'blue.500' }}
      >
        <input
          type="file"
          accept={allowedTypes.join(',')}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="image-upload"
        />
        <label htmlFor="image-upload">
          <VStack spacing={2} cursor="pointer">
            <FiUpload size={32} />
            <Text fontWeight="medium">Click to upload or drag and drop</Text>
            <Text fontSize="sm" color="gray.500">
              {`${allowedTypes.join(', ')} (max ${maxSizeMB}MB)`}
            </Text>
          </VStack>
        </label>
      </Box>
      
      {preview && (
        <Box mt={4} boxSize="200px" position="relative">
          <Image
            src={preview}
            alt="Preview"
            objectFit="cover"
            borderRadius="md"
            boxShadow="md"
          />
        </Box>
      )}
    </VStack>
  );
};

export default ImageUploader;
