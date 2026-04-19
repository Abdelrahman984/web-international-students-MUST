/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#001f3f',
        secondary: '#00AC5C',
        accent: '#f97316',
        navy: {
          50: '#E6E8EC',
          100: '#C0C6D1',
          200: '#96A1B3',
          300: '#6B7C96',
          400: '#475B7A',
          500: '#0B1D3A',
          600: '#09172E',
          700: '#071223',
          800: '#040C18',
          900: '#02060D',
        },
        comfortDark: {
          bg: '#0F172A',
          card: '#1E293B',
          navbar: '#334155',
          border: '#475569',
          text: '#F8FAFC',
          'text-secondary': '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Cairo', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

