export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat_app';
    console.log('Connecting to MongoDB:', mongoUri);
    // Mongoose connection handled in server.js
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

export const getConfig = () => ({
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/chat_app',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
});
