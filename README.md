# Telegram-Like Chat Application

A real-time chat application built with MERN stack (MongoDB, Express, React, Node.js) featuring user authentication, messaging, and real-time notifications using WebSockets.

## Features

- **User Authentication**: JWT-based authentication system
- **Real-time Messaging**: Socket.io for instant message delivery
- **User Management**: Create, search, and manage users
- **Chat Rooms/Conversations**: One-on-one and group chats
- **Online Status**: Real-time user presence tracking
- **Message History**: Persistent message storage
- **Responsive UI**: Modern React interface

## Project Structure

```
├── backend/                 # Express.js server
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── config/             # Configuration files
│   └── server.js           # Main server file
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── context/       # Context API
│   │   └── App.js         # Main app component
│   └── public/            # Static files
└── README.md              # This file
```

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB & Mongoose
- Socket.io
- JWT for authentication
- Bcryptjs for password hashing

### Frontend
- React 18
- React Router
- Socket.io-client
- Axios for API calls
- Tailwind CSS (styling)
- Context API for state management

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat_app
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

Start the backend:
```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend folder:
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

Start the frontend:
```bash
npm start
```

## API Endpoints

### Auth Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### User Routes
- `GET /api/users` - Get all users
- `GET /api/users/search?q=query` - Search users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile

### Message Routes
- `POST /api/messages` - Send a message
- `GET /api/messages/conversation/:conversationId` - Get messages in a conversation
- `GET /api/messages/:id` - Get a single message
- `DELETE /api/messages/:id` - Delete a message

### Conversation Routes
- `POST /api/conversations` - Create a conversation
- `GET /api/conversations` - Get user's conversations
- `GET /api/conversations/:id` - Get conversation details
- `PUT /api/conversations/:id` - Update conversation

## WebSocket Events

### Client to Server
- `connect` - User connects
- `disconnect` - User disconnects
- `send_message` - Send a message
- `typing` - User is typing
- `stop_typing` - User stopped typing

### Server to Client
- `receive_message` - Receive a message
- `user_typing` - User is typing
- `user_stop_typing` - User stopped typing
- `online_users` - List of online users
- `user_online` - User came online
- `user_offline` - User went offline

## Running the Application

1. Start MongoDB service
2. Run backend: `cd backend && npm run dev`
3. Run frontend: `cd frontend && npm start`
4. Open `http://localhost:3000` in your browser

## Development

### Backend Development
```bash
cd backend
npm run dev    # Runs with nodemon
npm test       # Run tests
```

### Frontend Development
```bash
cd frontend
npm start      # Development server
npm test       # Run tests
```

## Future Enhancements

- [ ] File sharing and media uploads
- [ ] Voice and video calls
- [ ] End-to-end encryption
- [ ] Message reactions/emojis
- [ ] Scheduled messages
- [ ] Message search
- [ ] Dark mode
- [ ] Mobile app (React Native)

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository.
