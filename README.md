# Campus Skill Swap - MERN Stack Application

A comprehensive campus skill swap platform built with MongoDB, Express, React, and Node.js. This application enables students to connect, share skills, and learn from each other in a structured, feedback-driven environment.

## 🌟 Features

### Core Functionality
- **🔐 Authentication**: Campus email verification with JWT tokens and bcrypt password hashing
- **👤 User Profiles**: Comprehensive profiles with skills offered, interests, and skills looking for
- **👥 Friend System**: Symmetrical friend requests with accept/decline functionality
- **💬 Real-time Chat**: One-to-one messaging between friends using Socket.io
- **🔄 Skill Swaps**: Structured skill exchange proposals and sessions
- **⭐ Feedback System**: Rating and review system for skill exchanges
- **🛡️ Admin Panel**: Comprehensive user monitoring and management tools

### User Experience
- **📱 Responsive Design**: Material UI with psychological UX principles
- **🎨 Modern Interface**: Clean, intuitive design with proper color harmony
- **⚡ Real-time Updates**: Live chat and notifications
- **🔍 Smart Search**: Find users by skills, interests, or keywords
- **📊 Analytics**: User statistics and feedback summaries

## 🛠️ Tech Stack

### Frontend
- **React 18** with hooks and functional components
- **Material UI 5** for consistent, accessible components
- **React Router 6** for client-side routing
- **Context API** for state management
- **Socket.io Client** for real-time communication
- **React Hook Form** for form handling
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Socket.io** for real-time communication
- **Express Validator** for input validation
- **CORS** for cross-origin requests

### Database Models
- **User**: Student profiles with skills and ratings
- **FriendRequest**: Friend request management
- **Chat**: Message storage and conversation history
- **Feedback**: Rating and review system
- **SkillSwap**: Skill exchange proposals and sessions

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local instance or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone and Install Dependencies**
```bash
git clone <repository-url>
cd campus-skill-swap
npm run install-all
```

2. **Environment Setup**
```bash
# Copy environment template
cp server/env.example server/.env

# Edit server/.env with your configuration
MONGODB_URI=mongodb://localhost:27017/campus-skill-swap
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
NODE_ENV=development
ALLOWED_DOMAINS=university.edu,college.edu,school.edu
CLIENT_URL=http://localhost:3000
```

3. **Start Development Servers**
```bash
npm run dev
```

This will start:
- Express server on `http://localhost:5000`
- React client on `http://localhost:3000`

## 📁 Project Structure

```
campus-skill-swap/
├── client/                     # React frontend
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── auth/          # Authentication components
│   │   │   └── layout/        # Layout components
│   │   ├── pages/            # Page components
│   │   │   ├── auth/         # Login/Register pages
│   │   │   └── admin/        # Admin panel pages
│   │   ├── context/          # React Context providers
│   │   ├── services/         # API service functions
│   │   └── utils/            # Utility functions
│   └── package.json
├── server/                     # Express backend
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js          # JWT authentication
│   │   └── validation.js    # Input validation
│   ├── models/              # Mongoose models
│   │   ├── User.js          # User schema
│   │   ├── FriendRequest.js # Friend request schema
│   │   ├── Chat.js          # Chat schema
│   │   ├── Feedback.js      # Feedback schema
│   │   └── SkillSwap.js    # Skill swap schema
│   ├── routes/             # Express routes
│   │   ├── auth.js         # Authentication routes
│   │   ├── users.js       # User management routes
│   │   ├── friends.js     # Friend system routes
│   │   ├── chat.js        # Chat routes
│   │   ├── feedback.js    # Feedback routes
│   │   └── admin.js       # Admin routes
│   ├── index.js           # Server entry point
│   └── package.json
└── package.json           # Root package.json
```

## 🔌 API Documentation

### Authentication Endpoints
```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
GET  /api/auth/profile      # Get current user profile
POST /api/auth/verify-token # Verify JWT token
```

