/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1173d4',
        'background-light': '#f6f7f8',
        'background-dark': '#101922',
        'foreground-light': '#111418',
        'foreground-dark': '#f6f7f8',
        'subtle-light': '#617589',
        'subtle-dark': '#a0b1c2',
        'border-light': '#dbe0e6',
        'border-dark': '#2a3b4c'
      },
      fontFamily: {
        display: ['Inter', 'Public Sans', 'sans-serif']
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
