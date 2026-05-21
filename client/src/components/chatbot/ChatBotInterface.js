import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Divider,
  Switch,
  Stack,
  Avatar,
  CircularProgress,
  Tooltip,
  Button,
  Chip,
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon,
  DeleteOutline as DeleteIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Visibility as EyeIcon,
  VisibilityOff as EyeOffIcon,
  HelpOutline as HelpIcon,
} from '@mui/icons-material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useTheme } from '@mui/material/styles';
import { useChatBot } from '../../context/ChatBotContext';
import { chatbotService } from '../../services/api';
import toast from 'react-hot-toast';

const FAQS = [
  'How do I post a skill?',
  'How do I find someone to learn from?',
  'How does the friend system work?',
  'How do ratings and feedback work?',
  'What skills can I share?',
  'How do I start a skill exchange?',
  'Is there an app version?',
  'How do I report someone?',
];

const ChatBotInterface = () => {
  const theme = useTheme();
  const { messages, setMessages, addMessage, loading, setLoading, openChatBot, setOpenChatBot, showCircle, setShowCircle, resetChat } = useChatBot();
  const [userInput, setUserInput] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(theme.palette.mode === 'dark');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!userInput.trim()) return;

    // Add user message
    addMessage(userInput, 'user');
    setUserInput('');
    setLoading(true);

    try {
      const response = await chatbotService.sendMessage(userInput);
      const botResponse = response.data.response;
      addMessage(botResponse, 'bot');
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to get response. Please try again.';
      addMessage(errorMsg, 'bot');
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleFAQClick = async (faqQuestion) => {
    // Add user message
    addMessage(faqQuestion, 'user');
    setLoading(true);

    try {
      const response = await chatbotService.sendMessage(faqQuestion);
      const botResponse = response.data.response;
      addMessage(botResponse, 'bot');
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to get response. Please try again.';
      addMessage(errorMsg, 'bot');
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  if (!openChatBot) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 30,
        right: 30,
        width: { xs: '90vw', sm: 400 },
        height: { xs: '70vh', sm: 520 },
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
        borderRadius: 2,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        zIndex: theme.zIndex.drawer + 3,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          padding: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" flex={1}>
          <Avatar
            sx={{
              bgcolor: 'rgba(255,255,255,0.3)',
              width: 40,
              height: 40,
            }}
          >
            <SmartToyIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              CampusSkillSwap Bot
            </Typography>
            <Typography variant="caption">Always here to help!</Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.5}>
          {/* Dark/Light Mode Toggle */}
          <Tooltip title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
            <IconButton
              size="small"
              onClick={() => setIsDarkMode(!isDarkMode)}
              sx={{ color: 'white' }}
            >
              {isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {/* Show/Hide Circle Toggle */}
          <Tooltip title={showCircle ? 'Hide Circle' : 'Show Circle'}>
            <IconButton
              size="small"
              onClick={() => setShowCircle(!showCircle)}
              sx={{ color: 'white' }}
            >
              {showCircle ? <EyeIcon fontSize="small" /> : <EyeOffIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {/* Close Button */}
          <IconButton
            size="small"
            onClick={() => setOpenChatBot(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <Divider />

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          padding: 2,
          backgroundColor: isDarkMode ? '#262626' : '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              justifyContent: msg.sender === 'bot' ? 'flex-start' : 'flex-end',
              alignItems: 'flex-end',
              gap: 1,
            }}
          >
            {msg.sender === 'bot' && (
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: theme.palette.primary.main,
                }}
              >
                <SmartToyIcon sx={{ fontSize: 18 }} />
              </Avatar>
            )}

            <Paper
              sx={{
                maxWidth: '70%',
                padding: 1.5,
                backgroundColor:
                  msg.sender === 'bot'
                    ? isDarkMode
                      ? '#3a3a3a'
                      : '#e3f2fd'
                    : theme.palette.primary.main,
                color: msg.sender === 'bot' ? 'inherit' : 'white',
                borderRadius: 2,
                wordBreak: 'break-word',
              }}
            >
              <Typography variant="body2">{msg.text}</Typography>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  marginTop: 0.5,
                  opacity: 0.7,
                }}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Paper>
          </Box>
        ))}

        {/* FAQ Section - Show if only initial message */}
        {messages.length <= 1 && !loading && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <HelpIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: isDarkMode ? '#fff' : '#333' }}>
                Common Questions:
              </Typography>
            </Box>
            <Stack direction="column" spacing={1}>
              {FAQS.map((faq, index) => (
                <Chip
                  key={index}
                  label={faq}
                  onClick={() => handleFAQClick(faq)}
                  icon={<HelpIcon />}
                  variant="outlined"
                  sx={{
                    justifyContent: 'flex-start',
                    backgroundColor: isDarkMode ? '#3a3a3a' : '#f5f5f5',
                    borderColor: theme.palette.primary.main,
                    color: isDarkMode ? '#fff' : '#333',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main,
                      color: '#fff',
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {loading && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: theme.palette.primary.main,
              }}
            >
              <SmartToyIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <CircularProgress size={20} />
              <Typography variant="caption">Bot is thinking...</Typography>
            </Box>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Input Area */}
      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          padding: 2,
          display: 'flex',
          gap: 1,
          backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Type your question..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              color: isDarkMode ? '#ffffff' : '#000000',
              backgroundColor: isDarkMode ? '#262626' : '#f5f5f5',
            },
          }}
        />
        <IconButton
          type="submit"
          disabled={loading || !userInput.trim()}
          sx={{
            bgcolor: theme.palette.primary.main,
            color: 'white',
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            },
            '&:disabled': {
              bgcolor: theme.palette.action.disabled,
            },
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>

      {/* Reset Button */}
      <Box sx={{ padding: 1, textAlign: 'center', borderTop: `1px solid ${isDarkMode ? '#3a3a3a' : '#e0e0e0'}` }}>
        <Tooltip title="Start a new conversation">
          <IconButton size="small" onClick={resetChat} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default ChatBotInterface;
