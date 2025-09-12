/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e6f7f0',
          100: '#c1ebd9',
          200: '#9bdfc2',
          300: '#75d3aa',
          400: '#4fc793',
          500: '#36ae7a',
          600: '#2a875e',
          700: '#1e6143',
          800: '#123b27',
          900: '#06160c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
