import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { getConfig } from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import messageRoutes from './routes/messages.js';
import conversationRoutes from './routes/conversations.js';

// Import middleware
import { handleErrors } from './middleware/auth.js';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const config = getConfig();

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// Error handling middleware
app.use(handleErrors);

// Socket.io connection
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins
  socket.on('user_join', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('online_users', Array.from(onlineUsers.keys()));
    console.log('User joined:', userId);
  });

  // Join and leave conversation rooms
  socket.on('join_conversation', (conversationId) => {
    if (conversationId) {
      socket.join(conversationId);
    }
  });

  socket.on('leave_conversation', (conversationId) => {
    if (conversationId) {
      socket.leave(conversationId);
    }
  });

  // Send message event
  socket.on('send_message', (data) => {
    const { conversationId, message } = data;
    if (!conversationId) {
      return;
    }

    // Emit to other users in the conversation room
    socket.to(conversationId).emit('receive_message', {
      conversationId,
      message
    });
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { conversationId, userId } = data;
    if (!conversationId) return;
    socket.to(conversationId).emit('user_typing', {
      conversationId,
      userId
    });
  });

  // Stop typing
  socket.on('stop_typing', (data) => {
    const { conversationId, userId } = data;
    if (!conversationId) return;
    socket.to(conversationId).emit('user_stop_typing', {
      conversationId,
      userId
    });
  });

  // User disconnect
  socket.on('disconnect', () => {
    // Find and remove user from onlineUsers
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit('online_users', Array.from(onlineUsers.keys()));
        console.log('User disconnected:', userId);
        break;
      }
    }
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// MongoDB connection
mongoose
  .connect(config.mongoUri)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Start server
server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});

export default server;
