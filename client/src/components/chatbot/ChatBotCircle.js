import React from 'react';
import { Box, Tooltip } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useChatBot } from '../../context/ChatBotContext';
import { useTheme } from '@mui/material/styles';

const ChatBotCircle = () => {
  const { showCircle, setOpenChatBot } = useChatBot();
  const theme = useTheme();

  if (!showCircle) return null;

  return (
    <Tooltip title="Ask me anything about CampusSkillSwap!" arrow placement="left">
      <Box
        onClick={() => setOpenChatBot(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          width: 60,
          height: 60,
          borderRadius: '50%',
          backgroundColor: theme.palette.primary.main,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.3s ease',
          zIndex: 1500,
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        }}
      >
        <SmartToyIcon sx={{ color: 'white', fontSize: 32 }} />
      </Box>
    </Tooltip>
  );
};

export default ChatBotCircle;
