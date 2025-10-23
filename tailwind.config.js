/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#5d0008',
          secondary: '#8b0012',
        },
      },
      animation: {
        'card-drop': 'cardDrop 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'content-reveal': 'contentReveal 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      },
      keyframes: {
        cardDrop: {
          '0%': { transform: 'translateY(-100vh)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        contentReveal: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

