import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    esbuild: {
      minify: false // Disable esbuild minification
    },
    plugins: [
      react({
        include: '**/*.{js,jsx}',
        babel: {
          presets: ['@babel/preset-react'],
          plugins: [
            ['@emotion/babel-plugin', {
              autoLabel: 'dev-only',
              labelFormat: '[local]'
            }]
          ]
        },
        jsxImportSource: '@emotion/react',
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
    },
    define: {
      'process.env': {}
    },
    server: {
      port: 5173,
      open: true,
      strictPort: true,
      proxy: {
        '^/api': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      },
      fs: {
        // Allow serving files from one level up from the package root
        allow: ['..']
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: undefined,
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]'
        }
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.js',
      testMatch: ['<rootDir>/src/**/*.test.{js,jsx,ts,tsx}'],
      coverage: {
        reporter: ['text', 'json', 'html'],
      },
    }
  };
});
