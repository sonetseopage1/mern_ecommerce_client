/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-bn)', 'system-ui', 'sans-serif'],
        bn: ['var(--font-bn)', 'var(--font-inter)', 'sans-serif'],
      },
      colors: {
        brand: { 50: '#fff6ec', 100: '#ffe8cf', 200: '#ffd0a0', 300: '#fbb06a', 400: '#f79a3f', 500: '#f58a1f', 600: '#e2760d', 700: '#bd5e08', 800: '#924a0c', 900: '#763d0e' },
        ink: { 50: '#eef5f5', 100: '#d6e6e7', 200: '#adcdcf', 300: '#7aa9ac', 400: '#4a8387', 500: '#2b6468', 600: '#1d4d52', 700: '#153b40', 800: '#0f2d31', 900: '#0a2024' },
        accent: { 400: '#2f9a9e', 500: '#1b7a7e', 600: '#14595c' },
      },
      boxShadow: { soft: '0 2px 10px -2px rgba(10,32,36,.08)' },
      keyframes: { pop: { '0%': { transform: 'scale(.9)', opacity: 0 }, '100%': { transform: 'scale(1)', opacity: 1 } } },
      animation: { pop: 'pop .2s ease-out' },
    },
  },
  plugins: [],
};
