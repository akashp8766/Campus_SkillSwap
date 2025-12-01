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
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const NotificationMenu = ({ anchorEl, open, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, handleNotificationClick: handleNotificationNavigation } = useNotifications();
  const navigate = useNavigate();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'friend_request':
        return <PersonAdd sx={{ color: '#2196f3' }} />;
      case 'friend_accepted':
        return <CheckCircle sx={{ color: '#4caf50' }} />;
      case 'new_message':
        return <Chat sx={{ color: '#ff9800' }} />;
      case 'friend_removed':
        return <PersonRemove sx={{ color: '#f44336' }} />;
      default:
        return <Chat />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'friend_request':
        return '#e3f2fd';
      case 'friend_accepted':
        return '#e8f5e9';
      case 'new_message':
        return '#fff3e0';
      case 'friend_removed':
        return '#ffebee';
      default:
        return '#f5f5f5';
    }
  };

  const handleNotificationClick = (notification) => {
    // Use the context's navigation handler
    if (handleNotificationNavigation) {
      handleNotificationNavigation(notification);
    } else {
      // Fallback to old behavior
      markAsRead(notification.id);
      const path = getRedirectPath(notification);
      navigate(path);
    }
    onClose();
  };

  const getRedirectPath = (notification) => {
    switch (notification.type) {
      case 'friend_request':
        return '/friends?tab=1'; // Requests tab
      case 'friend_accepted':
        return '/friends?tab=0'; // My Friends tab
      case 'new_message':
      case 'message':
        return notification.senderId ? `/chat/${notification.senderId}` : '/chat';
      case 'friend_removed':
        return '/friends';
      default:
        return '/dashboard';
    }
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
          {notifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <ListItemButton
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  backgroundColor: notification.read
                    ? 'transparent'
                    : getNotificationColor(notification.type),
                  '&:hover': {
                    backgroundColor: notification.read
                      ? 'rgba(0, 0, 0, 0.04)'
                      : getNotificationColor(notification.type),
                    opacity: 0.8
                  },
                  py: 1.5,
                  px: 2
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'white' }}>
                    {getNotificationIcon(notification.type)}
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
          ))}
        </List>
      )}
    </Menu>
  );
};

export default NotificationMenu;
