const jwt = require('jsonwebtoken');

// Create a test JWT token for our admin user
const adminUserId = 'admin_user_123';
const jwtSecret = process.env.JWT_SECRET || 'fashionmart-jwt-secret-key-change-in-production';

// Create a Clerk-style token with 'sub' claim
const adminToken = jwt.sign(
  {
    sub: adminUserId,  // Clerk uses 'sub' for user ID
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User'
  },
  jwtSecret,
  { expiresIn: '24h' }
);

console.log('Admin JWT Token:');
console.log(adminToken);