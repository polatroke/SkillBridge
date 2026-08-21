/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C5CE7',
          50: '#F1EFFD',
          100: '#E3DFFB',
          200: '#C7C0F7',
          300: '#ABA0F3',
          400: '#8F80EF',
          500: '#6C5CE7',
          600: '#4B39D6',
          700: '#392AA8',
          800: '#291E79',
          900: '#18124B',
        },
        cta: {
          DEFAULT: '#F2622E',
          50: '#FEF0EA',
          100: '#FCE0D0',
          200: '#F9BFA2',
          300: '#F69E73',
          400: '#F58050',
          500: '#F2622E',
          600: '#D6491A',
          700: '#A83814',
          800: '#79280F',
          900: '#4B1809',
        },
        surface: '#F8F7FF',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        soft: '0 2px 10px 0 rgba(76, 60, 150, 0.08)',
        card: '0 4px 20px 0 rgba(76, 60, 150, 0.10)',
      },
    },
  },
  plugins: [],
}