### User Management
```
GET  /api/users                    # Get all users (paginated)
GET  /api/users/:id               # Get user by ID
PUT  /api/users/:id               # Update user profile
GET  /api/users/skills/popular    # Get popular skills
GET  /api/users/skills/search     # Search users by skills
```

### Friend System
```
GET  /api/friends                    # Get user's friends
POST /api/friends/request           # Send friend request
GET  /api/friends/requests          # Get pending requests
PUT  /api/friends/request/:id      # Accept/decline request
DELETE /api/friends/:friendId       # Remove friend
GET  /api/friends/suggestions       # Get friend suggestions
```

### Chat System
```
GET  /api/chat/:friendId           # Get chat history
GET  /api/chat/conversations/list   # Get all conversations
POST /api/chat/message             # Send message
PUT  /api/chat/:chatId/read        # Mark as read
DELETE /api/chat/:chatId           # Delete chat
```

### Feedback System
```
POST /api/feedback                 # Submit feedback
GET  /api/feedback/:userId         # Get user feedback
GET  /api/feedback/user/:userId/summary # Get feedback summary
PUT  /api/feedback/:feedbackId    # Update feedback
DELETE /api/feedback/:feedbackId  # Delete feedback
```

### Admin Endpoints
```
GET  /api/admin/dashboard          # Admin dashboard stats
GET  /api/admin/users             # Manage users
PUT  /api/admin/users/:userId/status # Activate/deactivate user
DELETE /api/admin/users/:userId   # Delete user
GET  /api/admin/feedback          # Manage feedback
DELETE /api/admin/feedback/:feedbackId # Delete feedback
GET  /api/admin/reports/users     # User activity report
GET  /api/admin/reports/activity  # Platform activity report
```

## 🔧 Configuration

### Environment Variables

#### Server (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/campus-skill-swap

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=development

# Campus Email Validation
ALLOWED_DOMAINS=university.edu,college.edu,school.edu

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

#### Client (Optional .env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SERVER_URL=http://localhost:5000
```

### Campus Email Validation

The application restricts registration to specific campus email domains. Update the `ALLOWED_DOMAINS` environment variable with your institution's domains:

```env
ALLOWED_DOMAINS=university.edu,college.edu,school.edu
```



## 🔒 Security Features

### Authentication & Authorization
- JWT tokens with 7-day expiration
- bcrypt password hashing with salt rounds
- Campus email domain validation
- Protected routes with middleware
- Admin role-based access control

### Data Validation
- Server-side input validation with express-validator
- Client-side form validation with react-hook-form
- MongoDB schema validation
- XSS protection with proper input sanitization

### Security Headers
- CORS configuration for cross-origin requests
- Helmet.js for security headers (recommended addition)
- Rate limiting (recommended addition)

## 📊 Database Schema

### User Model
```javascript
{
  name: String (required),
  studentId: String (required, unique),
  email: String (required, unique),
  password: String (hashed),
  skillsOffered: [String],
  interests: [String],
  skillsLookingFor: [String],
  bio: String,
  reputation: Number,
  averageRating: Number,
  totalRatings: Number,
  isActive: Boolean,
  isAdmin: Boolean
}
```

### FriendRequest Model
```javascript
{
  sender: ObjectId (ref: User),
  receiver: ObjectId (ref: User),
  status: String (pending/accepted/declined),
  message: String,
  createdAt: Date,
  respondedAt: Date
}
```

### Chat Model
```javascript
{
  participants: [ObjectId (ref: User)],
  messages: [{
    sender: ObjectId (ref: User),
    content: String,
    timestamp: Date,
    isRead: Boolean
  }],
  lastMessage: Object,
  isActive: Boolean
}
```

### Feedback Model
```javascript
{
  reviewer: ObjectId (ref: User),
  reviewee: ObjectId (ref: User),
  rating: Number (1-5),
  comment: String,
  skillCategory: String,
  sessionType: String,
  isAnonymous: Boolean,
  createdAt: Date
}
```

## 🚀 Deployment

### Production Environment Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campus-skill-swap
JWT_SECRET=your-production-jwt-secret
PORT=5000
CLIENT_URL=https://your-domain.com
```


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

