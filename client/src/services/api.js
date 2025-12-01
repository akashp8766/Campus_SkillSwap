import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance for auth endpoints
export const authAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for protected endpoints
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authService = {
  login: (email, password) => authAPI.post('/auth/login', { email, password }),
  register: (userData) => authAPI.post('/auth/register', userData),
  getProfile: () => authAPI.get('/auth/profile'),
  verifyToken: () => authAPI.post('/auth/verify-token'),
};

// Users API calls
export const userService = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (userId) => api.get(`/users/${userId}`),
  updateProfile: (userId, data) => api.put(`/users/${userId}`, data),
  getPopularSkills: () => api.get('/users/skills/popular'),
  searchUsersBySkill: (params) => api.get('/users/skills/search', { params }),
};

// Friends API calls
export const friendService = {
  getFriends: () => api.get('/friends'),
  sendFriendRequest: (data) => api.post('/friends/request', data),
  getFriendRequests: () => api.get('/friends/requests'),
  respondToFriendRequest: (requestId, action) => 
    api.put(`/friends/request/${requestId}`, { action }),
  removeFriend: (friendId) => api.delete(`/friends/${friendId}`),
  getFriendSuggestions: () => api.get('/friends/suggestions'),
  getUserProfile: (userId) => api.get(`/users/${userId}`),
};

// Chat API calls
export const chatService = {
  getChat: (friendId) => api.get(`/chat/${friendId}`),
  getConversations: () => api.get('/chat/conversations/list'),
  sendMessage: (data) => api.post('/chat/message', data),
  markAsRead: (chatId) => api.put(`/chat/${chatId}/read`),
  deleteChat: (chatId) => api.delete(`/chat/${chatId}`),
};

// Feedback API calls
export const feedbackService = {
  submitFeedback: (data) => api.post('/feedback', data),
  getUserFeedback: (userId, params) => api.get(`/feedback/${userId}`, { params }),
  getFeedbackSummary: (userId) => api.get(`/feedback/user/${userId}/summary`),
  updateFeedback: (feedbackId, data) => api.put(`/feedback/${feedbackId}`, data),
  deleteFeedback: (feedbackId) => api.delete(`/feedback/${feedbackId}`),
};

// Admin API calls
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (userId, data) => api.put(`/admin/users/${userId}/status`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getFeedback: (params) => api.get('/admin/feedback', { params }),
  deleteFeedback: (feedbackId) => api.delete(`/admin/feedback/${feedbackId}`),
  getUserReport: (params) => api.get('/admin/reports/users', { params }),
  getActivityReport: (params) => api.get('/admin/reports/activity', { params }),
};

// Session API
export const sessionService = {
  startSession: (data) => api.post('/session/start', data),
  getActiveSession: (friendId) => api.get(`/session/active/${friendId}`),
  getSessionCount: (friendId) => api.get(`/session/count/${friendId}`),
  endSession: (sessionId) => api.post(`/session/${sessionId}/end`),
  recordFeedback: (sessionId, data) => api.post(`/session/${sessionId}/feedback`, data),
  getSessionHistory: (friendId) => api.get(`/session/history/${friendId}`),
  requestSession: (data) => api.post('/session/request', data),
};

export default api;
