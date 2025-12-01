import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Listen for socket notifications
  useEffect(() => {
    if (!socket) {
      console.log('⚠️ Socket not available for notifications');
      return;
    }

    console.log('✅ Setting up notification listener on socket:', socket.id);

    const handleNotification = (data) => {
      console.log('🔔 Received notification:', data);
      
      const notification = {
        id: Date.now() + Math.random(),
        ...data,
        timestamp: data.timestamp || new Date().toISOString(),
        read: false
      };

      setNotifications(prev => {
        const updated = [notification, ...prev];
        console.log('💾 Saving notification to state and localStorage');
        localStorage.setItem('notifications', JSON.stringify(updated));
        return updated;
      });

      // Show toast notification with click handler
      const toastMessage = data.message || 'New notification';
      const toastOptions = {
        duration: 4000,
        onClick: () => handleNotificationClick(data)
      };

      switch (data.type) {
        case 'friend_request':
          toast.success(toastMessage, { ...toastOptions, icon: '👥' });
          break;
        case 'friend_accepted':
          toast.success(toastMessage, { ...toastOptions, icon: '✅' });
          break;
        case 'message':
        case 'new_message':
          toast(toastMessage, { ...toastOptions, icon: '💬' });
          break;
        case 'friend_removed':
          toast(toastMessage, { ...toastOptions, icon: '❌' });
          break;
        case 'session_request':
          toast(toastMessage, { ...toastOptions, icon: '⏱️' });
          break;
        case 'session_feedback':
          toast(toastMessage, { ...toastOptions, icon: '⭐' });
          break;
        default:
          toast(toastMessage, toastOptions);
      }
    };

    socket.on('notification', handleNotification);

    return () => {
      console.log('🔌 Cleaning up notification listener');
      socket.off('notification', handleNotification);
    };
  }, [socket]);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      ...notification,
      timestamp: notification.timestamp || new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('notifications');
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleNotificationClick = (notification) => {
    console.log('🔔 Notification clicked:', notification);
    
    // Mark as read
    if (notification.id) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'friend_request':
        navigate('/friends');
        break;
      case 'friend_accepted':
        navigate('/friends');
        break;
      case 'message':
      case 'new_message':
        if (notification.senderId) {
          navigate(`/chat/${notification.senderId}`);
        } else {
          navigate('/chat');
        }
        break;
      case 'session_request':
        // Navigate to chat with the person who sent request
        if (notification.senderId) {
          navigate(`/chat/${notification.senderId}`);
        }
        break;
      case 'session_feedback':
        // Navigate to chat where feedback is needed
        if (notification.senderId) {
          navigate(`/chat/${notification.senderId}`);
        }
        break;
      case 'feedback':
        navigate('/feedback');
        break;
      case 'skill_swap':
        navigate('/skill-swap');
        break;
      default:
        navigate('/dashboard');
    }
  };

  // Clean up old notifications (older than 7 days)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      setNotifications(prev =>
        prev.filter(n => new Date(n.timestamp) > sevenDaysAgo)
      );
    }, 1000 * 60 * 60); // Check every hour

    return () => clearInterval(cleanupInterval);
  }, []);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    removeNotification,
    handleNotificationClick
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
