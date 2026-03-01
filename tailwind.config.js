/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#f7f3ed',
        card: '#fffdf9',
        ink: '#3e3a36',
        soft: '#8d8478',
        line: '#e8e0d5',
        good: '#9cb7a8',
        bad: '#b39a95',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 6px 18px rgba(88, 76, 63, 0.08)',
      },
    },
  },
  plugins: [],
}
