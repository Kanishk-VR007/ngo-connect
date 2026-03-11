const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

// Health check routes
app.get('/api/health', (req, res) => {
  const mongoStatus = require('./config/database').isConnected();
  res.json({
    status: 'OK',
    message: 'NGO Connect API is running',
    timestamp: new Date().toISOString(),
    database: {
      connected: mongoStatus,
      status: mongoStatus ? 'Connected' : 'Disconnected'
    }
  });
});

// Info route
app.get('/api/health/info', (req, res) => {
  const mongoose = require('mongoose');
  const mongoStatus = require('./config/database').isConnected();

  res.json({
    status: 'OK',
    api: 'NGO Connect API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    database: {
      connected: mongoStatus,
      status: mongoStatus ? 'Connected' : 'Disconnected',
      readyState: mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected'
    },
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      ngos: '/api/ngos',
      services: '/api/services',
      requests: '/api/requests',
      donations: '/api/donations',
      chat: '/api/chat',
      analytics: '/api/analytics',
      events: '/api/events'
    }
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/ngos', require('./routes/ngos'));
app.use('/api/services', require('./routes/services'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/events', require('./routes/events'));
app.use('/api/event-requests', require('./routes/eventRequests'));

// Error handling middleware
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('send_message', (data) => {
    io.to(data.roomId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`API Documentation: http://localhost:${PORT}/api/health/info`);
  console.log(`${'='.repeat(50)}\n`);
});
