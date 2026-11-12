/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdfaf2',
          100: '#f9f0da',
          200: '#ebd8a7',
          300: '#dcbc72',
          400: '#ce9f42',
          500: '#b7832e',
          600: '#a36d24',
          700: '#87531d',
          800: '#6d4018',
          900: '#583215',
        },
        maroon: {
          50: '#fcf3f4',
          100: '#f7e4e6',
          200: '#f0ccd1',
          300: '#e2a7b0',
          400: '#d17887',
          500: '#b84e61',
          600: '#9d3b4d',
          700: '#832e3e',
          800: '#6d2633',
          900: '#5a212c',
          950: '#3a0f14',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif"', 'serif'],
      },
    },
  },
  plugins: [],
}
