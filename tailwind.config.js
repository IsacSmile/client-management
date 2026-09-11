/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#212529',      // headings/primary text
          nav: '#343a40',       // nav/primary buttons
          secondary: '#495057', // secondary text
          muted: '#6c757d',     // muted text
          icon: '#adb5bd',      // icons/borders
          border: '#dee2e6',    // borders/dividers
          bg: '#f8f9fa',        // main bg
          surface: '#e9ecef',   // secondary bg
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        md: '8px',
        lg: '10px',
        sm: '6px',
      }
    },
  },
  plugins: [],
};
