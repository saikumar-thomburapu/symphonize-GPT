/**
 * Symphonize Theme Configuration
 * 
 * This file stores all brand colors, spacing, and design tokens.
 * Update the colors here after extracting from symphonize.com website.
 */

export const theme = {
  // Brand Colors (TODO: Update with actual Symphonize colors)
  colors: {
    primary: {
      main: '#0695e4',      // Main brand color
      light: '#32b7f6',
      dark: '#027fd5',
      contrast: '#ffffff',   // Text color on primary background
    },
    secondary: {
      main: '#64748b',
      light: '#94a3b8',
      dark: '#475569',
      contrast: '#ffffff',
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // UI Colors
    background: {
      default: '#ffffff',
      paper: '#f8fafc',
      sidebar: '#f1f5f9',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
      disabled: '#cbd5e1',
    },
    border: {
      light: '#e2e8f0',
      main: '#cbd5e1',
      dark: '#94a3b8',
    },
    
    // Chat-specific colors
    chat: {
      userBubble: '#0ea5e9',
      userText: '#ffffff',
      assistantBubble: '#f1f5f9',
      assistantText: '#0f172a',
      inputBackground: '#ffffff',
      inputBorder: '#e2e8f0',
    },
  },
  
  // Typography
  typography: {
    fontFamily: {
      primary: "'Inter', system-ui, -apple-system, sans-serif",
      mono: "'Fira Code', 'Courier New', monospace",
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
  },
  
  // Border Radius
  borderRadius: {
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',  // Circular
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  
  // Breakpoints for responsive design
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },
  
  // Z-index layers
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    modal: 1030,
    popover: 1040,
    tooltip: 1050,
  },
  
  // Transition durations
  transitions: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
};

export default theme;
