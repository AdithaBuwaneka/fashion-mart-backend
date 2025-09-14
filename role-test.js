const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'fashionmart-jwt-secret-key-change-in-production';

// Create tokens for all roles
const tokens = {
  customer: jwt.sign({ sub: 'test_user_123', role: 'customer' }, jwtSecret, { expiresIn: '24h' }),
  admin: jwt.sign({ sub: 'admin_user_123', role: 'admin' }, jwtSecret, { expiresIn: '24h' }),
  designer: jwt.sign({ sub: 'designer_user_123', role: 'designer' }, jwtSecret, { expiresIn: '24h' }),
  staff: jwt.sign({ sub: 'staff_user_123', role: 'staff' }, jwtSecret, { expiresIn: '24h' }),
  inventory_manager: jwt.sign({ sub: 'inventory_user_123', role: 'inventory_manager' }, jwtSecret, { expiresIn: '24h' })
};

console.log('=== ROLE TOKENS ===');
Object.entries(tokens).forEach(([role, token]) => {
  console.log(`${role.toUpperCase()}: ${token}`);
});

console.log('\n=== CURL COMMANDS FOR TESTING ===');
console.log('\n1. Test Customer Profile (should work):');
console.log(`curl -X GET "http://localhost:5000/api/customer/profile" -H "Authorization: Bearer ${tokens.customer}"`);

console.log('\n2. Test Designer Access (should work):');
console.log(`curl -X GET "http://localhost:5000/api/designer/designs" -H "Authorization: Bearer ${tokens.designer}"`);

console.log('\n3. Test Staff Access (should work):');
console.log(`curl -X GET "http://localhost:5000/api/staff/orders/pending" -H "Authorization: Bearer ${tokens.staff}"`);

console.log('\n4. Test Inventory Access (should work):');
console.log(`curl -X GET "http://localhost:5000/api/inventory/products" -H "Authorization: Bearer ${tokens.inventory_manager}"`);

console.log('\n5. Test Customer trying Admin (should fail):');
console.log(`curl -X GET "http://localhost:5000/api/admin/users" -H "Authorization: Bearer ${tokens.customer}"`);

console.log('\n6. Test Admin Access (should work):');
console.log(`curl -X GET "http://localhost:5000/api/admin/users" -H "Authorization: Bearer ${tokens.admin}"`);