import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
        setConnected(true);
        
        // Join user to their personal room
        console.log('🏠 Joining room for user:', user.id);
        newSocket.emit('join', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('🔴 Socket connection error:', error);
        toast.error('Connection error. Please refresh the page.');
      });

      // Message events
      newSocket.on('receiveMessage', (data) => {
        // Handle incoming message
        console.log('📩 SocketContext: Received message:', data);
        // This will be handled by components that need to listen for messages
      });

      newSocket.on('messageSent', (data) => {
        if (data.success) {
          console.log('Message sent successfully');
        }
      });

      newSocket.on('messageError', (error) => {
        console.error('Message error:', error);
        toast.error('Failed to send message');
      });

      // Typing events
      newSocket.on('userTyping', (data) => {
        console.log('User typing:', data);
        // Handle typing indicator
      });

      // Online users events
      newSocket.on('userOnline', (userId) => {
        setOnlineUsers(prev => {
          if (!prev.includes(userId)) {
            return [...prev, userId];
          }
          return prev;
        });
      });

      newSocket.on('userOffline', (userId) => {
        setOnlineUsers(prev => prev.filter(id => id !== userId));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setConnected(false);
      };
    }
  }, [user, token]);

  const sendMessage = (receiverId, message, messageType = 'text') => {
    if (socket && connected) {
      const messageData = {
        senderId: user.id,
        receiverId,
        message,
        messageType,
        timestamp: new Date().toISOString()
      };
      
      console.log('📤 SocketContext: Sending message:', messageData);
      socket.emit('sendMessage', messageData);
      return true;
    }
    console.warn('⚠️ Socket not connected, cannot send message');
    return false;
  };

  const sendTypingIndicator = (receiverId, isTyping) => {
    if (socket && connected) {
      socket.emit('typing', {
        senderId: user.id,
        receiverId,
        isTyping
      });
    }
  };

  const joinRoom = (roomId) => {
    if (socket && connected) {
      socket.emit('join', roomId);
    }
  };

  const leaveRoom = (roomId) => {
    if (socket && connected) {
      socket.emit('leave', roomId);
    }
  };

  const value = {
    socket,
    connected,
    onlineUsers,
    sendMessage,
    sendTypingIndicator,
    joinRoom,
    leaveRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
