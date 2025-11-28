/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // This line is CRITICAL. It tells Tailwind to look for class="dark" on the HTML tag
  // instead of checking the operating system preference.
  darkMode: 'class', 
  theme: {
    extend: {
        animation: {
            'fade-in-up': 'fadeInUp 0.5s ease-out',
            'spin-slow': 'spin 3s linear infinite',
            'blob': 'blob 7s infinite',
        },
        keyframes: {
            fadeInUp: {
                '0%': { opacity: '0', transform: 'translateY(10px)' },
                '100%': { opacity: '1', transform: 'translateY(0)' },
            },
            blob: {
                '0%': { transform: 'translate(0px, 0px) scale(1)' },
                '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                '100%': { transform: 'translate(0px, 0px) scale(1)' },
            },
        },
    },
  },
  plugins: [],
}