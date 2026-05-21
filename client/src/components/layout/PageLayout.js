import React from 'react';
import { Box, useTheme } from '@mui/material';

const PageLayout = ({ children }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        marginLeft: { xs: 0, md: '240px' }, // Offset for permanent drawer
        marginTop: '64px', // Offset for AppBar
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: theme.palette.background.default,
        padding: { xs: 2, sm: 3 },
        overflowX: 'hidden'
      }}
    >
      {children}
    </Box>
  );
};

export default PageLayout;
