import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Chip,
  Rating,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  PersonAdd,
  Check,
  Close,
  Person,
  Message
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { friendService } from '../services/api';
import PageLayout from '../components/layout/PageLayout';
import toast from 'react-hot-toast';

const Friends = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [requestMessage, setRequestMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState(null);

  // Handle URL query params for tab selection
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      const tabIndex = parseInt(tab);
      if (tabIndex >= 0 && tabIndex <= 2) {
        setSelectedTab(tabIndex);
      }
    }
  }, [location.search]);

  useEffect(() => {
    loadData();
  }, []);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (socket) {
      const handleFriendNotification = (data) => {
        console.log('🔔 Friend notification received:', data);
        
        // Reload friend data when receiving friend-related notifications
        if (['friend_request', 'friend_accepted', 'friend_removed'].includes(data.type)) {
          loadData();
          
          // If on Friends page and it's a friend request, switch to requests tab
          if (data.type === 'friend_request') {
            setSelectedTab(1); // Switch to Friend Requests tab
          }
        }
      };

      socket.on('notification', handleFriendNotification);

      return () => {
        socket.off('notification', handleFriendNotification);
      };
    }
  }, [socket]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [friendsRes, requestsRes, suggestionsRes] = await Promise.all([
        friendService.getFriends(),
        friendService.getFriendRequests(),
        friendService.getFriendSuggestions()
      ]);

      setFriends(friendsRes.data.friends);
      setFriendRequests(requestsRes.data.requests);
      setSuggestions(suggestionsRes.data.suggestions);
    } catch (error) {
      console.error('Error loading friends data:', error);
      toast.error('Failed to load friends data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (userId) => {
    try {
      await friendService.sendFriendRequest({
        receiverId: userId,
        message: requestMessage
      });
      toast.success('Friend request sent!');
      setDialogOpen(false);
      setRequestMessage('');
      setSelectedUser(null);
      loadData();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send friend request';
      toast.error(message);
    }
  };

  const handleRespondToRequest = async (requestId, action) => {
    try {
      await friendService.respondToFriendRequest(requestId, action);
      toast.success(`Friend request ${action}ed!`);
      loadData();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to respond to friend request';
      toast.error(message);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      console.log('Attempting to remove friend - friendId:', friendId);
      console.log('Attempting to remove friend - friendId type:', typeof friendId);
      console.log('FriendToRemove object:', friendToRemove);
      
      await friendService.removeFriend(friendId);
      toast.success('Friend removed');
      setConfirmDialogOpen(false);
      setFriendToRemove(null);
      loadData();
    } catch (error) {
      console.error('Remove friend error:', error);
      console.error('Error response:', error.response);
      const message = error.response?.data?.message || 'Failed to remove friend';
      toast.error(message);
    }
  };

  const openConfirmDialog = (friend) => {
    setFriendToRemove(friend);
    setConfirmDialogOpen(true);
  };

  const handleChatClick = (friendId) => {
    navigate(`/chat?userId=${friendId}`);
  };

  const openRequestDialog = (user) => {
    setSelectedUser(user);
    setDialogOpen(true);
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
      <Container maxWidth="xl">
        <Typography variant="h4" gutterBottom>
          Friends
        </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Box display="flex" gap={2}>
          <Button
            variant={selectedTab === 0 ? 'contained' : 'outlined'}
            onClick={() => setSelectedTab(0)}
          >
            My Friends ({friends.length})
          </Button>
          <Button
            variant={selectedTab === 1 ? 'contained' : 'outlined'}
            onClick={() => setSelectedTab(1)}
          >
            Requests ({friendRequests.length})
          </Button>
          <Button
            variant={selectedTab === 2 ? 'contained' : 'outlined'}
            onClick={() => setSelectedTab(2)}
          >
            Suggestions ({suggestions.length})
          </Button>
        </Box>
      </Box>

      {/* My Friends */}
      {selectedTab === 0 && (
        <Grid container spacing={3}>
          {friends.map((friend) => (
            <Grid item xs={12} sm={6} md={4} key={friend._id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ mr: 2 }}>
                      {friend.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box flexGrow={1}>
                      <Typography variant="h6">{friend.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {friend.studentId}
                      </Typography>
                    </Box>
                  </Box>

                  <Box mb={2}>
                    <Rating 
                      value={friend.averageRating || 0} 
                      readOnly 
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary">
                      ({friend.totalRatings || 0} ratings)
                    </Typography>
                  </Box>

                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Skills:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {friend.skillsOffered?.slice(0, 3).map((skill, index) => (
                        <Chip key={index} label={skill} size="small" />
                      ))}
                      {friend.skillsOffered?.length > 3 && (
                        <Chip label={`+${friend.skillsOffered.length - 3}`} size="small" />
                      )}
                    </Box>
                  </Box>

                  <Box display="flex" gap={1}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Message />}
                      size="small"
                      onClick={() => handleChatClick(friend._id)}
                    >
                      Chat
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => openConfirmDialog(friend)}
                    >
                      Remove
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          
          {friends.length === 0 && (
            <Grid item xs={12}>
              <Alert severity="info">
                No friends yet. Check out the suggestions tab to find people to connect with!
              </Alert>
            </Grid>
          )}
        </Grid>
      )}

      {/* Friend Requests */}
      {selectedTab === 1 && (
        <List>
          {friendRequests.map((request) => (
            <ListItem key={request._id} divider>
              <ListItemAvatar>
                <Avatar>
                  {request.sender.name.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={request.sender.name}
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {request.sender.studentId}
                    </Typography>
                    {request.message && (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        "{request.message}"
                      </Typography>
                    )}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Box display="flex" gap={1}>
                  <IconButton
                    color="success"
                    onClick={() => handleRespondToRequest(request._id, 'accept')}
                  >
                    <Check />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleRespondToRequest(request._id, 'decline')}
                  >
                    <Close />
                  </IconButton>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          
          {friendRequests.length === 0 && (
            <Alert severity="info">
              No pending friend requests.
            </Alert>
          )}
        </List>
      )}

      {/* Suggestions */}
      {selectedTab === 2 && (
        <Grid container spacing={3}>
          {suggestions.map((suggestion) => (
            <Grid item xs={12} sm={6} md={4} key={suggestion._id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ mr: 2 }}>
                      {suggestion.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box flexGrow={1}>
                      <Typography variant="h6">{suggestion.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {suggestion.studentId}
                      </Typography>
                    </Box>
                  </Box>

                  <Box mb={2}>
                    <Rating 
                      value={suggestion.averageRating || 0} 
                      readOnly 
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary">
                      ({suggestion.totalRatings || 0} ratings)
                    </Typography>
                  </Box>

                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Skills Offered:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {suggestion.skillsOffered?.slice(0, 3).map((skill, index) => (
                        <Chip key={index} label={skill} size="small" />
                      ))}
                      {suggestion.skillsOffered?.length > 3 && (
                        <Chip label={`+${suggestion.skillsOffered.length - 3}`} size="small" />
                      )}
                    </Box>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<PersonAdd />}
                    onClick={() => openRequestDialog(suggestion)}
                  >
                    Send Friend Request
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
          
          {suggestions.length === 0 && (
            <Grid item xs={12}>
              <Alert severity="info">
                No suggestions available at the moment.
              </Alert>
            </Grid>
          )}
        </Grid>
      )}

      {/* Send Friend Request Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Friend Request</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box mb={2}>
              <Typography variant="h6">{selectedUser.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedUser.studentId}
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Message (Optional)"
            placeholder="Add a personal message..."
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            helperText="Let them know why you'd like to connect"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => handleSendFriendRequest(selectedUser._id)}
          >
            Send Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Remove Friend Dialog */}
      <Dialog 
        open={confirmDialogOpen} 
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="xs" 
        fullWidth
      >
        <DialogTitle>Remove Friend?</DialogTitle>
        <DialogContent>
          {friendToRemove && (
            <Typography>
              Are you sure you want to remove <strong>{friendToRemove.name}</strong> from your friends list?
              This action cannot be undone.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setConfirmDialogOpen(false);
            setFriendToRemove(null);
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (friendToRemove && friendToRemove._id) {
                handleRemoveFriend(friendToRemove._id);
              } else {
                console.error('Friend to remove is null or missing _id');
                toast.error('Unable to remove friend - invalid data');
                setConfirmDialogOpen(false);
              }
            }}
          >
            Remove Friend
          </Button>
        </DialogActions>
      </Dialog>

      </Container>
    </PageLayout>
  );
};

export default Friends;
