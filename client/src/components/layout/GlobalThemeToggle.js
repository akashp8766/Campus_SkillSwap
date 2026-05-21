import React from 'react';
import { Fab, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeContext } from '../../context/ThemeContext';

const GlobalThemeToggle = () => {
  const { mode, toggleTheme } = useThemeContext();

  return (
    <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
      <Fab
        size="medium"
        color="primary"
        aria-label="toggle theme"
        onClick={toggleTheme}
        sx={{
          position: 'fixed',
          right: 92,
          bottom: 16,
          zIndex: 1600,
          boxShadow: 4,
        }}
      >
        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
      </Fab>
    </Tooltip>
  );
};

export default GlobalThemeToggle;
