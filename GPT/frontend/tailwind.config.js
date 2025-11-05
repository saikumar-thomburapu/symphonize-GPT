/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Official Symphonize Brand Colors
        primary: {
          50: '#e8f2fc',
          100: '#d1e5f9',
          200: '#a3cbf3',
          300: '#76b1ed',
          400: '#66c5fb',  // Official Light Blue
          500: '#3e78c2',  // Official Primary Blue
          600: '#325fa0',
          700: '#26467e',
          800: '#1a2e5c',
          900: '#0e173a',
        },
        // Official Symphonize Dark
        dark: {
          bg: '#011628',           // Official Dark Background
          bgSecondary: '#021e35',   // Slightly lighter
          bgTertiary: '#032a42',    // Card backgrounds
          bgHover: '#043850',       // Hover states
          text: '#FFFFFF',          // Official White
          textSecondary: '#b3d4f7', // Light blue tint for secondary text
          textMuted: '#7fa3d1',     // Muted text
          border: '#043850',        // Border color
          borderLight: '#05496b',   // Lighter border
        },
        // Keep white defined
        white: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(62, 120, 194, 0.3)',
        'glow-lg': '0 0 30px rgba(62, 120, 194, 0.4)',
        'glow-xl': '0 0 40px rgba(102, 197, 251, 0.5)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #3e78c2 0%, #66c5fb 100%)',
        'gradient-primary-hover': 'linear-gradient(135deg, #325fa0 0%, #3e78c2 100%)',
        'gradient-dark': 'linear-gradient(135deg, #032a42 0%, #021e35 100%)',
      },
    },
  },
  plugins: [],
}










// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     './pages/**/*.{js,ts,jsx,tsx,mdx}',
//     './components/**/*.{js,ts,jsx,tsx,mdx}',
//     './app/**/*.{js,ts,jsx,tsx,mdx}',
//   ],
//   theme: {
//     extend: {
//       colors: {
//         // Symphonize Brand Colors (from your logo)
//         primary: {
//           50: '#e6f4fd',
//           100: '#cce9fb',
//           200: '#99d3f7',
//           300: '#66bdf3',  
//           400: '#32b7f6',  // Light blue
//           500: '#0695e4',  // Main brand blue
//           600: '#027fd5',  // Dark blue
//           700: '#016ac9',  
//           800: '#015aa8',
//           900: '#014a87',
//         },
//         // Dark Theme Colors (Symphonize inspired)
//         dark: {
//           bg: '#0a0e1a',           // Main dark background (deepest)
//           bgSecondary: '#111827',   // Secondary dark background
//           bgTertiary: '#1f2937',    // Tertiary (cards, inputs)
//           bgHover: '#374151',       // Hover states
//           text: '#f9fafb',          // Main text (almost white)
//           textSecondary: '#9ca3af', // Secondary text (gray)
//           textMuted: '#6b7280',     // Muted text
//           border: '#374151',        // Border color
//           borderLight: '#4b5563',   // Lighter border
//         },
//       },
//       fontFamily: {
//         sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
//         mono: ['Fira Code', 'monospace'],
//       },
//       boxShadow: {
//         'glow': '0 0 20px rgba(6, 149, 228, 0.2)',
//         'glow-lg': '0 0 30px rgba(6, 149, 228, 0.3)',
//         'glow-xl': '0 0 40px rgba(6, 149, 228, 0.4)',
//       },
//       backgroundImage: {
//         'gradient-primary': 'linear-gradient(135deg, #32b7f6 0%, #0695e4 100%)',
//         'gradient-dark': 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
//       },
//     },
//   },
//   plugins: [],
// }


