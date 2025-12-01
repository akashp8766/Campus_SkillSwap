import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Rating,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Badge,
  Avatar,
  Popover,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider
} from '@mui/material';
import {
  Search,
  PersonAdd,
  Chat,
  Star,
  TrendingUp,
  People,
  Close
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { userService, friendService, chatService } from '../services/api';
import PageLayout from '../components/layout/PageLayout';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [popularSkills, setPopularSkills] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedSkills, setExpandedSkills] = useState([]);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);

  const performSearch = useCallback(async () => {
    try {
      const response = await userService.getUsers({ 
        search: searchTerm,
        limit: 100 
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    }
  }, [searchTerm]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (socket) {
      const handleDashboardNotification = (data) => {
        console.log('🔔 Dashboard notification received:', data);
        
        // Reload dashboard data when friend status changes
        if (['friend_accepted', 'friend_removed'].includes(data.type)) {
          loadDashboardData();
        }
      };

      socket.on('notification', handleDashboardNotification);

      return () => {
        socket.off('notification', handleDashboardNotification);
      };
    }
  }, [socket]);

  // Debounced search - searches as you type
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.trim()) {
        performSearch();
      } else {
        loadDashboardData();
      }
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(delaySearch);
  }, [searchTerm, performSearch]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load users and stats in parallel for faster loading
      const [usersRes, friendsRes, skillsRes] = await Promise.all([
        userService.getUsers({ limit: 100 }), // Load all 100 users
        friendService.getFriends(),
        userService.getPopularSkills()
      ]);

      setUsers(usersRes.data.users);
      setFriends(friendsRes.data.friends);
      setPopularSkills(skillsRes.data.popularSkills);
      
      // Load conversations separately (non-blocking)
      chatService.getConversations()
        .then(conversationsRes => setConversations(conversationsRes.data.conversations))
        .catch(err => console.error('Error loading conversations:', err));
        
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadDashboardData();
      return;
    }
    await performSearch();
  };

  const handleSendFriendRequest = async (userId) => {
    try {
      console.log('Sending friend request to user:', userId);
      await friendService.sendFriendRequest({ receiverId: userId });
      toast.success('Friend request sent!');
      loadDashboardData();
    } catch (error) {
      console.error('Friend request error:', error);
      console.error('Error response:', error.response?.data);
      const message = error.response?.data?.message || 'Failed to send friend request';
      toast.error(message);
    }
  };

  const handleShowMoreSkills = (event, skills) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setExpandedSkills(skills);
  };

  const handleCloseSkills = () => {
    setAnchorEl(null);
    setExpandedSkills([]);
  };

  const handleSkillClick = async (skillName) => {
    setSearchTerm(skillName);
    setTabValue(0); // Switch to Discover Users tab
    try {
      const response = await userService.getUsers({ 
        search: skillName,
        limit: 100 
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error filtering by skill:', error);
      toast.error('Failed to filter users');
    }
  };

  const handleUserCardClick = async (userId) => {
    try {
      const response = await userService.getUser(userId);
      setSelectedUserDetails(response.data.user);
      setUserDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
    }
  };

  const handleCloseUserDetails = () => {
    setUserDetailsOpen(false);
    setSelectedUserDetails(null);
  };

  const open = Boolean(anchorEl);

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageLayout>
      <Container maxWidth="xl">
        {/* Welcome Section */}
        <Box mb={4}>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.name}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover new skills and connect with fellow students
          </Typography>
        </Box>

      {/* Search Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              placeholder="Search for users or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{ minWidth: 120 }}
            >
              Search
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{friends.length}</Typography>
                  <Typography color="text.secondary">Friends</Typography>
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
                  <Typography variant="h4">{conversations.length}</Typography>
                  <Typography color="text.secondary">Conversations</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Star color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{user?.averageRating?.toFixed(1) || '0.0'}</Typography>
                  <Typography color="text.secondary">Average Rating</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{user?.reputation || 0}</Typography>
                  <Typography color="text.secondary">Reputation</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Discover Users" />
            <Tab label="Recent Conversations" />
            <Tab label="Popular Skills" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            All Users ({users.length})
          </Typography>
          <Grid container spacing={3}>
            {users.map((userItem) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={userItem._id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                    }
                  }}
                  onClick={() => handleUserCardClick(userItem._id)}
                >
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box mb={2}>
                      <Typography variant="h6" gutterBottom>
                        {userItem.name}
                      </Typography>
                    </Box>

                    <Box mb={2}>
                      <Rating 
                        value={userItem.averageRating || 0} 
                        readOnly 
                        size="small"
                        precision={0.1}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {userItem.averageRating?.toFixed(1) || '0.0'} ({userItem.totalRatings || 0} reviews)
                      </Typography>
                    </Box>

                    <Box mb={2} flexGrow={1}>
                      <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={600}>
                        Skills Offered:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {userItem.skillsOffered?.slice(0, 3).map((skill, index) => (
                          <Chip 
                            key={index} 
                            label={skill} 
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                        {userItem.skillsOffered?.length > 3 && (
                          <Chip 
                            label={`+${userItem.skillsOffered.length - 3} more`} 
                            size="small"
                            color="primary"
                            onClick={(e) => handleShowMoreSkills(e, userItem.skillsOffered)}
                            sx={{ cursor: 'pointer' }}
                          />
                        )}
                      </Box>
                    </Box>

                    {userItem.bio && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        mb={2}
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {userItem.bio}
                      </Typography>
                    )}

                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PersonAdd />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendFriendRequest(userItem._id);
                      }}
                      disabled={userItem._id === user?.id}
                    >
                      {userItem._id === user?.id ? 'You' : 'Send Request'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <List>
            {conversations.map((conversation) => (
              <ListItem key={conversation.chatId} divider>
                <ListItemAvatar>
                  <Badge
                    color="primary"
                    variant="dot"
                    invisible={conversation.unreadCount === 0}
                  >
                    <Avatar>
                      {conversation.friend.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={conversation.friend.name}
                  secondary={conversation.lastMessage?.content || 'No messages yet'}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => navigate('/chat')}>
                    <Chat />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {conversations.length === 0 && (
              <Alert severity="info">
                No conversations yet. Start by sending friend requests!
              </Alert>
            )}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={2}>
            {popularSkills.map((skill, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                    }
                  }}
                  onClick={() => handleSkillClick(skill._id)}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="h6">{skill._id}</Typography>
                      <Chip 
                        label={`${skill.count} users`} 
                        color="primary" 
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Card>

      {/* Popover for showing all skills */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseSkills}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        disableScrollLock
        PaperProps={{
          elevation: 8,
          sx: { 
            borderRadius: 2,
            minWidth: 280,
            maxWidth: 400,
            mt: 0.5
          }
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight={600} color="primary">
            All Skills
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={0.75} mt={1.5}>
            {expandedSkills.map((skill, index) => (
              <Chip 
                key={index} 
                label={skill} 
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      </Popover>

      {/* User Details Dialog */}
      <Dialog
        open={userDetailsOpen}
        onClose={handleCloseUserDetails}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">User Details</Typography>
            <IconButton onClick={handleCloseUserDetails}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedUserDetails && (
            <Box>
              {/* Profile Header */}
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    fontSize: '2rem',
                    bgcolor: 'primary.main',
                    mr: 2
                  }}
                >
                  {selectedUserDetails.name?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={600}>
                    {selectedUserDetails.name || 'Unknown User'}
                  </Typography>
                  {selectedUserDetails.averageRating > 0 && (
                    <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                      <Star fontSize="small" sx={{ color: '#ffc107' }} />
                      <Typography variant="body2" color="text.secondary">
                        {selectedUserDetails.averageRating.toFixed(1)} Rating
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Skills */}
              {selectedUserDetails.skillsOffered && selectedUserDetails.skillsOffered.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    SKILLS OFFERED
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedUserDetails.skillsOffered.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {selectedUserDetails.skillsWanted && selectedUserDetails.skillsWanted.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    SKILLS WANTED
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedUserDetails.skillsWanted.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        color="secondary"
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Feedback Stats */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  FEEDBACK
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                      <Typography variant="h4" color="primary">
                        {selectedUserDetails.feedbackCount || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Reviews
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                      <Typography variant="h4" color="warning.main">
                        {selectedUserDetails.averageRating ? selectedUserDetails.averageRating.toFixed(1) : 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Average Rating
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDetails} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      </Container>
    </PageLayout>
  );
};

export default Dashboard;
