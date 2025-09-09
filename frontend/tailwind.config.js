/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scans all JS/JSX files in src for Tailwind classes
  ],
  theme: {
    extend: {}, // Add custom theme extensions here if needed
  },
  plugins: [], // Add plugins here if needed
}