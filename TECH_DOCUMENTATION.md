# CampusSkillSwap - Complete Technical Documentation

## 📋 Project Overview

**CampusSkillSwap** is a full-stack MERN (MongoDB, Express, React, Node.js) web application that enables college students to connect, share skills, and learn from each other within their campus community. Students can create profiles showcasing skills they can teach and skills they want to learn, send friend requests, engage in real-time chat conversations, propose skill exchange sessions, and provide feedback ratings to build reputation within the platform.

### Key Highlights
- **Real-time Communication**: Live chat messaging using WebSocket technology
- **Campus-Verified Users**: Email domain validation ensures only authorized campus students can register
- **Skill Matching**: Smart algorithms connect students based on complementary skills
- **Reputation System**: Feedback and ratings create a trusted learning community
- **Admin Dashboard**: Comprehensive moderation and analytics tools
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices

---

## 📁 Folder Structure

### Root Level
```
CampusSkillSwap/
├── automation/          # Selenium WebDriver automated testing scripts
├── client/             # React frontend application
├── server/             # Express backend API server
├── package.json        # Root package with concurrent script runners
├── README.md           # Project setup and usage guide
└── SAMPLE_CREDENTIALS.md # Demo account credentials for testing
```
### Client Folder (`client/`)
```
client/
├── public/             # Static assets (index.html, manifest, icons)
├── src/
│   ├── components/     # Reusable React components
│   │   ├── auth/       # Authentication guards (ProtectedRoute, AdminRoute)
│   │   └── layout/     # Layout components (Navbar, NotificationMenu, PageLayout)
│   ├── context/        # React Context API providers
│   │   ├── AuthContext.js        # User authentication state
│   │   ├── NotificationContext.js # Notification management
│   │   └── SocketContext.js      # Socket.io connection manager
│   ├── pages/          # Page-level components
│   │   ├── auth/       # Login and Register pages
│   │   ├── admin/      # Admin dashboard, user management, feedback moderation
│   │   └── *.js        # Dashboard, Profile, Chat, Friends, Feedback pages
│   ├── services/       # API service layer (axios instances)
│   ├── App.js          # Main app component with routing
│   ├── index.js        # React DOM rendering with theme configuration
│   └── index.css       # Global styles
└── package.json        # Frontend dependencies
```

### Server Folder (`server/`)
```
server/
├── middleware/         # Express middleware functions
│   ├── auth.js         # JWT token verification
│   └── validation.js   # Input validation schemas
├── models/            # Mongoose database schemas
│   ├── User.js         # User profile schema
│   ├── FriendRequest.js # Friend relationship schema
│   ├── Chat.js         # Chat messages schema
│   ├── Feedback.js     # Ratings and reviews schema
│   └── Session.js      # Skill exchange session schema
├── routes/            # Express route handlers
│   ├── auth.js         # Registration, login, token refresh
│   ├── users.js        # User profile management
│   ├── friends.js      # Friend request operations
│   ├── chat.js         # Chat message CRUD
│   ├── feedback.js     # Feedback submission and retrieval
│   ├── session.js      # Skill swap session management
│   └── admin.js        # Admin panel operations
├── index.js           # Express server entry point with Socket.io
├── env.example        # Environment variable template
└── package.json       # Backend dependencies
```

### Automation Folder (`automation/`)
```
automation/
├── test.js            # Selenium automated UI testing script
└── package.json       # Testing dependencies
```

---

## 🛠️ Complete Technology Stack

### **Core Technologies (MERN Stack)**

#### 1. **MongoDB**
- **Type**: NoSQL Database
- **Version**: Compatible with Mongoose 8.x
- **Use in Project**: 
  - Stores user profiles, friend relationships, chat messages, feedback, and session data
  - Provides flexible schema design for evolving data models
  - Supports indexing for fast skill-based search queries

#### 2. **Express.js** (v4.18.2)
- **Type**: Backend Web Framework
- **Use in Project**:
  - Creates RESTful API endpoints for all CRUD operations
  - Handles HTTP request/response cycle
  - Middleware pipeline for authentication and validation
  - Serves as foundation for WebSocket server integration

