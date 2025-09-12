import { extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
  },
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
    mono: `'JetBrains Mono', 'Fira Code', 'Roboto Mono', monospace`,
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    normal: 'normal',
    none: 1,
    shorter: 1.25,
    short: 1.375,
    base: 1.5,
    tall: 1.625,
    taller: '2',
  },
  letterSpacings: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  breakpoints: {
    sm: '30em',  // 480px
    md: '48em',   // 768px
    lg: '62em',   // 992px
    xl: '80em',   // 1280px
    '2xl': '96em', // 1536px
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'md',
        _focus: {
          boxShadow: 'outline',
        },
      },
      variants: {
        solid: (props) => ({
          bg: mode('brand.600', 'brand.200')(props),
          color: mode('white', 'gray.800')(props),
          _hover: {
            bg: mode('brand.700', 'brand.300')(props),
            transform: 'translateY(-1px)',
            boxShadow: 'md',
          },
          _active: {
            bg: mode('brand.800', 'brand.400')(props),
            transform: 'translateY(0)',
          },
        }),
        outline: (props) => ({
          border: '2px solid',
          borderColor: mode('brand.500', 'brand.200')(props),
          color: mode('brand.600', 'brand.200')(props),
          _hover: {
            bg: mode('brand.50', 'whiteAlpha.200')(props),
          },
          _active: {
            bg: mode('brand.100', 'whiteAlpha.300')(props),
          },
        }),
        ghost: (props) => ({
          _hover: {
            bg: mode('gray.100', 'whiteAlpha.200')(props),
          },
          _active: {
            bg: mode('gray.200', 'whiteAlpha.300')(props),
          },
        }),
      },
      sizes: {
        lg: {
          h: 12,
          minW: 12,
          fontSize: 'lg',
          px: 6,
        },
        md: {
          h: 10,
          minW: 10,
          fontSize: 'md',
          px: 4,
        },
        sm: {
          h: 8,
          minW: 8,
          fontSize: 'sm',
          px: 3,
        },
        xs: {
          h: 6,
          minW: 6,
          fontSize: 'xs',
          px: 2,
        },
      },
      defaultProps: {
        variant: 'solid',
        size: 'md',
        colorScheme: 'brand',
      },
    },
    Input: {
      baseStyle: {
        field: {
          _focus: {
            borderColor: 'brand.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
          },
        },
      },
      sizes: {
        lg: {
          field: {
            fontSize: 'lg',
            px: 4,
            h: 12,
            borderRadius: 'md',
          },
        },
        md: {
          field: {
            fontSize: 'md',
            px: 4,
            h: 10,
            borderRadius: 'md',
          },
        },
        sm: {
          field: {
            fontSize: 'sm',
            px: 3,
            h: 8,
            borderRadius: 'sm',
          },
        },
      },
      defaultProps: {
        size: 'md',
        focusBorderColor: 'brand.500',
      },
    },
    FormLabel: {
      baseStyle: {
        mb: 1,
        fontWeight: 'medium',
        _disabled: {
          opacity: 0.4,
        },
      },
    },
    Alert: {
      variants: {
        subtle: (props) => ({
          container: {
            bg: mode(`${props.colorScheme}.50`, `${props.colorScheme}.800`)(props),
          },
        }),
      },
    },
    Menu: {
      baseStyle: (props) => ({
        item: {
          _focus: {
            bg: mode('gray.100', 'whiteAlpha.200')(props),
          },
          _active: {
            bg: mode('gray.200', 'whiteAlpha.300')(props),
          },
        },
      }),
    },
    Card: {
      baseStyle: (props) => ({
        container: {
          bg: mode('white', 'gray.800')(props),
          boxShadow: 'sm',
          borderRadius: 'lg',
          overflow: 'hidden',
          _hover: {
            boxShadow: 'md',
          },
        },
      }),
    },
  },
  styles: {
    global: (props) => ({
      'html, body': {
        color: mode('gray.800', 'whiteAlpha.900')(props),
        bg: mode('gray.50', 'gray.900')(props),
        lineHeight: 'base',
      },
      '::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '::-webkit-scrollbar-track': {
        bg: mode('gray.100', 'gray.900')(props),
      },
      '::-webkit-scrollbar-thumb': {
        bg: mode('gray.400', 'gray.600')(props),
        borderRadius: '4px',
        '&:hover': {
          bg: mode('gray.500', 'gray.500')(props),
        },
      },
      '::selection': {
        bg: 'brand.100',
        color: 'brand.700',
      },
      'input:-webkit-autofill,\n      input:-webkit-autofill:hover, \n      input:-webkit-autofill:focus, \n      input:-webkit-autofill:active': {
        WebkitBoxShadow: `0 0 0 30px ${mode('#fff', '#1a202c')(props)} inset !important`,
        WebkitTextFillColor: mode('gray.800', 'white')(props) + ' !important',
        transition: 'background-color 5000s ease-in-out 0s',
      },
    }),
  },
  config: {
    initialColorMode: 'system',
    useSystemColorMode: true,
    disableTransitionOnChange: false,
  },
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    outline: '0 0 0 3px rgba(66, 153, 225, 0.5)',
    none: 'none',
  },
  space: {
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },
  zIndices: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
});

export default theme;
