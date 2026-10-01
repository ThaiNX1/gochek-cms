/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
  ],
  theme: {
    fontSize: {
      xs: ['10px', { lineHeight: '14px' }],
      sm: ['11.5px', { lineHeight: '17px' }],
      base: ['12.5px', { lineHeight: '19px' }],
      lg: ['14px', { lineHeight: '21px' }],
      xl: ['16px', { lineHeight: '23px' }],
      '2xl': ['18px', { lineHeight: '25px' }],
      '3xl': ['22px', { lineHeight: '28px' }],
      '4xl': ['26px', { lineHeight: '31px' }],
      '5xl': ['34px', { lineHeight: '1' }],
      '6xl': ['42px', { lineHeight: '1' }],
      '7xl': ['50px', { lineHeight: '1' }],
      '8xl': ['68px', { lineHeight: '1' }],
      '9xl': ['90px', { lineHeight: '1' }],
    },
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        secondary: 'var(--blue-50)',
        blue: {
          50: 'var(--blue-50)',
          100: 'var(--blue-100)',
          200: 'var(--blue-200)',
          300: 'var(--blue-300)',
          400: 'var(--blue-400)',
          500: 'var(--blue-500)',
          600: 'var(--blue-600)',
          700: 'var(--blue-700)',
          800: 'var(--blue-800)',
          900: 'var(--blue-900)',
        },
        gray: {
          50: 'var(--gray-50)',
          100: 'var(--gray-100)',
          200: 'var(--gray-200)',
          300: 'var(--gray-300)',
          400: 'var(--gray-400)',
          500: 'var(--gray-500)',
          600: 'var(--gray-600)',
          700: 'var(--gray-700)',
          800: 'var(--gray-800)',
          900: 'var(--gray-900)',
        }
      }
    },
  },
  plugins: [],
}
