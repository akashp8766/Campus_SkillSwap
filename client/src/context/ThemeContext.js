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
                primary: { main: '#1976d2' },
                secondary: { main: '#dc004e' },
                background: { default: '#f5f5f5', paper: '#ffffff' },
              }
            : {
                primary: { main: '#90caf9' },
                secondary: { main: '#f48fb1' },
                background: { default: '#121212', paper: '#1e1e1e' },
              }),
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
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