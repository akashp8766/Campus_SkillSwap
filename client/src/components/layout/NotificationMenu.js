import React from 'react';
import {
  Menu,
  MenuItem,
  Typography,
  Box,
  IconButton,
  Divider,
  Badge,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton
} from '@mui/material';
import {
  PersonAdd,
  CheckCircle,
  Chat,
  PersonRemove,
  Close,
  DoneAll
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const NotificationMenu = ({ anchorEl, open, onClose }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, handleNotificationClick: handleNotificationNavigation } = useNotifications();
  const navigate = useNavigate();

  const NOTIFICATION_CONFIG = {
    friend_request: {
      icon: <PersonAdd sx={{ color: '#2196f3' }} />,
      color: isDark ? alpha('#2196f3', 0.15) : '#e3f2fd',
      getPath: () => '/friends?tab=1'
    },
    friend_accepted: {
      icon: <CheckCircle sx={{ color: '#4caf50' }} />,
      color: isDark ? alpha('#4caf50', 0.15) : '#e8f5e9',
      getPath: () => '/friends?tab=0'
    },
    new_message: {
      icon: <Chat sx={{ color: '#ff9800' }} />,
      color: isDark ? alpha('#ff9800', 0.15) : '#fff3e0',
      getPath: (n) => n.senderId ? `/chat/${n.senderId}` : '/chat'
    },
    message: {
      icon: <Chat sx={{ color: '#ff9800' }} />,
      color: isDark ? alpha('#ff9800', 0.15) : '#fff3e0',
      getPath: (n) => n.senderId ? `/chat/${n.senderId}` : '/chat'
    },
    friend_removed: {
      icon: <PersonRemove sx={{ color: '#f44336' }} />,
      color: isDark ? alpha('#f44336', 0.15) : '#ffebee',
      getPath: () => '/friends'
    },
    default: {
      icon: <Chat />,
      color: isDark ? alpha('#9e9e9e', 0.15) : '#f5f5f5',
      getPath: () => '/dashboard'
    }
  };

  const handleNotificationClick = (notification) => {
    // Use the context's navigation handler
    if (handleNotificationNavigation) {
      handleNotificationNavigation(notification);
    } else {
      // Fallback to old behavior
      markAsRead(notification.id);
      const config = NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG.default;
      const path = config.getPath(notification);
      navigate(path);
    }
    onClose();
  };

  const handleRemoveNotification = (e, notificationId) => {
    e.stopPropagation();
    removeNotification(notificationId);
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 360,
          maxHeight: 500,
          mt: 1.5,
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          pb: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Notifications
          {unreadCount > 0 && (
            <Badge
              badgeContent={unreadCount}
              color="error"
              sx={{ ml: 2 }}
            />
          )}
        </Typography>
        {unreadCount > 0 && (
          <Button
            size="small"
            startIcon={<DoneAll />}
            onClick={markAllAsRead}
            sx={{ textTransform: 'none' }}
          >
            Mark all read
          </Button>
        )}
      </Box>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No notifications yet
          </Typography>
        </Box>
      ) : (
        <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
          {notifications.map((notification, index) => {
            const config = NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG.default;
            return (
              <React.Fragment key={notification.id}>
                <ListItemButton
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    backgroundColor: notification.read
                      ? 'transparent'
                      : config.color,
                    '&:hover': {
                      backgroundColor: notification.read
                        ? 'rgba(0, 0, 0, 0.04)'
                        : config.color,
                      opacity: 0.8
                    },
                    py: 1.5,
                    px: 2
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'white' }}>
                      {config.icon}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      fontWeight={notification.read ? 'normal' : 'bold'}
                      sx={{ pr: 4 }}
                    >
                      {notification.message}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(notification.timestamp), {
                        addSuffix: true
                      })}
                    </Typography>
                  }
                />
                <IconButton
                  size="small"
                  onClick={(e) => handleRemoveNotification(e, notification.id)}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    opacity: 0.6,
                    '&:hover': {
                      opacity: 1
                    }
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
                </ListItemButton>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            );
          })}
        </List>
      )}
    </Menu>
  );
};

export default NotificationMenu;