#### 3. **React** (v18.2.0)
- **Type**: Frontend JavaScript Library
- **Use in Project**:
  - Builds single-page application with component-based architecture
  - Manages UI state with hooks (useState, useEffect, useContext)
  - Provides virtual DOM for efficient rendering
  - Handles client-side routing and navigation

#### 4. **Node.js**
- **Type**: JavaScript Runtime Environment
- **Use in Project**:
  - Runs the Express server and processes backend logic
  - Handles asynchronous I/O operations efficiently
  - Manages concurrent Socket.io connections
  - Executes scheduled tasks and background jobs

---

## 📦 Frontend Dependencies (Client)

### **UI Framework & Components**

#### 5. **@mui/material** (v5.14.20)
- **Type**: React Component Library
- **Use in Project**:
  - Provides pre-built Material Design components (Button, Card, TextField, Dialog, etc.)
  - Ensures consistent design language across the application
  - Responsive grid system for layout management
  - Built-in accessibility features (ARIA attributes)

#### 6. **@mui/icons-material** (v5.14.19)
- **Type**: Icon Library
- **Use in Project**:
  - Material Design icons for navigation, actions, and status indicators
  - Used in Navbar, buttons, user profiles, and notifications
  - Provides visual clarity for user actions (send, delete, edit, etc.)

#### 7. **@mui/x-data-grid** (v6.18.1)
- **Type**: Advanced Data Table Component
- **Use in Project**:
  - Displays user lists in Admin Dashboard with sorting and filtering
  - Shows feedback history with pagination
  - Provides search functionality across large datasets
  - Supports column customization and row selection

#### 8. **@emotion/react** (v11.11.1) & **@emotion/styled** (v11.11.0)
- **Type**: CSS-in-JS Library
- **Use in Project**:
  - Required peer dependencies for Material UI styling
  - Enables dynamic styling based on component props
  - Provides theme customization and responsive styles
  - Optimizes CSS delivery with scoped styles

---

### **HTTP Client & API**

#### 9. **axios** (v1.6.2)
- **Type**: HTTP Client Library
- **Use in Project**:
  - Makes API requests to backend Express server
  - Configured with interceptors for automatic JWT token attachment
  - Handles request/response transformations
  - Provides centralized error handling and retry logic
  - Used in `services/api.js` for all API calls

---

### **Routing**

#### 10. **react-router-dom** (v6.18.0)
- **Type**: Client-Side Routing Library
- **Use in Project**:
  - Manages navigation between pages without full page reloads
  - Defines route protection with `ProtectedRoute` and `AdminRoute` components
  - Provides URL parameter extraction for dynamic pages (e.g., `/profile/:userId`)
  - Supports programmatic navigation with `useNavigate` hook

---

### **Form Management**

#### 11. **react-hook-form** (v7.48.2)
- **Type**: Form Validation Library
- **Use in Project**:
  - Manages form state for registration, login, profile editing, and feedback forms
  - Provides efficient re-rendering with uncontrolled components
  - Integrates with Material UI components via `Controller`
  - Handles validation rules and error messages

---

### **Notifications**

#### 12. **react-hot-toast** (v2.4.1)
- **Type**: Toast Notification Library
- **Use in Project**:
  - Displays success/error/info messages to users
  - Shows feedback for API operations (friend request sent, message delivered, etc.)
  - Positioned at top-right with 4-second auto-dismiss
  - Used throughout the app for user feedback

---

### **Real-Time Communication**

#### 13. **socket.io-client** (v4.7.4)
- **Type**: WebSocket Client Library
- **Use in Project**:
  - Establishes persistent connection to backend Socket.io server
  - Enables real-time chat messaging between friends
  - Manages typing indicators and online status
  - Handles automatic reconnection on network interruptions
  - Managed through `SocketContext.js` provider

---

### **Date Handling**

