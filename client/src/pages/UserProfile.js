import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Rating,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Person,
  School,
  Psychology,
  Build,
  Star,
  TrendingUp
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { userService, feedbackService } from '../services/api';
import toast from 'react-hot-toast';
import PageLayout from '../components/layout/PageLayout';

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [userRes, feedbackRes, summaryRes] = await Promise.all([
        userService.getUser(userId),
        feedbackService.getUserFeedback(userId),
        feedbackService.getFeedbackSummary(userId)
      ]);

      setUser(userRes.data.user);
      setFeedback(feedbackRes.data.feedback);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">
            User not found
          </Alert>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Profile Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <Avatar sx={{ width: 80, height: 80, mr: 3 }}>
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box flexGrow={1}>
              <Typography variant="h4" gutterBottom>
                {user.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {user.studentId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
            <Box textAlign="right">
              <Box display="flex" alignItems="center" mb={1}>
                <Rating value={user.averageRating || 0} readOnly />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ({user.totalRatings || 0} ratings)
                </Typography>
              </Box>
              <Typography variant="h6" color="primary">
                {user.reputation || 0} reputation
              </Typography>
            </Box>
          </Box>

          {user.bio && (
            <Typography variant="body1" paragraph>
              {user.bio}
            </Typography>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Skills Offered */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Skills Offered
              </Typography>
              {user.skillsOffered && user.skillsOffered.length > 0 ? (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {user.skillsOffered.map((skill, index) => (
                    <Chip key={index} label={skill} color="primary" />
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No skills offered yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Skills Looking For */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Skills Looking For
              </Typography>
              {user.skillsLookingFor && user.skillsLookingFor.length > 0 ? (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {user.skillsLookingFor.map((skill, index) => (
                    <Chip key={index} label={skill} color="secondary" />
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No skills specified yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Feedback Summary */}
        {summary?.summary && summary.summary.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Feedback by Skill Category
                </Typography>
                <Grid container spacing={2}>
                  {summary.summary.map((category, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {category.skillCategory}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Rating value={category.averageRating} readOnly size="small" />
                            <Typography variant="body2">
                              {category.averageRating}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {category.count} review{category.count !== 1 ? 's' : ''}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Recent Feedback */}
        {feedback.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Feedback (Top 5)
                </Typography>
                {feedback.slice(0, 5).map((item, index) => (
                  <Box key={index} mb={2} p={2} sx={{ bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Box display="flex" alignItems="center" mb={1} gap={2}>
                      <Avatar sx={{ width: 40, height: 40 }}>
                        {item.reviewer?.name?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                      <Box flexGrow={1}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {item.reviewer?.name || 'Unknown User'}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Rating value={item.rating} readOnly size="small" />
                          <Typography variant="body2" color="primary" fontWeight={600}>
                            {item.rating}.0 / 5.0
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    {item.comment && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                        "{item.comment.length > 200 ? item.comment.substring(0, 200) + '...' : item.comment}"
                      </Typography>
                    )}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
      </Container>
    </PageLayout>
  );
};

export default UserProfile;
