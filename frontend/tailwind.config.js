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
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#fad6ac',
          300: '#f6b877',
          400: '#f1913d',
          500: '#ed7214',
          600: '#de5a0d',
          700: '#b8420c',
          800: '#933611',
          900: '#772f10',
          950: '#401407',
        },
        sage: {
          50: '#f6f7f4',
          100: '#e9ebe3',
          200: '#d2d9c8',
          300: '#b2c0a0',
          400: '#8da173',
          500: '#718754',
          600: '#5c6d44',
          700: '#4b5538',
          800: '#3f4631',
          900: '#373c2c',
          950: '#1c1e14',
        },
        cream: {
          50: '#fdfcf8',
          100: '#faf8ef',
          200: '#f3f0dc',
          300: '#ebe5c0',
          400: '#e0d79a',
          500: '#d4c875',
          600: '#bab058',
          700: '#958d43',
          800: '#787237',
          900: '#615d30',
          950: '#333217',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
}