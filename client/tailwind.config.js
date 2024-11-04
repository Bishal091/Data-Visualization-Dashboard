/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      
      fontFamily: {
        'josefin': ['"Josefin Sans"', 'sans-serif'],
        'ubuntu': ['"Ubuntu"', 'sans-serif'],
        'playpen': ['"Playpen Sans"', 'sans-serif'],
        'rubik': ['"Rubik"', 'sans-serif'],
        'comic': ['"Comic Neue"', 'sans-serif'],
      },
      animation: {
        'gradient-x': 'gradient-x 8s ease infinite',
        'slowZoom': 'slowZoom 5s ease-in-out infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'slowZoom': {
          '0%, 100%': { 'transform': 'scale(1)' },
          '50%': { 'transform': 'scale(1.3)' },
        }
      },
    
    
    },

      
  },
  plugins: [],
}

