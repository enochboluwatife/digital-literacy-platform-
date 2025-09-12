import React from "react";
import { Box, FormControl, FormLabel, Divider } from "@chakra-ui/react";
import ImageUploader from "../ImageUploader";

const ProfilePictureUploader = ({ onImageSelect }) => {
  return (
    <Box width="100%">
      <FormControl id="profile-picture" mb={4}>
        <FormLabel>Profile Picture (Optional)</FormLabel>
        <ImageUploader
          onImageSelect={onImageSelect}
          maxSizeMB={2}
          allowedTypes={["image/jpeg", "image/png", "image/webp"]}
        />
      </FormControl>
      <Divider my={6} />
    </Box>
  );
};

export default ProfilePictureUploader;
