import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button
} from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box textAlign="center">
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        
        <Card sx={{ mt: 4, mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              What would you like to do?
            </Typography>
            <Box display="flex" gap={2} justifyContent="center" mt={2}>
              <Button
                variant="contained"
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
              >
                Go Back
              </Button>
              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={() => navigate('/dashboard')}
              >
                Go Home
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default NotFound;
