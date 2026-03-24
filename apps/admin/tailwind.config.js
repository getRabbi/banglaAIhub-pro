/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        bangla: ['Hind Siliguri', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['monospace'],
      },
    },
  },
  plugins: [],
}
