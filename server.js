const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const morgan = require('morgan');
const dotenv = require('dotenv');
// Load environment variables
dotenv.config();

// Validate environment variables
const { validateEnvironment } = require('./utils/env-validator');
try {
  validateEnvironment();
} catch (error) {
  console.error('Environment validation failed:', error.message);
  process.exit(1);
}

const path = require('path');
const { errorHandler, notFound } = require('./middleware/error.middleware');
const { sanitizeInput } = require('./middleware/sanitize.middleware');
const { securityLogger } = require('./middleware/security-logger.middleware');
const { logger, stream } = require('./utils/logger');
const routes = require('./routes');
const db = require('./models');

// Initialize express app
const app = express();

// Set up middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true
})); // Enhanced security headers
app.use(cors({
  origin: process.env.CLIENT_URL || false, // Only allow specific origins, no wildcard
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
  credentials: true // Allow credentials to be sent with requests
}));
app.use(express.json({ limit: '10mb' })); // Parse JSON request body with size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded request body with size limit

// Rate limiting (Generous for testing)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Allow 1000 requests per windowMs for testing
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Speed limiter (Generous for testing)
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 500, // Allow 500 requests per 15 minutes before delays
  delayMs: () => 100, // Reduced delay for testing
  maxDelayMs: 2000, // Maximum delay of 2 seconds
  validate: { delayMs: false } // disable the warning message
});

app.use('/api/', limiter);
app.use('/api/', speedLimiter);

// Input sanitization
app.use(sanitizeInput);

// Security logging
app.use(securityLogger);

app.use(morgan('combined', { stream })); // HTTP request logging

// Swagger Documentation Setup
const { specs, swaggerUi } = require('./swagger');

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Fashion Mart API Documentation'
}));

// ReDoc Alternative
app.get('/redoc', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Fashion Mart API - ReDoc</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
        <style>
          body { margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        <redoc spec-url='/api-docs-json'></redoc>
        <script src="https://cdn.jsdelivr.net/npm/redoc@2.0.0/bundles/redoc.standalone.js"></script>
      </body>
    </html>
  `);
});

// JSON API spec endpoint for ReDoc
app.get('/api-docs-json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Documentation redirect
app.get('/docs', (req, res) => {
  res.redirect('/api-docs');
});

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
    // Test database connection first
    await db.sequelize.authenticate();
    logger.info('Database connection has been established successfully');
    
    // Check if tables exist before syncing
    const [results] = await db.sequelize.query(
      "SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'fashionmart' AND TABLE_NAME = 'users'"
    );
    
    const tablesExist = results[0].count > 0;
    
    if (!tablesExist) {
      // Only sync if tables don't exist
      logger.info('Tables do not exist, creating them...');
      await db.sequelize.sync({ force: false });
      logger.info('Database tables created successfully');
    } else {
      logger.info('Tables already exist, skipping sync to avoid key conflicts');
    }
    
    logger.info('Database connected and ready');
    
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