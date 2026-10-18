/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        uber: {
          black: '#000000',
          dark: '#121212',
          gray: '#545454',
          lightGray: '#EEEEEE',
          surface: '#F6F6F6',
          white: '#FFFFFF',
          blue: '#276EF1',
          blueHover: '#1A53B7',
          green: '#05944F',
          greenLight: '#E6F4EA',
          red: '#E11900',
          redLight: '#FCE8E6',
          amber: '#FFC043',
          amberLight: '#FEF7E0'
        }
      },
      fontFamily: {
        sans: ['Inter', 'UberMove', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'uber': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'uber-lg': '0 10px 30px rgba(0, 0, 0, 0.12)',
        'uber-subtle': '0 2px 8px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