#### 14. **date-fns** (v2.30.0)
- **Type**: Date Utility Library
- **Use in Project**:
  - Formats message timestamps in chat interface (e.g., "2 hours ago")
  - Displays feedback submission dates
  - Handles date comparisons for session scheduling
  - Lightweight alternative to moment.js with tree-shaking support

---

### **UI Enhancements**

#### 15. **emoji-picker-react** (v4.15.0)
- **Type**: Emoji Picker Component
- **Use in Project**:
  - Provides emoji selection popup in chat interface
  - Enhances message expressiveness
  - Supports search and categorized emoji browsing

---

### **Build Tools**

#### 16. **react-scripts** (v5.0.1)
- **Type**: Create React App Build Scripts
- **Use in Project**:
  - Bundles React application with Webpack
  - Provides development server with hot module reloading
  - Handles Babel transpilation for modern JavaScript
  - Includes ESLint and Jest testing configurations
  - Creates optimized production builds with code splitting

---

## 📦 Backend Dependencies (Server)

### **Database & ODM**

#### 17. **mongoose** (v8.0.3)
- **Type**: MongoDB Object Data Modeling (ODM) Library
- **Use in Project**:
  - Defines database schemas with validation rules (User, Chat, Feedback, etc.)
  - Provides query builder for database operations
  - Manages relationships between collections (population)
  - Includes middleware for pre/post hooks (password hashing before save)
  - Handles data validation and type casting

---

### **Authentication & Security**

#### 18. **bcryptjs** (v2.4.3)
- **Type**: Password Hashing Library
- **Use in Project**:
  - Hashes user passwords before storing in database (12 salt rounds)
  - Compares plaintext passwords with hashed passwords during login
  - Protects against rainbow table attacks
  - Used in User model pre-save middleware

#### 19. **jsonwebtoken** (v9.0.2)
- **Type**: JSON Web Token Implementation
- **Use in Project**:
  - Generates JWT tokens on successful login/registration (7-day expiration)
  - Encodes user ID and role in token payload
  - Verifies tokens in authentication middleware
  - Provides stateless authentication mechanism

---

### **Middleware & Validation**

#### 20. **cors** (v2.8.5)
- **Type**: Cross-Origin Resource Sharing Middleware
- **Use in Project**:
  - Allows frontend (localhost:3000) to make requests to backend (localhost:5000)
  - Configures allowed origins, methods, and credentials
  - Essential for development with separate frontend/backend servers

#### 21. **express-validator** (v7.0.1)
- **Type**: Server-Side Validation Library
- **Use in Project**:
  - Validates and sanitizes API request data
  - Defines validation schemas in `middleware/validation.js`
  - Checks email format, password strength, required fields
  - Returns detailed error messages for invalid input

---

### **Environment Configuration**

#### 22. **dotenv** (v16.3.1)
- **Type**: Environment Variable Loader
- **Use in Project**:
  - Loads configuration from `.env` file (MongoDB URI, JWT secret, allowed domains)
  - Keeps sensitive data out of version control
  - Enables different configs for development/production environments

---

### **Real-Time Communication**

#### 23. **socket.io** (v4.7.4)
- **Type**: WebSocket Server Library
- **Use in Project**:
  - Enables bi-directional real-time communication with clients
  - Manages user rooms for targeted message delivery
  - Handles connection/disconnection events
  - Broadcasts typing indicators and message delivery confirmations
  - Integrated with Express server via HTTP server upgrade

---

### **File Upload**

#### 24. **multer** (v1.4.5-lts.1)
- **Type**: Multipart/Form-Data Middleware
- **Use in Project**:
  - Handles profile picture uploads
  - Configures file storage location and naming
  - Validates file types and sizes
  - Processes form data with mixed text and file fields

---

### **Development Tools**

#### 25. **nodemon** (v3.0.2)
- **Type**: Development Server with Auto-Restart
- **Use in Project**:
  - Monitors server files for changes
  - Automatically restarts server on code modifications
  - Improves development workflow by eliminating manual restarts
  - Used in `npm run dev` script

---

## 📦 Automation Dependencies

