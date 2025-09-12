import React, { useState } from 'react';
import {
  Box,
  AspectRatio,
  Text,
  Alert,
  AlertIcon,
  useColorModeValue
} from '@chakra-ui/react';

const VideoPlayer = ({ videoUrl, title }) => {
  const [error, setError] = useState(false);
  const bgColor = useColorModeValue('gray.100', 'gray.700');

  // Extract video ID and determine platform
  const getVideoEmbedUrl = (url) => {
    if (!url) return null;

    // YouTube URL patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo URL patterns
    const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // Direct video file
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return url;
    }

    return null;
  };

  const embedUrl = getVideoEmbedUrl(videoUrl);
  const isDirectVideo = videoUrl && videoUrl.match(/\.(mp4|webm|ogg)$/i);

  if (!videoUrl) {
    return (
      <Alert status="info">
        <AlertIcon />
        No video content available for this course.
      </Alert>
    );
  }

  if (!embedUrl) {
    return (
      <Alert status="warning">
        <AlertIcon />
        Unsupported video format. Please use YouTube, Vimeo, or direct video links.
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Failed to load video. Please check the video URL.
      </Alert>
    );
  }

  return (
    <Box>
      {title && (
        <Text fontWeight="semibold" mb={3}>
          {title}
        </Text>
      )}
      <AspectRatio ratio={16 / 9} bg={bgColor} borderRadius="md" overflow="hidden">
        {isDirectVideo ? (
          <video
            controls
            style={{ width: '100%', height: '100%' }}
            onError={() => setError(true)}
          >
            <source src={embedUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <iframe
            src={embedUrl}
            title={title || 'Course Video'}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onError={() => setError(true)}
          />
        )}
      </AspectRatio>
    </Box>
  );
};

export default VideoPlayer;
