const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'fashionmart-jwt-secret-key-change-in-production';

// Create tokens for all demo users
const tokens = {
  admin: jwt.sign({
    sub: 'demo_admin_001',
    email: 'admin@fashionmart.com',
    firstName: 'Admin',
    lastName: 'User'
  }, jwtSecret, { expiresIn: '24h' }),

  designer: jwt.sign({
    sub: 'demo_designer_001',
    email: 'designer@fashionmart.com',
    firstName: 'Designer',
    lastName: 'User'
  }, jwtSecret, { expiresIn: '24h' }),

  staff: jwt.sign({
    sub: 'demo_staff_001',
    email: 'staff@fashionmart.com',
    firstName: 'Staff',
    lastName: 'User'
  }, jwtSecret, { expiresIn: '24h' }),

  inventory_manager: jwt.sign({
    sub: 'demo_inventory_001',
    email: 'inventory@fashionmart.com',
    firstName: 'Inventory',
    lastName: 'Manager'
  }, jwtSecret, { expiresIn: '24h' }),

  customer: jwt.sign({
    sub: 'demo_customer_001',
    email: 'customer@fashionmart.com',
    firstName: 'Customer',
    lastName: 'User'
  }, jwtSecret, { expiresIn: '24h' })
};

console.log('=== FASHION MART BACKEND TEST CREDENTIALS ===\n');

console.log('🔑 USER CREDENTIALS:');
console.log('Admin: admin@fashionmart.com (ID: demo_admin_001)');
console.log('Designer: designer@fashionmart.com (ID: demo_designer_001)');
console.log('Staff: staff@fashionmart.com (ID: demo_staff_001)');
console.log('Inventory Manager: inventory@fashionmart.com (ID: demo_inventory_001)');
console.log('Customer: customer@fashionmart.com (ID: demo_customer_001)');

console.log('\n🎫 JWT TOKENS FOR API TESTING:\n');
Object.entries(tokens).forEach(([role, token]) => {
  console.log(`${role.toUpperCase()}:`);
  console.log(token);
  console.log('');
});

console.log('📋 SAMPLE API CALLS:\n');

console.log('1. Test Admin Dashboard:');
console.log(`curl -X GET "http://localhost:5000/api/admin/dashboard/stats" \\
  -H "Authorization: Bearer ${tokens.admin}"`);

console.log('\n2. Test Customer Profile:');
console.log(`curl -X GET "http://localhost:5000/api/customer/profile" \\
  -H "Authorization: Bearer ${tokens.customer}"`);

console.log('\n3. Test Designer Designs:');
console.log(`curl -X GET "http://localhost:5000/api/designer/designs" \\
  -H "Authorization: Bearer ${tokens.designer}"`);

console.log('\n4. Test Inventory Products:');
console.log(`curl -X GET "http://localhost:5000/api/inventory/products" \\
  -H "Authorization: Bearer ${tokens.inventory_manager}"`);

console.log('\n5. Test Staff Orders:');
console.log(`curl -X GET "http://localhost:5000/api/staff/orders/pending" \\
  -H "Authorization: Bearer ${tokens.staff}"`);

// Save tokens to file for easy access
const fs = require('fs');
fs.writeFileSync('test-tokens.json', JSON.stringify(tokens, null, 2));
console.log('\n💾 Tokens saved to test-tokens.json for easy access');