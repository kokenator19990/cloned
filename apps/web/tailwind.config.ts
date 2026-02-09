import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        deadbot: {
          bg: '#0a0a0f',
          card: '#16161f',
          border: '#2a2a3a',
          accent: '#7c3aed',
          'accent-light': '#a78bfa',
          text: '#e2e8f0',
          muted: '#94a3b8',
        },
      },
    },
  },
  plugins: [],
};

export default config;
