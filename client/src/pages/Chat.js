import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EmojiPicker from 'emoji-picker-react';
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  IconButton,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Alert,
  Paper,
  InputAdornment,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Grid,
  Divider,
  Popover
} from '@mui/material';
import {
  Send,
  ArrowBack,
  Chat as ChatIcon,
  MoreVert,
  Menu as MenuIcon,
  Close,
  Person,
  School,
  Star,
  EmojiEmotions,
  Timer,
  Stop,
  PlayArrow,
  RateReview
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { chatService, friendService, sessionService, feedbackService } from '../services/api';
import PageLayout from '../components/layout/PageLayout';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const Chat = () => {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, connected, sendMessage, sendTypingIndicator } = useSocket();
  
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);
  
  // Session-related states
  const [activeSession, setActiveSession] = useState(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [canStartNewSession, setCanStartNewSession] = useState(true);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [sessionRequestDialogOpen, setSessionRequestDialogOpen] = useState(false);
  const [sessionRequestData, setSessionRequestData] = useState(null);
  const [endSessionRequestData, setEndSessionRequestData] = useState(null);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const sessionTimerRef = useRef(null);

  useEffect(() => {
    loadFriends();
  }, []);

  useEffect(() => {
    if (friendId && friends.length > 0) {
      const friend = friends.find(f => f._id === friendId);
      if (friend) {
        setSelectedFriend(friend);
        loadChatMessages(friendId);
      }
    }
  }, [friendId, friends]);

  // Reload messages when navigating back to chat page with selected friend
  useEffect(() => {
    if (selectedFriend && selectedFriend._id) {
      console.log('📥 Reloading messages for:', selectedFriend.name);
      loadChatMessages(selectedFriend._id);
    }
  }, [selectedFriend?._id]);

  useEffect(() => {
    if (socket) {
      // Listen for incoming messages
      socket.on('receiveMessage', handleReceiveMessage);
      socket.on('userTyping', handleUserTyping);
      socket.on('sessionStarted', handleSessionStarted);
      socket.on('sessionEndedNotification', handleSessionEndedNotification);
      
      // Listen for session_request notification
      socket.on('notification', handleSocketNotification);
      
      return () => {
        socket.off('receiveMessage', handleReceiveMessage);
        socket.off('userTyping', handleUserTyping);
        socket.off('sessionStarted', handleSessionStarted);
        socket.off('sessionEndedNotification', handleSessionEndedNotification);
        socket.off('notification', handleSocketNotification);
      };
    }
  }, [socket, selectedFriend]);

  // Load session data when friend is selected
  useEffect(() => {
    if (selectedFriend && selectedFriend._id) {
      loadSessionData(selectedFriend._id);
    }
  }, [selectedFriend?._id]);

  // Session timer
  useEffect(() => {
    if (activeSession && activeSession.status === 'active') {
      sessionTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((new Date() - new Date(activeSession.startTime)) / 1000);
        setSessionTime(elapsed);
      }, 1000);

      return () => {
        if (sessionTimerRef.current) {
          clearInterval(sessionTimerRef.current);
        }
      };
    } else {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
      setSessionTime(0);
    }
  }, [activeSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadFriends = async () => {
    try {
      const response = await friendService.getFriends();
      setFriends(response.data.friends);
      setLoading(false);
    } catch (error) {
      console.error('Error loading friends:', error);
      toast.error('Failed to load friends');
      setLoading(false);
    }
  };

  const loadChatMessages = async (friendId) => {
    try {
      const response = await chatService.getChat(friendId);
      const chatMessages = response.data.chat?.messages || [];
      
      // Normalize message format - convert sender object to sender ID
      const normalizedMessages = chatMessages.map(msg => ({
        ...msg,
        sender: msg.sender?._id || msg.sender, // Extract ID if it's an object
        content: msg.content,
        timestamp: msg.timestamp,
        isRead: msg.isRead
      }));
      
      console.log('📥 Loaded messages:', normalizedMessages.length);
      setMessages(normalizedMessages);
    } catch (error) {
      console.error('Error loading chat messages:', error);
      toast.error('Failed to load chat messages');
    }
  };

  const handleReceiveMessage = (data) => {
    console.log('📨 Received message in Chat component:', data);
    if (selectedFriend && data.senderId === selectedFriend._id) {
      setMessages(prev => [...prev, {
        sender: data.senderId,
        content: data.content || data.message,
        timestamp: data.timestamp,
        isRead: false
      }]);
      
      // Scroll to bottom after new message
      setTimeout(() => scrollToBottom(), 100);
    } else {
      console.log('Message not for current chat. Selected friend:', selectedFriend?._id, 'Sender:', data.senderId);
    }
  };

  const handleUserTyping = (data) => {
    if (selectedFriend && data.senderId === selectedFriend._id) {
      setTypingUser(data.isTyping ? selectedFriend.name : null);
      setIsTyping(data.isTyping);
    }
  };

  const handleSessionStarted = (data) => {
    console.log('🚀 Session started:', data);
    setActiveSession(data.session);
    toast.success(data.message);
  };

  const handleSessionEndedNotification = (data) => {
    console.log('� Session ended notification received:', data);
    
    // Clear session state
    setActiveSession(null);
    setSessionTime(0);
    
    // Clear timer
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
    }
    
    // Store data for potential feedback
    setEndSessionRequestData({
      sessionId: data.sessionId,
      endedBy: data.endedBy,
      message: data.message
    });
    
    // Show toast notification only (no dialog)
    toast((t) => (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 250 }}>
        <Typography variant="body2" fontWeight={600}>
          {data.message}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={() => {
              toast.dismiss(t.id);
              setFeedbackDialogOpen(true);
            }}
            sx={{ flex: 1 }}
          >
            Give Feedback
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              toast.dismiss(t.id);
              setEndSessionRequestData(null);
            }}
            sx={{ flex: 1 }}
          >
            Skip
          </Button>
        </Box>
      </Box>
    ), {
      duration: 10000,
      icon: '⏱️',
    });
    
    // Reload session count
    if (selectedFriend) {
      loadSessionData(selectedFriend._id);
    }
  };

  const handleSocketNotification = (data) => {
    console.log('🔔 Socket notification received:', data);
    
    // Handle session_request specifically if on the chat page
    if (data.type === 'session_request' && selectedFriend && data.senderId === selectedFriend._id) {
      setSessionRequestData(data);
      setSessionRequestDialogOpen(true);
    }
    
    // Note: session_feedback auto-open removed - user must click "Give Feedback" in toast
  };

  const loadSessionData = async (friendId) => {
    try {
      // Load active session
      try {
        const sessionResponse = await sessionService.getActiveSession(friendId);
        setActiveSession(sessionResponse.data.session);
      } catch (err) {
        // No active session
        setActiveSession(null);
        setSessionTime(0);
      }

      // Load session count
      const countResponse = await sessionService.getSessionCount(friendId);
      setSessionCount(countResponse.data.sessionCount);
      setCanStartNewSession(countResponse.data.canStartNewSession);
    } catch (error) {
      console.error('Error loading session data:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    // Auto-start session on first message if no active session and it's the first session
    if (!activeSession && sessionCount === 0 && messages.length === 0) {
      try {
        // Get chat ID first
        const chatResponse = await chatService.getChat(selectedFriend._id);
        const chatId = chatResponse.data.chat._id;
        
        // Start session
        const sessionResponse = await sessionService.startSession({
          friendId: selectedFriend._id,
          chatId: chatId
        });
        setActiveSession(sessionResponse.data.session);
        toast.success('⏱️ Session started!');
      } catch (error) {
        console.error('Failed to start session:', error);
        // Continue sending message even if session fails to start
      }
    }

    // Add message to local state immediately
    const tempMessage = {
      sender: user.id,
      content: messageText,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setMessages(prev => [...prev, tempMessage]);

    // Send via socket
    const success = sendMessage(selectedFriend._id, messageText);
    
    if (!success) {
      // Fallback to API if socket fails
      try {
        await chatService.sendMessage({
          receiverId: selectedFriend._id,
          content: messageText
        });
      } catch (error) {
        console.error('Failed to send message:', error);
        toast.error('Failed to send message');
        // Remove the temp message
        setMessages(prev => prev.filter(msg => msg !== tempMessage));
      }
    }

    // Clear typing indicator
    sendTypingIndicator(selectedFriend._id, false);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (selectedFriend) {
      // Send typing indicator
      sendTypingIndicator(selectedFriend._id, true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(selectedFriend._id, false);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return format(date, 'HH:mm');
    } else {
      return format(date, 'MMM dd, HH:mm');
    }
  };

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleViewProfile = async () => {
    if (selectedFriend) {
      try {
        // Fetch user details from API
        const response = await friendService.getUserProfile(selectedFriend._id);
        setUserDetails(response.data.user);
        setUserDetailsOpen(true);
      } catch (error) {
        console.error('Error fetching user details:', error);
        toast.error('Failed to load user details');
      }
    }
    handleMenuClose();
  };

  const handleCloseUserDetails = () => {
    setUserDetailsOpen(false);
    setUserDetails(null);
  };

  const handleToggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleEmojiClick = (event) => {
    setEmojiAnchorEl(event.currentTarget);
  };

  const handleEmojiClose = () => {
    setEmojiAnchorEl(null);
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
    // Keep emoji picker open for multiple selections
  };

  const emojiPickerOpen = Boolean(emojiAnchorEl);

  // Session control functions
  const handleEndSession = async () => {
    if (!activeSession || !selectedFriend) return;

    try {
      const sessionId = activeSession._id;
      
      // End the session immediately
      const response = await sessionService.endSession(sessionId);
      
      const duration = response.data.duration;
      
      // Clear timer
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }

      // Store session data for feedback before clearing activeSession
      setEndSessionRequestData({
        sessionId: sessionId,
        endedBy: { id: user.id, name: user.name },
        message: 'You ended the session'
      });

      setActiveSession(null);
      setSessionTime(0);

      toast.success(`Session ended! Duration: ${formatDuration(duration)}`);
      
      // Immediately show mandatory feedback dialog for the initiator
      setFeedbackDialogOpen(true);

      // Notify the other user via socket that session ended
      if (socket) {
        socket.emit('endSession', {
          sessionId: sessionId,
          initiatorId: user.id,
          initiatorName: user.name,
          receiverId: selectedFriend._id,
          receiverName: selectedFriend.name
        });
      }
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to end session');
    }
  };

  const handleRequestNewSession = async () => {
    if (!selectedFriend) return;

    try {
      await sessionService.requestSession({ friendId: selectedFriend._id });
      toast.success(`Session request sent to ${selectedFriend.name}`);
    } catch (error) {
      console.error('Error requesting session:', error);
      toast.error(error.response?.data?.message || 'Failed to send session request');
    }
  };

  const handleStartNewSession = async () => {
    if (!selectedFriend) return;

    try {
      const chatResponse = await chatService.getChat(selectedFriend._id);
      const chatId = chatResponse.data.chat._id;
      
      const sessionResponse = await sessionService.startSession({
        friendId: selectedFriend._id,
        chatId: chatId
      });
      
      setActiveSession(sessionResponse.data.session);
      toast.success('⏱️ New session started!');
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error(error.response?.data?.message || 'Failed to start session');
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackRating) {
      toast.error('Please provide a rating');
      return;
    }

    if (!selectedFriend) {
      toast.error('No friend selected');
      return;
    }

    // Check if we have session data from endSessionRequestData or activeSession
    const sessionId = endSessionRequestData?.sessionId || activeSession?._id;
    
    if (!sessionId) {
      toast.error('No session data available');
      return;
    }

    setSubmittingFeedback(true);
    try {
      console.log('📝 Submitting feedback for friend:', selectedFriend);
      console.log('📝 RevieweeId:', selectedFriend._id);
      console.log('📝 Rating:', feedbackRating);
      console.log('📝 SessionId:', sessionId);
      
      // Validate revieweeId before sending
      if (!selectedFriend || !selectedFriend._id) {
        toast.error('Friend information is missing. Please refresh and try again.');
        setSubmittingFeedback(false);
        return;
      }
      
      // Submit feedback
      const feedbackResponse = await feedbackService.submitFeedback({
        revieweeId: selectedFriend._id,
        rating: feedbackRating,
        comment: feedbackComment || '',
        skillCategory: 'Skill Sharing',
        sessionType: 'skill-share'
      });
      
      console.log('✅ Feedback response:', feedbackResponse.data);

      // Record feedback in session if we have a sessionId
      if (sessionId) {
        await sessionService.recordFeedback(sessionId, {
          feedbackId: feedbackResponse.data.feedback._id
        });
        console.log('✅ Feedback recorded in session');
      }

      toast.success('Feedback submitted successfully!');
      
      // Reset feedback form
      setFeedbackDialogOpen(false);
      setFeedbackRating(0);
      setFeedbackComment('');
      setEndSessionRequestData(null);
      
      // Reload session data
      if (selectedFriend) {
        loadSessionData(selectedFriend._id);
      }
    } catch (error) {
      console.error('❌ Error submitting feedback:', error);
      console.error('❌ Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSessionTime = () => {
    const hours = Math.floor(sessionTime / 3600);
    const minutes = Math.floor((sessionTime % 3600) / 60);
    const seconds = sessionTime % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAcceptSessionRequest = async () => {
    if (!selectedFriend) return;

    try {
      const chatResponse = await chatService.getChat(selectedFriend._id);
      const chatId = chatResponse.data.chat._id;
      
      const sessionResponse = await sessionService.startSession({
        friendId: selectedFriend._id,
        chatId: chatId
      });
      
      setActiveSession(sessionResponse.data.session);
      setSessionRequestDialogOpen(false);
      setSessionRequestData(null);
      toast.success('⏱️ Session started!');
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error(error.response?.data?.message || 'Failed to start session');
    }
  };

  const handleDeclineSessionRequest = () => {
    setSessionRequestDialogOpen(false);
    setSessionRequestData(null);
    toast('Session request declined', { icon: 'ℹ️' });
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
      <Container maxWidth="xl" sx={{ mt: { xs: 1, md: 3 }, mb: { xs: 1, md: 3 } }}>
        <Box display="flex" height={{ xs: 'calc(100vh - 100px)', md: 'calc(100vh - 150px)' }} gap={2}>
          {/* Friends List - Desktop */}
          <Card sx={{ width: 320, display: { xs: 'none', md: 'block' }, overflow: 'hidden' }}>
          <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box p={2} borderBottom="1px solid #e0e0e0">
              <Typography variant="h6" fontWeight={600}>Friends</Typography>
            </Box>
            <List sx={{ p: 0, flexGrow: 1, overflow: 'auto' }}>
              {friends.map((friend) => (
                <ListItem
                  key={friend._id}
                  button
                  selected={selectedFriend?._id === friend._id}
                  onClick={() => {
                    setSelectedFriend(friend);
                    navigate(`/chat/${friend._id}`);
                  }}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar>
                      {friend.name?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={friend.name || 'Unknown User'}
                    secondary={friend.studentId || ''}
                    secondaryTypographyProps={{
                      sx: {
                        color: selectedFriend?._id === friend._id 
                          ? 'rgba(255, 255, 255, 0.7)' 
                          : 'text.secondary'
                      }
                    }}
                  />
                </ListItem>
              ))}
            </List>
            {friends.length === 0 && (
              <Box p={2}>
                <Alert severity="info">
                  No friends yet. Add friends to start chatting!
                </Alert>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card sx={{ flexGrow: 1 }}>
          {selectedFriend ? (
            <>
              {/* Chat Header */}
              <Box
                p={2}
                borderBottom="1px solid #e0e0e0"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
                gap={1}
              >
                <Box display="flex" alignItems="center">
                  <IconButton
                    onClick={handleToggleMobileDrawer}
                    sx={{ display: { md: 'none' }, mr: 1 }}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Avatar sx={{ mr: 2 }}>
                    {selectedFriend.name?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{selectedFriend.name || 'Unknown User'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedFriend.studentId || ''}
                    </Typography>
                  </Box>
                </Box>

                {/* Session Timer and Controls */}
                <Box display="flex" alignItems="center" gap={1}>
                  {activeSession && activeSession.status === 'active' && (
                    <>
                      <Chip
                        icon={<Timer />}
                        label={formatSessionTime()}
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 'bold', fontSize: '1rem', px: 1 }}
                      />
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<Stop />}
                        onClick={handleEndSession}
                        sx={{ textTransform: 'none' }}
                      >
                        End Session
                      </Button>
                    </>
                  )}
                  
                  {!activeSession && sessionCount > 0 && canStartNewSession && (
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<PlayArrow />}
                      onClick={handleRequestNewSession}
                      sx={{ textTransform: 'none' }}
                    >
                      Request New Session
                    </Button>
                  )}

                  {!activeSession && sessionCount > 0 && !canStartNewSession && (
                    <Chip
                      label={`${sessionCount}/5 Sessions Used`}
                      color="warning"
                      size="small"
                    />
                  )}
                  
                  <IconButton onClick={handleMenuOpen}>
                    <MoreVert />
                  </IconButton>
                </Box>
              </Box>

              <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleViewProfile}>View Profile</MenuItem>
              </Menu>

              {/* Messages */}
              <Box
                sx={{
                  height: { xs: 'calc(100vh - 280px)', md: 'calc(70vh - 140px)' },
                  overflowY: 'auto',
                  p: { xs: 1, md: 2 },
                }}
              >
                {messages.map((message, index) => (
                  <Box
                    key={index}
                    display="flex"
                    justifyContent={
                      message.sender === user.id ? 'flex-end' : 'flex-start'
                    }
                    mb={2}
                  >
                    <Paper
                      sx={{
                        p: { xs: 1.5, md: 2 },
                        maxWidth: { xs: '85%', md: '70%' },
                        backgroundColor:
                          message.sender === user.id
                            ? 'primary.main'
                            : 'grey.100',
                        color:
                          message.sender === user.id
                            ? 'white'
                            : 'text.primary',
                      }}
                    >
                      <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                        {message.content}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.7,
                          display: 'block',
                          mt: 0.5,
                        }}
                      >
                        {formatMessageTime(message.timestamp)}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && typingUser && (
                  <Box display="flex" justifyContent="flex-start" mb={2}>
                    <Paper sx={{ p: 2, backgroundColor: 'grey.100' }}>
                      <Typography variant="body2" color="text.secondary">
                        {typingUser} is typing...
                      </Typography>
                    </Paper>
                  </Box>
                )}
                
                <div ref={messagesEndRef} />
              </Box>

              {/* Message Input */}
              <Box
                p={{ xs: 1.5, md: 2 }}
                borderTop="1px solid #e0e0e0"
                display="flex"
                alignItems="center"
                gap={1}
              >
                <IconButton
                  onClick={handleEmojiClick}
                  color="primary"
                  size="small"
                  disabled={!connected}
                >
                  <EmojiEmotions />
                </IconButton>
                <TextField
                  fullWidth
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={handleKeyPress}
                  disabled={!connected}
                  size="small"
                  multiline
                  maxRows={4}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || !connected}
                          color="primary"
                          size="small"
                        >
                          <Send />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: { xs: '0.9rem', md: '1rem' }
                    }
                  }}
                />
              </Box>

              {/* Emoji Picker Popover */}
              <Popover
                open={emojiPickerOpen}
                anchorEl={emojiAnchorEl}
                onClose={handleEmojiClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
              >
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  width={300}
                  height={400}
                />
              </Popover>
            </>
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100%"
              p={{ xs: 2, md: 4 }}
            >
              <ChatIcon sx={{ fontSize: { xs: 60, md: 80 }, color: 'grey.400', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
                Select a friend to start chatting
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                Choose from your friends list to begin a conversation
              </Typography>
              <Button
                variant="outlined"
                startIcon={<MenuIcon />}
                onClick={handleToggleMobileDrawer}
                sx={{ mt: 2, display: { md: 'none' } }}
              >
                Open Friends List
              </Button>
            </Box>
          )}
        </Card>
      </Box>

      {/* Mobile Drawer for Friends List */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={handleToggleMobileDrawer}
        sx={{ display: { md: 'none' } }}
      >
        <Box sx={{ width: 280 }}>
          <Box p={2} display="flex" justifyContent="space-between" alignItems="center" borderBottom="1px solid #e0e0e0">
            <Typography variant="h6" fontWeight={600}>Friends</Typography>
            <IconButton onClick={handleToggleMobileDrawer}>
              <Close />
            </IconButton>
          </Box>
          <List sx={{ p: 0 }}>
            {friends.map((friend) => (
              <ListItem
                key={friend._id}
                button
                selected={selectedFriend?._id === friend._id}
                onClick={() => {
                  setSelectedFriend(friend);
                  navigate(`/chat/${friend._id}`);
                  setMobileDrawerOpen(false);
                }}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar>
                    {friend.name?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={friend.name || 'Unknown User'}
                  secondary={friend.studentId || ''}
                />
              </ListItem>
            ))}
          </List>
          {friends.length === 0 && (
            <Box p={2}>
              <Alert severity="info">
                No friends yet. Add friends to start chatting!
              </Alert>
            </Box>
          )}
        </Box>
      </Drawer>

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
          {userDetails && (
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
                  {userDetails.name?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={600}>
                    {userDetails.name || 'Unknown User'}
                  </Typography>
                  {userDetails.averageRating > 0 && (
                    <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                      <Star fontSize="small" sx={{ color: '#ffc107' }} />
                      <Typography variant="body2" color="text.secondary">
                        {userDetails.averageRating.toFixed(1)} Rating
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Skills */}
              {userDetails.skillsOffered && userDetails.skillsOffered.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    SKILLS OFFERED
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {userDetails.skillsOffered.map((skill, index) => (
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

              {userDetails.skillsWanted && userDetails.skillsWanted.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    SKILLS WANTED
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {userDetails.skillsWanted.map((skill, index) => (
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
                        {userDetails.feedbackCount || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Reviews
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                      <Typography variant="h4" color="warning.main">
                        {userDetails.averageRating ? userDetails.averageRating.toFixed(1) : 'N/A'}
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

      {/* Feedback Dialog */}
      <Dialog
        open={feedbackDialogOpen}
        onClose={(event, reason) => {
          // Prevent closing by clicking outside or pressing escape
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            toast.error('Please submit your feedback before closing');
            return;
          }
        }}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <RateReview color="primary" />
            <Typography variant="h6">Rate Your Session</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box>
            {/* Session Info */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Session with: <strong>{selectedFriend?.name}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Duration: <strong>{formatDuration(sessionTime)}</strong>
              </Typography>
              {sessionCount > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Session #{sessionCount}
                </Typography>
              )}
            </Paper>

            {/* Rating */}
            <Box mb={3} textAlign="center">
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                How was your experience?
              </Typography>
              <Box display="flex" justifyContent="center" gap={1} my={2}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <IconButton
                    key={star}
                    onClick={() => setFeedbackRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    sx={{ p: 0.5 }}
                  >
                    <Star
                      sx={{
                        fontSize: 40,
                        color: star <= (hoverRating || feedbackRating) ? '#ffc107' : '#e0e0e0',
                        transition: 'all 0.2s'
                      }}
                    />
                  </IconButton>
                ))}
              </Box>
              {feedbackRating > 0 && (
                <Typography variant="body2" color="primary" fontWeight={600}>
                  {feedbackRating === 5 && '⭐ Excellent!'}
                  {feedbackRating === 4 && '😊 Great!'}
                  {feedbackRating === 3 && '👍 Good'}
                  {feedbackRating === 2 && '😐 Fair'}
                  {feedbackRating === 1 && '😞 Poor'}
                </Typography>
              )}
            </Box>

            {/* Comment */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Add a comment (optional)"
              placeholder="Share your thoughts about this session..."
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              disabled={submittingFeedback}
              sx={{ mb: 2 }}
            />

            {/* Feedback Info */}
            <Alert severity="warning" sx={{ mt: 2 }}>
              <strong>Feedback is required!</strong> You must submit feedback before continuing. ({sessionCount}/5 sessions used)
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleSubmitFeedback}
            variant="contained"
            fullWidth
            disabled={!feedbackRating || submittingFeedback}
            startIcon={submittingFeedback ? <CircularProgress size={20} /> : <RateReview />}
            size="large"
          >
            {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Session Request Dialog */}
      <Dialog
        open={sessionRequestDialogOpen}
        onClose={handleDeclineSessionRequest}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Timer color="primary" fontSize="large" />
            <Typography variant="h6">New Session Request</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box textAlign="center" py={2}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
                bgcolor: 'primary.main',
                fontSize: '2rem'
              }}
            >
              {sessionRequestData?.senderName?.charAt(0).toUpperCase() || selectedFriend?.name?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {sessionRequestData?.senderName || selectedFriend?.name} wants to start a new skill-sharing session
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Starting a session will begin a timer to track your collaboration time. 
              Either of you can end the session and provide feedback.
            </Typography>
            
            {sessionCount > 0 && (
              <Alert severity="info" sx={{ mt: 3 }}>
                This will be session #{sessionCount + 1}/5 with this user
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeclineSessionRequest} color="inherit">
            Decline
          </Button>
          <Button
            onClick={handleAcceptSessionRequest}
            variant="contained"
            startIcon={<PlayArrow />}
          >
            Accept & Start Session
          </Button>
        </DialogActions>
      </Dialog>

      </Container>
    </PageLayout>
  );
};

export default Chat;
