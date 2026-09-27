import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback preventing crashes if context is missing
    return { mode: 'light', toggleTheme: () => {} };
  }
  return context;
};

export const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                primary: { main: '#4F46E5', light: '#818CF8', dark: '#3730A3' },
                secondary: { main: '#10B981', light: '#34D399', dark: '#047857' },
                background: { default: '#F8FAFC', paper: '#FFFFFF' },
                text: { primary: '#0F172A', secondary: '#475569' },
              }
            : {
                primary: { main: '#818CF8', light: '#A5B4FC', dark: '#4F46E5' },
                secondary: { main: '#34D399', light: '#6EE7B7', dark: '#10B981' },
                background: { default: '#0F172A', paper: '#1E293B' },
                text: { primary: '#F8FAFC', secondary: '#94A3B8' },
              }),
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: { fontSize: '2.5rem', fontWeight: 600, lineHeight: 1.2 },
          h2: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.3 },
          h3: { fontSize: '1.75rem', fontWeight: 500, lineHeight: 1.4 },
          h4: { fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.4 },
          h5: { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.5 },
          h6: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.6 },
          body1: { fontSize: '1rem', lineHeight: 1.6 },
          body2: { fontSize: '0.875rem', lineHeight: 1.6 },
        },
        shape: { borderRadius: 8 },
        spacing: 8,
        components: {
          MuiButton: {
            styleOverrides: {
              root: { textTransform: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 500 },
              contained: {
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                '&:hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.15)' },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: mode === 'light' ? '0 2px 8px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.5)',
                borderRadius: 12,
                '&:hover': {
                  boxShadow: mode === 'light' ? '0 4px 16px rgba(0,0,0,0.15)' : '0 4px 16px rgba(0,0,0,0.7)',
                  transition: 'box-shadow 0.3s ease-in-out',
                },
              },
            },
          },
          MuiTextField: { styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: 8 } } } },
          MuiChip: { styleOverrides: { root: { borderRadius: 16 } } },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};