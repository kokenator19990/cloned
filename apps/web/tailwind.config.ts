import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cloned: {
          bg: '#FDFAF6',
          card: '#FFFFFF',
          'card-alt': '#F8F2EB',
          border: '#E8DFD3',
          accent: '#C08552',
          'accent-light': '#D4A574',
          'accent-dark': '#9A6B3E',
          text: '#2D2A26',
          muted: '#8C8279',
          soft: '#F5EDE3',
          success: '#5A8A5E',
          danger: '#C25B4A',
          hero: '#FDF5EC',
        },
      },
      fontFamily: {
        display: ['Georgia', 'Times New Roman', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
