import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Avatar,
  Rating,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  AdminPanelSettings,
  People,
  RateReview,
  TrendingUp,
  Chat,
  Delete,
  Visibility,
  Search,
  Warning
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import PageLayout from '../../components/layout/PageLayout';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [lowRatedUsers, setLowRatedUsers] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboard();
      setStatistics(response.data.statistics);
      setLowRatedUsers(response.data.lowRatedUsers);
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await adminService.deleteUser(selectedUser._id);
      toast.success('User deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const openDeleteDialog = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
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

  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ p: 0 }}>
        <Box display="flex" alignItems="center" mb={4}>
          <AdminPanelSettings sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4">
            Admin Dashboard
          </Typography>
        </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {statistics?.users?.total || 0}
                  </Typography>
                  <Typography color="text.secondary">Total Users</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {statistics?.users?.active || 0} active
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <RateReview color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {statistics?.feedback?.total || 0}
                  </Typography>
                  <Typography color="text.secondary">Total Feedback</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg: {statistics?.feedback?.averageRating || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Chat color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {statistics?.chats?.total || 0}
                  </Typography>
                  <Typography color="text.secondary">Active Chats</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {statistics?.chats?.totalMessages || 0} messages
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Low Rated Users Alert */}
      {lowRatedUsers.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Warning color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Users Requiring Attention
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              The following users have low ratings and may need review:
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Student ID</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Total Ratings</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lowRatedUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2 }}>
                            {user.name.charAt(0).toUpperCase()}
                          </Avatar>
                          {user.name}
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.studentId}</TableCell>
                      <TableCell>
                        <Rating value={user.averageRating} readOnly size="small" />
                        <Typography variant="body2">
                          {user.averageRating.toFixed(1)}
                        </Typography>
                      </TableCell>
                      <TableCell>{user.totalRatings}</TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => openDeleteDialog(user)}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="outlined"
                  startIcon={<People />}
                  onClick={() => window.location.href = '/admin/users'}
                >
                  Manage Users
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RateReview />}
                  onClick={() => window.location.href = '/admin/feedback'}
                >
                  Review Feedback
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<TrendingUp />}
                  onClick={() => {
                    // Generate and download report
                    toast('Report generation feature coming soon!', { icon: '📈' });
                  }}
                >
                  Generate Reports
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Platform Health
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">User Growth</Typography>
                  <Chip 
                    label={`+${statistics?.users?.newThisMonth || 0} this month`}
                    color="success"
                    size="small"
                  />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Friend Requests</Typography>
                  <Chip 
                    label={`${statistics?.friendRequests?.pending || 0} pending`}
                    color="warning"
                    size="small"
                  />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Average Rating</Typography>
                  <Chip 
                    label={statistics?.feedback?.averageRating?.toFixed(1) || '0.0'}
                    color="primary"
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. All user data, including messages, 
            feedback, and skill swaps will be permanently deleted.
          </Alert>
          {selectedUser && (
            <Typography>
              Are you sure you want to delete <strong>{selectedUser.name}</strong> 
              ({selectedUser.email})?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteUser}
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </PageLayout>
  );
};

export default AdminDashboard;