#### 26. **selenium-webdriver** (v4.40.0)
- **Type**: Browser Automation Framework
- **Use in Project**:
  - Automates end-to-end testing of user workflows
  - Simulates user interactions (registration, login, search, chat)
  - Tests cross-browser compatibility
  - Validates UI functionality and user flows in `automation/test.js`

#### 27. **chromedriver** (v145.0.1)
- **Type**: Chrome Browser Driver
- **Use in Project**:
  - Enables Selenium to control Google Chrome browser
  - Required dependency for Selenium WebDriver
  - Matches Chrome browser version for compatibility
  - Executes automated UI tests in Chrome environment

---

## 📦 Root Development Dependencies

#### 28. **concurrently** (v8.2.2)
- **Type**: Multi-Command Runner
- **Use in Project**:
  - Runs frontend and backend servers simultaneously with `npm run dev`
  - Displays logs from both servers in single terminal
  - Simplifies development workflow
  - Handles process termination gracefully

---

## 🎯 Technology Categories Summary

### **Frontend Stack**
- **Framework**: React 18.2.0
- **UI Library**: Material UI 5.14.20
- **Routing**: React Router 6.18.0
- **State Management**: Context API (AuthContext, SocketContext, NotificationContext)
- **HTTP Client**: Axios 1.6.2
- **Form Handling**: React Hook Form 7.48.2
- **Styling**: Emotion (CSS-in-JS)
- **Real-time**: Socket.io Client 4.7.4
- **Notifications**: React Hot Toast 2.4.1
- **Date Formatting**: date-fns 2.30.0
- **Build Tool**: React Scripts 5.0.1 (Webpack, Babel)

### **Backend Stack**
- **Framework**: Express 4.18.2
- **Database**: MongoDB with Mongoose 8.0.3
- **Authentication**: JWT (jsonwebtoken 9.0.2) + bcryptjs 2.4.3
- **Real-time**: Socket.io 4.7.4
- **Validation**: Express Validator 7.0.1
- **File Upload**: Multer 1.4.5
- **Security**: CORS 2.8.5
- **Configuration**: dotenv 16.3.1

### **Testing & Automation**
- **Framework**: Selenium WebDriver 4.40.0
- **Browser Driver**: ChromeDriver 145.0.1

### **Development Tools**
- **Backend Watcher**: Nodemon 3.0.2
- **Process Manager**: Concurrently 8.2.2
- **Package Manager**: npm (Node Package Manager)

---

## 🚀 Module Installation Commands

### Install All Dependencies
```bash
# From root directory - installs root, client, and server dependencies
npm run install-all
```

### Install Individual Sections
```bash
# Root dependencies
npm install

# Frontend only
cd client && npm install

# Backend only
cd server && npm install

# Automation only
cd automation && npm install
```

---

## 📊 Dependency Statistics

- **Total Frontend Dependencies**: 15 packages
- **Total Backend Dependencies**: 8 packages + 1 dev dependency
- **Total Automation Dependencies**: 2 packages
- **Root Dev Dependencies**: 1 package
- **Grand Total**: 27 unique npm packages

---

## 🔗 Technology Links

| Technology | Official Documentation |
|-----------|----------------------|
| React | https://react.dev |
| Express | https://expressjs.com |
| MongoDB | https://www.mongodb.com/docs |
| Mongoose | https://mongoosejs.com |
| Socket.io | https://socket.io/docs |
| Material UI | https://mui.com |
| React Router | https://reactrouter.com |
| Axios | https://axios-http.com |
| JWT | https://jwt.io |
| Selenium | https://www.selenium.dev |

---

## 📝 Notes

- **Node.js Version**: Requires Node.js v14 or higher
- **MongoDB**: Can use local instance or MongoDB Atlas cloud database
- **Environment**: Separate `.env` file required in `server/` directory
- **Browser Support**: Modern browsers with ES6+ support
- **Mobile**: Responsive design works on all screen sizes

---

**Last Updated**: February 19, 2026  
**Project Version**: 1.0.0  
**License**: MIT
