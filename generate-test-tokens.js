const jwt = require('jsonwebtoken');

// Mock Clerk JWT structure for testing
const generateTestToken = (userId, role = 'customer') => {
  const payload = {
    sub: userId, // Clerk uses 'sub' for user ID
    role: role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };

  // Using a simple secret for testing (not production safe)
  return jwt.sign(payload, 'fashionmart-jwt-secret-key-change-in-production');
};

// Generate tokens for test users
const tokens = {
  admin: generateTestToken('user_test_admin_123', 'admin'),
  designer: generateTestToken('user_test_designer_456', 'designer'),
  customer: generateTestToken('user_test_customer_789', 'customer'),
  inventory: generateTestToken('user_test_inventory_999', 'inventory_manager')
};

console.log('Test JWT Tokens:');
console.log('================');
Object.entries(tokens).forEach(([role, token]) => {
  console.log(`${role.toUpperCase()}: ${token}\n`);
});