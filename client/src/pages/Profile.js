import React, { useState, useEffect } from 'react';
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
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import {
  Person,
  School,
  Psychology,
  Build,
  Edit,
  Save,
  Cancel
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import PageLayout from '../components/layout/PageLayout';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [skillsOffered, setSkillsOffered] = useState([]);
  const [skillsLookingFor, setSkillsLookingFor] = useState([]);
  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillLooking, setNewSkillLooking] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm();

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (user && user.id) {
        try {
          setInitialLoading(true);
          const response = await userService.getUser(user.id);
          const userData = response.data.user;
          
          // Update local state with fresh data from server
          setSkillsOffered(userData.skillsOffered || []);
          setSkillsLookingFor(userData.skillsLookingFor || []);
          reset({
            name: userData.name,
            bio: userData.bio || ''
          });
          
          // Update context if needed
          if (JSON.stringify(userData) !== JSON.stringify(user)) {
            updateUser(userData);
          }
        } catch (error) {
          console.error('Error loading profile:', error);
          toast.error('Failed to load profile data');
        } finally {
          setInitialLoading(false);
        }
      }
    };
    
    loadProfile();
  }, []);

  // Update form when user data changes
  useEffect(() => {
    if (user && !initialLoading) {
      setSkillsOffered(user.skillsOffered || []);
      setSkillsLookingFor(user.skillsLookingFor || []);
      reset({
        name: user.name,
        bio: user.bio || ''
      });
    }
  }, [user, reset, initialLoading]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Ensure we have a user ID
      const userId = user.id || user._id;
      if (!userId) {
        toast.error('User ID not found. Please try logging in again.');
        return;
      }
      
      console.log('Updating profile for user:', userId);
      console.log('Skills being saved:', {
        skillsOffered,
        skillsLookingFor
      });
      
      const response = await userService.updateProfile(userId, {
        ...data,
        skillsOffered,
        skillsLookingFor
      });

      console.log('Profile update response:', response.data);
      
      // Update the user context with the new data
      updateUser(response.data.user);
      
      // Also update local state to match
      setSkillsOffered(response.data.user.skillsOffered || []);
      setSkillsLookingFor(response.data.user.skillsLookingFor || []);
      
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = (type) => {
    if (type === 'offered') {
      if (!newSkillOffered.trim()) return;
      setSkillsOffered([...skillsOffered, newSkillOffered.trim()]);
      setNewSkillOffered('');
    } else if (type === 'looking') {
      if (!newSkillLooking.trim()) return;
      setSkillsLookingFor([...skillsLookingFor, newSkillLooking.trim()]);
      setNewSkillLooking('');
    }
  };

  const removeSkill = (type, index) => {
    if (type === 'offered') {
      setSkillsOffered(skillsOffered.filter((_, i) => i !== index));
    } else if (type === 'looking') {
      setSkillsLookingFor(skillsLookingFor.filter((_, i) => i !== index));
    }
  };

  const handleKeyPress = (e, type) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(type);
    }
  };

  if (!user || initialLoading) {
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
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>

      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <Avatar sx={{ width: 80, height: 80, mr: 3 }}>
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box flexGrow={1}>
              <Typography variant="h5" gutterBottom>
                {user.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {user.studentId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
            <Button
              variant={editing ? 'outlined' : 'contained'}
              startIcon={editing ? <Cancel /> : <Edit />}
              onClick={() => {
                if (editing) {
                  reset();
                  setSkillsOffered(user.skillsOffered || []);
                  setSkillsLookingFor(user.skillsLookingFor || []);
                  setNewSkillOffered('');
                  setNewSkillLooking('');
                }
                setEditing(!editing);
              }}
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    }
                  })}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  disabled={!editing}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Student ID"
                  value={user.studentId}
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <School />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Bio"
                  placeholder="Tell us about yourself..."
                  {...register('bio', {
                    maxLength: {
                      value: 500,
                      message: 'Bio cannot exceed 500 characters'
                    }
                  })}
                  error={!!errors.bio}
                  helperText={errors.bio?.message || 'Brief description about yourself'}
                  disabled={!editing}
                />
              </Grid>

              {/* Skills Offered */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Skills I Can Offer
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mb={2} minHeight="40px">
                  {skillsOffered.length > 0 ? (
                    skillsOffered.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        onDelete={editing ? () => removeSkill('offered', index) : undefined}
                        color="primary"
                        variant="outlined"
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 1 }}>
                      {editing ? 'Add skills you can teach to others' : 'No skills added yet'}
                    </Typography>
                  )}
                </Box>
                {editing && (
                  <Box display="flex" gap={1}>
                    <TextField
                      fullWidth
                      placeholder="Add a skill you can teach..."
                      value={newSkillOffered}
                      onChange={(e) => setNewSkillOffered(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, 'offered')}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Build />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={() => addSkill('offered')}
                      disabled={!newSkillOffered.trim()}
                    >
                      Add
                    </Button>
                  </Box>
                )}
              </Grid>

              {/* Skills Looking For */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Skills I Want to Learn
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mb={2} minHeight="40px">
                  {skillsLookingFor.length > 0 ? (
                    skillsLookingFor.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        onDelete={editing ? () => removeSkill('looking', index) : undefined}
                        color="secondary"
                        variant="outlined"
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 1 }}>
                      {editing ? 'Add skills you want to learn' : 'No skills added yet'}
                    </Typography>
                  )}
                </Box>
                {editing && (
                  <Box display="flex" gap={1}>
                    <TextField
                      fullWidth
                      placeholder="Add a skill you want to learn..."
                      value={newSkillLooking}
                      onChange={(e) => setNewSkillLooking(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, 'looking')}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Psychology />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={() => addSkill('looking')}
                      disabled={!newSkillLooking.trim()}
                    >
                      Add
                    </Button>
                  </Box>
                )}
              </Grid>

              {/* Stats */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h4" color="primary">
                          {user.averageRating?.toFixed(1) || '0.0'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Average Rating
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h4" color="primary">
                          {user.totalRatings || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Ratings
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h4" color="primary">
                          {user.reputation || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Reputation Points
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>

              {editing && (
                <Grid item xs={12}>
                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        </CardContent>
      </Card>
      </Container>
    </PageLayout>
  );
};

export default Profile;
