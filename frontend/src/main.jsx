import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import App from './App';
import theme from './theme';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);

// Initialize color mode
const colorModeKey = 'chakra-ui-color-mode';

// Set initial color mode class on HTML element
const setColorMode = () => {
  const savedMode = localStorage.getItem(colorModeKey);
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedMode === 'dark' || (!savedMode && systemDark);
  
  if (isDark) {
    document.documentElement.classList.add('chakra-ui-dark');
    document.documentElement.style.color = '#ffffff';
    document.documentElement.style.backgroundColor = '#1a202c';
  } else {
    document.documentElement.classList.remove('chakra-ui-dark');
    document.documentElement.style.color = '#000000';
    document.documentElement.style.backgroundColor = '#ffffff';
  }
};

// Set initial color mode
setColorMode();

// Listen for system color scheme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setColorMode);

root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <ColorModeScript 
        initialColorMode={theme.config.initialColorMode}
        storageKey={colorModeKey}
      />
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
