/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#FFEFD5',
        'primary-hover': '#FFE4B5',
        'primary-text': '#5D4037',
        'secondary': '#6B7280',
        'secondary-hover': '#4B5563',
        'background': '#FFFFFF',
        'surface': '#F9FAFB',
        'text-main': '#1F2937',
        'text-muted': '#6B7280',
        'border-color': '#E5E7EB',
      },
      fontFamily: {
        sans: [
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