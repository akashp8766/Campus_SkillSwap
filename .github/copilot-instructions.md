# Campus SkillSwap - AI Agent Instructions

## Project Overview
MERN stack campus skill-sharing platform with real-time chat, friend system, and feedback ratings. Students connect via campus emails to exchange skills.

## Architecture & Stack

### Backend (Port 5000)
- **Express** server in `server/index.js` with Socket.io for real-time features
- **MongoDB** with Mongoose ODM - connection string in `.env`
- **JWT auth** (7-day expiration) via `middleware/auth.js`
- **Routes pattern**: All routes under `/api/*` - auth, users, friends, chat, feedback, admin
- **Campus email validation**: `ALLOWED_DOMAINS` env var validates registration domains

### Frontend (Port 3000)
- **React 18** with functional components and hooks only
- **Material UI 5** - consistent theme in `index.js` (primary: #1976d2, secondary: #dc004e)
- **Context API** for state: `AuthContext` (user/token), `SocketContext` (real-time)
- **React Router 6** with `ProtectedRoute` and `AdminRoute` wrappers
- **react-hot-toast** for notifications - already configured in `App.js`

## Critical Development Workflows

### Setup & Running
```powershell
# Install all dependencies (root, client, server)
npm run install-all

# Run dev mode (both servers concurrently)
npm run dev

# Client only: cd client; npm start
# Server only: cd server; npm run dev
```

### Environment Setup
Server requires `server/.env` with:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Token signing key
- `ALLOWED_DOMAINS` - Comma-separated campus domains (e.g., "university.edu,college.edu")
- `CLIENT_URL` - CORS origin (default: http://localhost:3000)

## Key Conventions & Patterns

### Authentication Flow
1. **Login/Register** returns `{ token, user }` - store token in localStorage
2. **Protected API calls** use `api` instance (auto-adds Bearer token via interceptor)
3. **Auth routes** use `authAPI` instance (no token)
4. **Middleware chain**: All protected routes use `auth` middleware, admin routes add `adminAuth`
5. **Token refresh**: 401 response auto-redirects to `/login` via axios interceptor

### API Service Layer (`client/src/services/api.js`)
- **Two axios instances**: `authAPI` (public), `api` (auth'd)
- **Service pattern**: Export `userService`, `friendService`, `chatService`, etc. with named methods
- **Never call axios directly** in components - use service functions
- Example: `await userService.getUsers({ page: 1, limit: 10 })`

### Route Structure
- **Auth endpoints**: No middleware - `/api/auth/*`
- **Protected endpoints**: `auth` middleware - `/api/users`, `/api/friends`, `/api/chat`, `/api/feedback`
- **Admin endpoints**: `auth` + `adminAuth` middleware - `/api/admin/*`
- **Route handler pattern**: `router.method('/path', [validation], async (req, res) => { ... })`

### Socket.io Real-time Communication
- **Server**: Socket instance in `server/index.js` as `io` variable
- **Client**: `SocketContext.js` manages connection - access via `useSocket()` hook
- **Room pattern**: Users join room with their userId on connect
- **Events**:
  - `join(userId)` - Join personal room on connect
  - `sendMessage({ senderId, receiverId, message })` - Send private message
  - `receiveMessage` - Listen for incoming messages
  - `typing({ senderId, receiverId, isTyping })` - Typing indicators

### Model Patterns
- **Password hashing**: Pre-save middleware in User model (bcrypt salt rounds: 12)
- **Instance methods**: `comparePassword()`, `updateLastActive()`, `updateReputation()`
- **toJSON override**: Automatically removes password from responses
- **Indexes**: Defined on frequently queried fields (email, studentId, skills)

### Component Patterns
- **Form validation**: Use `react-hook-form` with `Controller` for MUI components
- **Loading states**: Always show loading UI during async operations
- **Error handling**: Try-catch blocks with toast notifications
- **Protected pages**: Wrap in `<ProtectedRoute>` or `<AdminRoute>` in `App.js`
- **Context usage**: `const { user, token, login } = useAuth();` or `const { socket, sendMessage } = useSocket();`

### UI/UX Standards
- **Material UI components only** - no custom CSS unless necessary
- **Theme spacing**: Use `theme.spacing(n)` - base unit is 8px
- **Cards**: 12px border radius, soft shadow `0 2px 8px rgba(0,0,0,0.1)`
- **Buttons**: `textTransform: 'none'`, 8px border radius
- **Toast position**: top-right, 4s duration (success 3s, error 5s)

## Data Model Relationships
- **User** ↔ **FriendRequest** (sender/receiver) - status: pending/accepted/declined
- **User** ↔ **Chat** (participants array) - messages subdocuments with sender/content/timestamp
- **User** ↔ **Feedback** (reviewer/reviewee) - rating 1-5, affects User.averageRating
- **User** ↔ **SkillSwap** - skill exchange proposals and sessions

## Common Tasks

### Adding New Protected Route
1. Create route handler in `server/routes/*.js` with `auth` middleware
2. Add service function in `client/src/services/api.js` using `api` instance
3. Create page component in `client/src/pages/`
4. Add route to `App.js` wrapped in `<ProtectedRoute>`

### Adding New Real-time Feature
1. Define socket event handler in `server/index.js` `io.on('connection', ...)`
2. Use `socket.to(userId).emit('eventName', data)` for targeted messages
3. Add event listener in `SocketContext.js` or component
4. Emit events via `socket.emit('eventName', data)`

### Updating User State
- After profile updates: `updateUser(newUserData)` from AuthContext
- After ratings: Call `refreshUser()` to reload from server
- Never mutate user object directly

## Validation Patterns
- **Server-side**: `express-validator` in `middleware/validation.js`
- **Client-side**: `react-hook-form` with Material UI integration
- **Campus email**: Always check domain against `ALLOWED_DOMAINS` on registration
- **Password requirements**: Min 6 chars, must have uppercase, lowercase, digit

## Testing & Debugging
- Check MongoDB connection: Look for "MongoDB connected successfully" console log
- Socket connection: "User connected: [socketId]" logs in server
- Auth issues: Check token in localStorage and Authorization header
- CORS errors: Verify `CLIENT_URL` in `.env` matches frontend origin

## Project-Specific Quirks
- **Symmetrical friends**: FriendRequest must be accepted; creates bidirectional relationship
- **Chat creation**: Automatically created when first message sent between friends
- **Feedback uniqueness**: One feedback per reviewer-reviewee-skill combination
- **Admin detection**: `user.isAdmin` boolean flag, not role-based system
- **Student ID format**: Must be uppercase alphanumeric (enforced in model)
