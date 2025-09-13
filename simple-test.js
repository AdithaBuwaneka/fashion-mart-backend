#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testEndpoint(method, endpoint, headers = {}, description = '') {
  try {
    console.log(`\n🧪 Testing: ${description || endpoint}`);
    
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers,
      timeout: 5000
    };
    
    const response = await axios(config);
    console.log(`✅ SUCCESS (${response.status}):`, JSON.stringify(response.data).substring(0, 100) + '...');
    return { success: true, status: response.status, data: response.data };
    
  } catch (error) {
    const status = error.response?.status || 'NO_RESPONSE';
    const message = error.response?.data?.message || error.message;
    console.log(`❌ FAILED (${status}): ${message}`);
    return { success: false, status, error: message };
  }
}

async function runSimpleTests() {
  console.log('🚀 Fashion Mart Backend - Simple Test Suite');
  console.log('=' * 50);
  
  // Test 1: Health Check (Public)
  await testEndpoint('GET', '/health', {}, 'Health Check (Public)');
  
  // Test 2: Products Endpoint (Public)
  await testEndpoint('GET', '/products', {}, 'Get Products (Public)');
  
  // Test 3: Categories Endpoint (Public)  
  await testEndpoint('GET', '/categories', {}, 'Get Categories (Public)');
  
  // Test 4: Protected Endpoint without Auth
  await testEndpoint('GET', '/admin/users', {}, 'Admin Users (No Auth)');
  
  // Test 5: Protected Endpoint with Invalid Token
  const invalidAuth = { 'Authorization': 'Bearer invalid_token' };
  await testEndpoint('GET', '/admin/users', invalidAuth, 'Admin Users (Invalid Token)');
  
  // Test 6: Protected Endpoint with Mock JWT
  const mockJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsImlhdCI6MTYzMDAwMDAwMCwiZXhwIjo5OTk5OTk5OTk5fQ.test';
  const validAuth = { 'Authorization': `Bearer ${mockJWT}` };
  await testEndpoint('GET', '/admin/users', validAuth, 'Admin Users (Mock Token)');
  
  // Test 7: Customer Endpoints
  await testEndpoint('GET', '/customer/orders', validAuth, 'Customer Orders');
  
  // Test 8: Designer Endpoints
  await testEndpoint('GET', '/designer/designs', validAuth, 'Designer Designs');
  
  // Test 9: Staff Endpoints
  await testEndpoint('GET', '/staff/orders', validAuth, 'Staff Orders');
  
  // Test 10: Inventory Endpoints
  await testEndpoint('GET', '/inventory/products', validAuth, 'Inventory Products');
  
  console.log('\n🏁 Simple tests completed!');
}

// Run the tests
runSimpleTests().catch(console.error);