import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Avatar,
  Rating,
  Grid,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Pagination,
  Paper
} from '@mui/material';
import {
  RateReview,
  Star
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { feedbackService } from '../services/api';
import toast from 'react-hot-toast';
import PageLayout from '../components/layout/PageLayout';
import { formatDistanceToNow } from 'date-fns';

const Feedback = () => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedComments, setExpandedComments] = useState({});
  const itemsPerPage = 25;

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [feedbackRes, summaryRes] = await Promise.all([
        feedbackService.getUserFeedback(user.id, { page, limit: itemsPerPage }),
        feedbackService.getFeedbackSummary(user.id)
      ]);

      setFeedback(feedbackRes.data.feedback);
      setSummary(summaryRes.data);
      setTotalPages(feedbackRes.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error loading feedback data:', error);
      toast.error('Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleComment = (feedbackId) => {
    setExpandedComments(prev => ({
      ...prev,
      [feedbackId]: !prev[feedbackId]
    }));
  };

  const truncateComment = (comment, feedbackId) => {
    if (!comment) return '';
    const isExpanded = expandedComments[feedbackId];
    if (comment.length <= 500 || isExpanded) {
      return comment;
    }
    return comment.substring(0, 500) + '...';
  };

  if (loading && page === 1) {
    return (
      <PageLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Feedback & Ratings
        </Typography>

        {/* Summary Cards - Only Average Rating and Total Reviews */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Star color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h4">
                      {summary?.ratingStats?.averageRating?.toFixed(1) || '0.0'}
                    </Typography>
                    <Typography color="text.secondary">Average Rating</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <RateReview color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h4">
                      {summary?.ratingStats?.totalRatings || 0}
                    </Typography>
                    <Typography color="text.secondary">Total Reviews</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Received Feedback - Full Width */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Received Feedback
            </Typography>
            
            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : feedback.length > 0 ? (
              <>
                <List>
                  {feedback.map((item, index) => (
                    <React.Fragment key={item._id || index}>
                      <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 56, height: 56 }}>
                            {item.reviewer?.name?.charAt(0).toUpperCase() || 'U'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box>
                              <Box display="flex" alignItems="center" gap={2} mb={1}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {item.reviewer?.name || 'Unknown User'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={2} mb={1}>
                                <Rating value={item.rating} readOnly size="medium" />
                                <Typography variant="body2" color="primary" fontWeight={600}>
                                  {item.rating}.0 / 5.0
                                </Typography>
                              </Box>
                            </Box>
                          }
                          secondary={
                            <Box mt={1}>
                              {item.comment && (
                                <Paper elevation={0} sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    {truncateComment(item.comment, item._id)}
                                  </Typography>
                                  {item.comment.length > 500 && (
                                    <Typography
                                      variant="body2"
                                      color="primary"
                                      sx={{ mt: 1, cursor: 'pointer', fontWeight: 600 }}
                                      onClick={() => toggleComment(item._id)}
                                    >
                                      {expandedComments[item._id] ? 'Show less' : 'Read more'}
                                    </Typography>
                                  )}
                                </Paper>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < feedback.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box display="flex" justifyContent="center" mt={4}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                )}
              </>
            ) : (
              <Alert severity="info">
                No feedback received yet. Start sharing skills to get rated!
              </Alert>
            )}
          </CardContent>
        </Card>
      </Container>
    </PageLayout>
  );
};

export default Feedback;
