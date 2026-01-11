/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom cyber/industrial theme (NOT purple!)
        primary: {
          DEFAULT: '#00ff41', // Cyber green
          dark: '#00cc33',
          light: '#33ff66',
        },
        accent: {
          DEFAULT: '#ff6b00', // Orange accent
          dark: '#cc5500',
        },
        background: {
          DEFAULT: '#000000',
          secondary: '#0a0a0a',
          tertiary: '#1a1a1a',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 255, 65, 0.5)',
        'neon-lg': '0 0 40px rgba(0, 255, 65, 0.7)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

