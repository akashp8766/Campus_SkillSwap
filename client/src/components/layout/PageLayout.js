import React from 'react';
import { Box } from '@mui/material';

const PageLayout = ({ children }) => {
  return (
    <Box
      sx={{
        marginLeft: { xs: 0, md: '240px' }, // Offset for permanent drawer
        marginTop: '64px', // Offset for AppBar
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: '#f5f5f5',
        padding: { xs: 2, sm: 3 },
        overflowX: 'hidden'
      }}
    >
      {children}
    </Box>
  );
};

export default PageLayout;
