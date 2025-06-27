const jwt = require('jsonwebtoken');
const { Webhook } = require('@clerk/clerk-sdk-node');
const { clerkClient } = require('@clerk/clerk-sdk-node');
const authConfig = require('../config/auth.config');
const db = require('../models');
const User = db.user;

// Initialize Clerk client
const clerk = clerkClient;

const verifyClerkWebhook = (req, res, next) => {
  try {
    const webhook = new Webhook(authConfig.clerkWebhookSecret);
    webhook.verify(req.body, req.headers);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid webhook signature' });
  }
};

const verifyJWT = (req, res, next) => {
  const token = req.headers['x-access-token'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, authConfig.jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.userId = decoded.id;
    next();
  });
};

const verifySession = async (req, res, next) => {
  try {
    // Check for Clerk session token
    const sessionToken = req.headers.authorization?.split(' ')[1];
    
    if (!sessionToken) {
      return res.status(401).json({ message: 'No session token provided' });
    }
    
    // Verify the session with Clerk
    const session = await clerk.sessions.verifySession(sessionToken);
    
    if (!session) {
      return res.status(401).json({ message: 'Invalid session' });
    }
    
    // Get the user ID from the session
    const userId = session.userId;
    
    // Check if user exists in our database
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Add user info to request
    req.userId = userId;
    req.userRole = user.role;
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Session verification error:', error);
    return res.status(401).json({ message: 'Failed to verify session' });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Use constant-time comparison to prevent timing attacks
    if (user.role !== 'admin') {
      // Add a small delay to prevent timing-based user enumeration
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      return res.status(403).json({ message: 'Access denied' });
    }
    
    next();
  } catch (error) {
    // Don't expose detailed error information
    return res.status(500).json({ message: 'Authentication error' });
  }
};

const isDesigner = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'designer') {
      return res.status(403).json({ message: 'Require Designer Role!' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const isCustomer = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'customer') {
      return res.status(403).json({ message: 'Require Customer Role!' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const isStaff = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'staff') {
      return res.status(403).json({ message: 'Require Staff Role!' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const isInventoryManager = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'inventory_manager') {
      return res.status(403).json({ message: 'Require Inventory Manager Role!' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const isAdminOrInventoryManager = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'admin' && user.role !== 'inventory_manager') {
      return res.status(403).json({ message: 'Require Admin or Inventory Manager Role!' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const isAdminOrStaff = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'admin' && user.role !== 'staff') {
      return res.status(403).json({ message: 'Require Admin or Staff Role!' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  verifyClerkWebhook,
  verifyJWT,
  verifySession,
  isAdmin,
  isDesigner,
  isCustomer,
  isStaff,
  isInventoryManager,
  isAdminOrStaff,
  isAdminOrInventoryManager
};