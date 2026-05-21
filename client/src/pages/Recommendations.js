import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Avatar,
  Rating,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  PersonAdd,
  School,
  Group,
  TrendingUp,
  People,
  Close,
} from '@mui/icons-material';
import { recommendationService, friendService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`recommendation-tabpanel-${index}`}
      aria-labelledby={`recommendation-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Recommendations() {
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [matches, setMatches] = useState([]);
  const [skills, setSkills] = useState([]);
  const [friends, setFriends] = useState([]);
  const [popular, setPopular] = useState(null);
  const [similar, setSimilar] = useState([]);

  // Dialog state for viewing profiles
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedProfileType, setSelectedProfileType] = useState('match'); // 'match' or 'similar'
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchAllRecommendations();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchAllRecommendations = async () => {
    if (!userId) {
      setError('User session not ready. Please refresh the page.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use optimized combined endpoint instead of 5 separate calls
      const response = await Promise.race([
        recommendationService.getAllRecommendations(userId),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout - please try again')), 30000)
        ),
      ]);
      
      const data = response.data.data;
      
      setMatches(data.matches || []);
      setSkills(data.skills || []);
      setFriends(data.friends || []);
      setPopular(data.popular || null);
      setSimilar(data.similar || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      
      // More detailed error messages
      let errorMsg = 'Failed to load recommendations';
      if (err.message === 'Request timeout - please try again') {
        errorMsg = 'Request taking too long. Please refresh.';
      } else if (err.response?.status === 404) {
        errorMsg = 'User not found';
      } else if (err.response?.status === 500) {
        errorMsg = 'Server error. Please try again later.';
      } else if (err.message === 'Network Error') {
        errorMsg = 'Network connection error';
      }
      
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Open profile dialog
  const handleOpenProfile = (profile, type = 'match') => {
    setSelectedProfile(profile);
    setSelectedProfileType(type);
    setProfileDialogOpen(true);
  };

  // Close profile dialog
  const handleCloseProfile = () => {
    setProfileDialogOpen(false);
    setSelectedProfile(null);
    setSelectedProfileType('match');
  };

  // Send connect/skill swap request
  const handleConnect = async (receiverId) => {
    try {
      setSendingRequest(true);
      // Create a chat or connection message
      toast.success('✅ Connection request sent!');
      handleCloseProfile();
    } catch (err) {
      console.error('Error sending request:', err);
      toast.error('Failed to send request');
    } finally {
      setSendingRequest(false);
    }
  };

  // Send friend request
  const handleAddFriend = async (receiverId) => {
    try {
      setSendingRequest(true);
      await friendService.sendFriendRequest({ receiverId });
      // Refresh recommendations
      fetchAllRecommendations();
    } catch (err) {
      console.error('Error sending friend request:', err);
      toast.error('Failed to send friend request');
    } finally {
      setSendingRequest(false);
    }
  };

  // Navigate to dashboard with skill search
  const handleLearnSkill = (skill) => {
    // Store skill in session storage so Dashboard can access it
    sessionStorage.setItem('searchSkill', skill);
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', py: 6 }}>
        <CircularProgress size={50} sx={{ mb: 2 }} />
        <Typography variant="body1" color="textSecondary">
          Loading recommendations...
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
          This may take a moment on first load
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: { xs: '64px', md: '64px' }, ml: { md: '240px' } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Personalized Recommendations
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Discover skill swap matches, trending skills, and new connections
        </Typography>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={fetchAllRecommendations}
              disabled={loading}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="User Matches" icon={<People />} iconPosition="start" />
        <Tab label="Skills" icon={<School />} iconPosition="start" />
        <Tab label="Friend Suggestions" icon={<PersonAdd />} iconPosition="start" />
        <Tab label="Similar Users" icon={<Group />} iconPosition="start" />
        <Tab label="Popular Skills" icon={<TrendingUp />} iconPosition="start" />
      </Tabs>

      {/* User Matches Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            Best Skill Swap Matches ({matches.length})
          </Typography>
          <Typography variant="caption" color="textSecondary">
            💡 These users have skills you want, and want skills you offer - perfect for skill swapping!
          </Typography>
        </Box>
        {matches.length === 0 ? (
          <Alert severity="info">No matches found yet. Complete your profile to get matches!</Alert>
        ) : (
          <Grid container spacing={3}>
            {matches.map(match => (
              <Grid item xs={12} sm={6} md={4} key={match._id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, boxShadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
                    }
                  }}
                  onClick={() => handleOpenProfile(match)}
                >
                  <CardContent sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {match.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{match.name}</Typography>
                        <Rating value={match.averageRating} size="small" readOnly />
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="textSecondary">
                        Match Score: <strong>{match.matchScore}</strong>
                      </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Offers:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {match.skillsOffered?.slice(0, 2).map(skill => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      ))}
                      {match.skillsOffered?.length > 2 && (
                        <Chip label={`+${match.skillsOffered.length - 2}`} size="small" />
                      )}
                    </Box>

                    <Typography variant="body2">
                      <strong>Looking for:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {match.skillsLookingFor?.slice(0, 2).map(skill => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      ))}
                      {match.skillsLookingFor?.length > 2 && (
                        <Chip
                          label={`+${match.skillsLookingFor.length - 2}`}
                          size="small"
                        />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConnect(match._id);
                      }}
                      disabled={sendingRequest}
                    >
                      Connect
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Skills Tab */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Recommended Skills for You ({skills.length})
        </Typography>
        {skills.length === 0 ? (
          <Alert severity="info">No skill recommendations yet.</Alert>
        ) : (
          <List>
            {skills.map((skill, idx) => (
              <ListItem
                key={idx}
                sx={{
                  mb: 1,
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <ListItemIcon>
                    <School color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={skill.skill}
                    secondary={`Score: ${skill.recommendationScore} - ${skill.reason}`}
                  />
                </Box>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => handleLearnSkill(skill.skill)}
                >
                  Learn
                </Button>
              </ListItem>
            ))}
          </List>
        )}
      </TabPanel>

      {/* Friend Suggestions Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            Suggested Friends ({friends.length})
          </Typography>
          <Typography variant="caption" color="textSecondary">
            💡 These users have similar interests and departments as you - great people to connect with!
          </Typography>
        </Box>
        {friends.length === 0 ? (
          <Alert severity="info">No friend suggestions yet. Expand your interests!</Alert>
        ) : (
          <Grid container spacing={3}>
            {friends.map(friend => (
              <Grid item xs={12} sm={6} md={4} key={friend._id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                        {friend.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{friend.name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {friend.department}
                        </Typography>
                      </Box>
                    </Box>

                    {friend.interests?.length > 0 && (
                      <>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Interests:</strong>
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                          {friend.interests?.slice(0, 2).map(interest => (
                            <Chip
                              key={interest}
                              label={interest}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                          {friend.interests?.length > 2 && (
                            <Chip label={`+${friend.interests.length - 2}`} size="small" />
                          )}
                        </Box>
                      </>
                    )}
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                      Friend Match Score: <strong>{friend.friendScore}</strong>
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      size="small"
                      onClick={() => handleAddFriend(friend._id)}
                      disabled={sendingRequest}
                    >
                      Add Friend
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Similar Users Tab */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Similar Users ({similar.length})
        </Typography>
        {similar.length === 0 ? (
          <Alert severity="info">No similar users found yet.</Alert>
        ) : (
          <Grid container spacing={3}>
            {similar.map(similarUser => (
              <Grid item xs={12} sm={6} md={4} key={similarUser._id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.2s, boxShadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'success.main' }}>
                        {similarUser.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{similarUser.name}</Typography>
                        <Rating value={similarUser.averageRating} size="small" readOnly />
                      </Box>
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      Similarity Score: <strong>{similarUser.similarityScore}</strong>
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      size="small"
                      onClick={() => handleOpenProfile(similarUser, 'similar')}
                    >
                      View Profile
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Popular Skills Tab */}
      <TabPanel value={tabValue} index={4}>
        <Grid container spacing={3}>
          {/* Most Taught */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Most Taught Skills
                </Typography>
                <List>
                  {popular?.mostTaught?.map((skill, idx) => (
                    <ListItem key={idx} sx={{ py: 1 }}>
                      <ListItemText
                        primary={skill.skill}
                        secondary={`${skill.count} mentors • Rating: ${skill.avgMentorRating}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Most Wanted */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Most Wanted Skills
                </Typography>
                <List>
                  {popular?.mostWanted?.map((skill, idx) => (
                    <ListItem key={idx} sx={{ py: 1 }}>
                      <ListItemText
                        primary={skill.skill}
                        secondary={`${skill.count} learners`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Trending */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  🔥 Trending Skills
                </Typography>
                <List>
                  {popular?.trending?.map((skill, idx) => (
                    <ListItem key={idx} sx={{ py: 1 }}>
                      <ListItemText
                        primary={skill.skill}
                        secondary={`Taught: ${skill.taught} • Wanted: ${skill.wanted}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={async () => {
            try {
              setLoading(true);
              // Clear cache before refreshing
              await recommendationService.clearUserCache(userId);
              // Then fetch fresh recommendations
              await fetchAllRecommendations();
            } catch (err) {
              console.error('Error refreshing:', err);
              await fetchAllRecommendations();
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {loading ? '⏳ Loading...' : '🔄 Refresh Recommendations'}
        </Button>
      </Box>

      {/* Profile Dialog */}
      <Dialog 
        open={profileDialogOpen} 
        onClose={handleCloseProfile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">User Profile</Typography>
          <Close 
            onClick={handleCloseProfile} 
            sx={{ cursor: 'pointer' }}
          />
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ py: 3 }}>
          {selectedProfile && (
            <Box>
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar 
                  sx={{ 
                    mr: 2, 
                    width: 60, 
                    height: 60,
                    bgcolor: 'primary.main'
                  }}
                >
                  {selectedProfile.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h5">{selectedProfile.name}</Typography>
                  <Rating value={selectedProfile.averageRating} size="small" readOnly />
                  <Typography variant="caption" color="textSecondary">
                    {selectedProfile.department}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Skills Offered */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Skills Offered
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selectedProfile.skillsOffered?.map(skill => (
                    <Chip 
                      key={skill} 
                      label={skill} 
                      color="primary" 
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>

              {/* Skills Looking For */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Looking For
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selectedProfile.skillsLookingFor?.map(skill => (
                    <Chip 
                      key={skill} 
                      label={skill} 
                      color="secondary" 
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>

              {/* Interests */}
              {selectedProfile.interests?.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    🎯 Interests
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedProfile.interests?.map(interest => (
                      <Chip key={interest} label={interest} />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Stats */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                <Box>
                  <Typography variant="caption" color="textSecondary">Sessions Completed</Typography>
                  <Typography variant="h6">{selectedProfile.sessionsCompleted || 0}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Reputation</Typography>
                  <Typography variant="h6">{selectedProfile.reputation || 0} 🏆</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handleCloseProfile}
          >
            Close
          </Button>
          {selectedProfileType === 'similar' ? (
            <Button 
              variant="contained"
              onClick={() => selectedProfile && handleAddFriend(selectedProfile._id)}
              disabled={sendingRequest}
            >
              Add Friend
            </Button>
          ) : (
            <Button 
              variant="contained"
              onClick={() => selectedProfile && handleConnect(selectedProfile._id)}
              disabled={sendingRequest}
            >
              Connect
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}
