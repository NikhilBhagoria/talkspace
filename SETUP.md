# MERN Chat Application - Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas account)
- Git

## Installation Steps

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder with the following content:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat_app
JWT_SECRET=your_secure_random_key_here_change_in_production
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**For MongoDB Atlas:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chat_app?retryWrites=true&w=majority
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend folder:

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## Running the Application

### Option 1: Run Both Backend and Frontend Together

From the root directory:
```bash
npm run dev
```

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
npm run backend
```

**Terminal 2 - Frontend:**
```bash
npm run frontend
```

### Backend will start at: http://localhost:5000
### Frontend will start at: http://localhost:3000

## MongoDB Setup

### Local MongoDB
```bash
# Windows (if MongoDB is installed)
mongod

# Or use MongoDB Compass GUI
```

### MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Replace `MONGODB_URI` in `.env` with your connection string

## Testing the Application

1. **Open browser**: http://localhost:3000
2. **Register a new account**:
   - Enter username, email, and password
   - Click "Sign Up"

3. **Login**:
   - Use your credentials to login
   - You'll be redirected to the chat page

4. **Start chatting**:
   - Click "+ New Chat"
   - Select a user to start a conversation
   - Type messages and press Enter or click the send button

## Features to Test

- ✅ User registration and login
- ✅ Real-time messaging
- ✅ User search
- ✅ Online status
- ✅ Typing indicators
- ✅ Message history
- ✅ Multiple conversations
- ✅ Logout functionality

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running or use MongoDB Atlas

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Verify `CORS_ORIGIN` matches frontend URL in backend `.env`

### Socket.io Connection Error
```
WebSocket connection failed
```
**Solution**: Make sure backend is running on port 5000 and frontend `.env` has correct `REACT_APP_SOCKET_URL`

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution**: Change PORT in `.env` or kill the process using the port:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/search?q=query` - Search users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile

### Conversations
- `POST /api/conversations` - Create conversation
- `GET /api/conversations` - Get user's conversations
- `GET /api/conversations/:id` - Get conversation details
- `DELETE /api/conversations/:id` - Delete conversation

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversation/:conversationId` - Get messages
- `DELETE /api/messages/:id` - Delete message
- `PUT /api/messages/:messageId/read` - Mark as read

## Socket.io Events

### Client -> Server
- `user_join` - User joins/connects
- `send_message` - Send a message
- `typing` - User is typing
- `stop_typing` - User stopped typing

### Server -> Client
- `receive_message` - Receive message
- `user_typing` - User typing indicator
- `user_stop_typing` - User stopped typing
- `online_users` - List of online users

## Development Tips

1. **Use Browser DevTools**:
   - Check Network tab for API requests
   - Check Console for errors
   - Use Redux DevTools for state management (if added)

2. **Check Backend Logs**:
   - Terminal running backend shows incoming requests and socket events

3. **Test with Multiple Users**:
   - Open two browser windows
   - Register different users
   - Start chatting between them

## Next Steps / Enhancements

- [ ] Add file upload functionality
- [ ] Implement voice/video calls
- [ ] Add message search
- [ ] Implement end-to-end encryption
- [ ] Create mobile app (React Native)
- [ ] Add dark mode
- [ ] Implement message reactions
- [ ] Add group chat features
- [ ] Implement admin controls
- [ ] Add analytics dashboard

## Support & Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Socket.io Documentation](https://socket.io/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Happy coding! 🚀**
