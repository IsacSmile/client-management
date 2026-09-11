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
          dark: '#09090b',      // deep zinc headings/primary text
          nav: '#09090b',       // sleek obsidian sidebar background
          secondary: '#71717a', // clean secondary text
          muted: '#a1a1aa',     // muted captions
          icon: '#a1a1aa',      // icon color
          border: '#e4e4e7',    // subtle 1px border
          bg: '#fafafa',        // clean canvas background
          surface: '#f4f4f5',   // secondary surface / header bg
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
