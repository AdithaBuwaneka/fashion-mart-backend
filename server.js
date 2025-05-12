const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const { errorHandler, notFound } = require('./middleware/error.middleware');
const { logger, stream } = require('./utils/logger');
const routes = require('./routes');
const db = require('./models');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Set up middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CLIENT_URL || '*', // Allow specific origin or any in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
}));
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request body
app.use(morgan('combined', { stream })); // HTTP request logging

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/reports', express.static(path.join(__dirname, 'reports')));

// API routes
app.use('/api', routes);

// Error handling middleware
app.use(notFound); // 404 Not Found
app.use(errorHandler); // Global error handler

// Set port
const PORT = process.env.PORT || 5000;

// Sync database and start server
const startServer = async () => {
  try {
    // Sync database models
    await db.sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    logger.info('Database connected and synced');
    
    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();