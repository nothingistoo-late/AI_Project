/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        poker: {
          green: '#0d7a3d',
          felt: '#0d5a2c',
          gold: '#ffd700',
        },
      },
    },
  },
  plugins: [],
}


