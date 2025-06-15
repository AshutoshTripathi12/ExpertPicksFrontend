/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
 'primary': '#D946EF',         // Fuchsia-500
  'primary-hover': '#C026D3',    // Fuchsia-600
  'primary-text': '#FFFFFF',    // White
  'background': '#FFFBEB',     // Light Cream
  'surface': '#FFFFFF',       // White
  'text-main': '#44403C',      // Dark Brownish-Gray
  'text-muted': '#78716C',    // Taupe
  'border-color': '#E7E5E4',  // Light Stone
      },
      // --- THIS IS THE NEW SECTION FOR FONTS ---
      fontFamily: {
        sans: [
          'Inter', // Our new primary font
          'ui-sans-serif', 
          'system-ui', 
          '-apple-system', 
          'BlinkMacSystemFont', 
          '"Segoe UI"', 
          'Roboto', 
          '"Helvetica Neue"', 
          'Arial', 
          '"Noto Sans"', 
          'sans-serif', 
          '"Apple Color Emoji"', 
          '"Segoe UI Emoji"', 
          '"Segoe UI Symbol"', 
          '"Noto Color Emoji"',
        ],
      },
    },
  },
  plugins: [
    // Ensure this line is present and uncommented after installing the package
    require('@tailwindcss/forms'),

    // We also added these previously for the card UI.
    // If you haven't installed them, you should: npm install -D @tailwindcss/line-clamp @tailwindcss/aspect-ratio
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/aspect-ratio'),
  ],
}