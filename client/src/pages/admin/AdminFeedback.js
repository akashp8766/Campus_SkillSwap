import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Rating,
  Pagination
} from '@mui/material';
import {
  Search,
  Delete,
  Visibility,
  RateReview
} from '@mui/icons-material';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';
import PageLayout from '../../components/layout/PageLayout';

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  useEffect(() => {
    loadFeedback();
  }, [page]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const response = await adminService.getFeedback({
        page,
        limit: 10
      });
      setFeedback(response.data.feedback);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error loading feedback:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async () => {
    if (!selectedFeedback) return;

    try {
      await adminService.deleteFeedback(selectedFeedback._id);
      toast.success('Feedback deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedFeedback(null);
      loadFeedback();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('Failed to delete feedback');
    }
  };

  const openDeleteDialog = (feedbackItem) => {
    setSelectedFeedback(feedbackItem);
    setDeleteDialogOpen(true);
  };

  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ p: 0 }}>
        <Typography variant="h4" gutterBottom>
          Feedback Management
        </Typography>

      {/* Feedback Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Reviewer</TableCell>
                  <TableCell>Reviewee</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Skill Category</TableCell>
                  <TableCell>Comment</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : feedback.length > 0 ? (
                  feedback.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2 }}>
                            {item.reviewer?.name?.charAt(0).toUpperCase() || 'A'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {item.reviewer?.name || 'Anonymous'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.reviewer?.studentId || ''}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2 }}>
                            {item.reviewee?.name?.charAt(0).toUpperCase() || 'A'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {item.reviewee?.name || 'Unknown'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.reviewee?.studentId || ''}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Rating value={item.rating} readOnly size="small" />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {item.rating}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={item.skillCategory} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200 }}>
                          {item.comment || 'No comment'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => openDeleteDialog(item)}
                          title="Delete Feedback"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary">
                        No feedback found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Delete Feedback Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Feedback</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. The feedback will be permanently deleted.
          </Alert>
          {selectedFeedback && (
            <Box>
              <Typography gutterBottom>
                Are you sure you want to delete this feedback?
              </Typography>
              <Card variant="outlined" sx={{ p: 2, mt: 2 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Rating value={selectedFeedback.rating} readOnly size="small" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {selectedFeedback.rating}/5
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Skill: {selectedFeedback.skillCategory}
                </Typography>
                {selectedFeedback.comment && (
                  <Typography variant="body2">
                    "{selectedFeedback.comment}"
                  </Typography>
                )}
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteFeedback}
          >
            Delete Feedback
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </PageLayout>
  );
};

export default AdminFeedback;
