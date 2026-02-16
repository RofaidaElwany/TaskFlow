/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './assets/**/*.{css,js}',
    './includes/class-series-block-render.php',
    './includes/**/*.php',
    './*.php'
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#2b8cee',
      }
    },
  },
  plugins: [],
}