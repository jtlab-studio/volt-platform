export const colors = {
  brand: {
    primary: '#252525',
    secondary: '#ff9800',
    tertiary: '#ff5722',
    alternate: {
      light: '#e0e3e7',
      dark: '#1e1e1e',
    },
  },
  
  text: {
    primary: {
      light: '#121212',
      dark: '#f1f4f8',
    },
    secondary: {
      light: '#14181b',
      dark: '#ffffff',
    },
  },
  
  background: {
    primary: {
      light: '#ffffff',
      dark: '#121212',
    },
    secondary: {
      light: '#f1f4f8',
      dark: '#14181b',
    },
  },
  
  accent: {
    blue: '#2196f3',
    cyan: '#00bcd4',
    teal: '#26a69a',
    gray: {
      light: '#ccffffff',
      dark: '#262626',
    },
  },
  
  semantic: {
    success: '#249689',
    error: '#dc143c',
    warning: '#fce62f',
    info: '#ffffff',
  },
  
  glass: {
    light: 'rgba(255, 255, 255, 0.2)',
    dark: 'rgba(30, 30, 30, 0.4)',
  },
} as const;
