import type { Config } from 'tailwindcss';
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { obsidian: '#080b10', ember: '#ff5c35', aurora: '#38f8c5', voltage: '#c6ff00' },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
