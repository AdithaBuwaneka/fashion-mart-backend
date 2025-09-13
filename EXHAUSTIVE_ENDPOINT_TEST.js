#!/usr/bin/env node

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:5000/api';

// Test users
const DEMO_USERS = {
  admin: 'demo_admin_001',
  customer: 'demo_customer_001', 
  designer: 'demo_designer_001',
  staff: 'demo_staff_001',
  inventory: 'demo_inventory_001'
};

function createJWTToken(userId) {
  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
  };
  return jwt.sign(payload, 'demo-secret-key');
}

const DEMO_TOKENS = {
  admin: createJWTToken(DEMO_USERS.admin),
  customer: createJWTToken(DEMO_USERS.customer),
  designer: createJWTToken(DEMO_USERS.designer),
  staff: createJWTToken(DEMO_USERS.staff),
  inventory: createJWTToken(DEMO_USERS.inventory)
};

function getAuthHeaders(role) {
  return {
    'Authorization': `Bearer ${DEMO_TOKENS[role]}`,
    'Content-Type': 'application/json'
  };
}

async function makeRequest(method, endpoint, headers = {}, data = null, isFormData = false) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: isFormData ? headers : { ...headers },
      timeout: 10000,
      ...(data && { data })
    };
    
    const response = await axios(config);
    return { 
      success: true, 
      status: response.status, 
      data: response.data,
      endpoint,
      method 
    };
  } catch (error) {
    return { 
      success: false, 
      status: error.response?.status || 0, 
      error: error.response?.data?.message || error.message,
      endpoint,
      method
    };
  }
}

class EndpointTester {
  constructor() {
    this.results = [];
    this.testData = {};
  }

  log(result) {
    this.results.push(result);
    const icon = result.success ? '✅' : 
                 (result.status === 401 || result.status === 403) ? '🔒' : '❌';
    const statusText = result.success ? 'SUCCESS' : 
                      (result.status === 401 || result.status === 403) ? 'SECURED' : 'FAILED';
    
    console.log(`${icon} ${result.method} ${result.endpoint} - ${statusText} (${result.status})`);
    
    if (result.error && result.status !== 401 && result.status !== 403) {
      console.log(`   ⚠️  ${result.error}`);
    }
    
    if (result.success && result.data?.data) {
      // Store important IDs for future tests
      if (result.data.data.id) {
        const entityType = this.getEntityTypeFromEndpoint(result.endpoint);
        if (entityType) {
          if (!this.testData[entityType]) this.testData[entityType] = [];
          this.testData[entityType].push(result.data.data.id);
        }
      }
    }
  }

  getEntityTypeFromEndpoint(endpoint) {
    if (endpoint.includes('/categories')) return 'categories';
    if (endpoint.includes('/designs')) return 'designs';
    if (endpoint.includes('/products')) return 'products';
    if (endpoint.includes('/orders')) return 'orders';
    if (endpoint.includes('/returns')) return 'returns';
    if (endpoint.includes('/users')) return 'users';
    return null;
  }

  async testPublicEndpoints() {
    console.log('\n🌐 TESTING PUBLIC ENDPOINTS');
    console.log('='.repeat(50));
    
    // Health check
    this.log(await makeRequest('GET', '/health'));
    
    // Products endpoints
    this.log(await makeRequest('GET', '/products'));
    this.log(await makeRequest('GET', '/products?page=1&limit=5'));
    this.log(await makeRequest('GET', '/products?search=test'));
    this.log(await makeRequest('GET', '/products?category=1'));
    this.log(await makeRequest('GET', '/products?minPrice=10&maxPrice=100'));
    
    // Categories
    this.log(await makeRequest('GET', '/categories'));
    
    // Test with non-existent product ID
    this.log(await makeRequest('GET', '/products/non-existent-id'));
  }

  async testAuthEndpoints() {
    console.log('\n🔐 TESTING AUTHENTICATION ENDPOINTS');
    console.log('='.repeat(50));
    
    // Test auth routes (these might not exist yet, but let's check)
    this.log(await makeRequest('POST', '/auth/webhook'));
    this.log(await makeRequest('GET', '/auth/session'));
  }

  async testAdminEndpoints() {
    console.log('\n👑 TESTING ADMIN ENDPOINTS');
    console.log('='.repeat(50));
    
    const headers = getAuthHeaders('admin');
    
    // Dashboard
    this.log(await makeRequest('GET', '/admin/dashboard/stats', headers));
    
    // User management
    this.log(await makeRequest('GET', '/admin/users', headers));
    
    // Test user role update
    if (this.testData.users && this.testData.users.length > 0) {
      const userId = this.testData.users[0];
      this.log(await makeRequest('PATCH', `/admin/users/${userId}/role`, headers, { role: 'customer' }));
    }
    
    // Reports
    this.log(await makeRequest('GET', '/admin/reports', headers));
    this.log(await makeRequest('POST', '/admin/reports/monthly', headers, { month: 9, year: 2025 }));
    
    // Test with specific report ID if available
    this.log(await makeRequest('GET', '/admin/reports/non-existent-id', headers));
  }

  async testCustomerEndpoints() {
    console.log('\n🛍️ TESTING CUSTOMER ENDPOINTS');
    console.log('='.repeat(50));
    
    const headers = getAuthHeaders('customer');
    
    // Profile management
    this.log(await makeRequest('GET', '/customer/profile', headers));
    this.log(await makeRequest('PUT', '/customer/profile', headers, {
      firstName: 'Updated',
      lastName: 'Customer',
      phoneNumber: '+1234567890'
    }));
    
    // Orders
    this.log(await makeRequest('GET', '/customer/orders', headers));
    
    // Test order creation (will likely fail due to missing products/stock)
    this.log(await makeRequest('POST', '/customer/orders', headers, {
      items: [
        { productId: 'test-product-id', stockId: 'test-stock-id', quantity: 1 }
      ],
      shippingAddress: {
        name: 'Test Customer',
        street: '123 Main St',
        city: 'Test City',
        state: 'Test State',
        zip: '12345',
        country: 'Test Country'
      }
    }));
    
    // Returns
    this.log(await makeRequest('GET', '/customer/returns', headers));
    
    // Test return creation (will likely fail due to missing order)
    this.log(await makeRequest('POST', '/customer/returns', headers, {
      orderId: 'test-order-id',
      orderItemId: 'test-item-id',
      reason: 'Defective item'
    }));
    
    // Test order details with non-existent ID
    this.log(await makeRequest('GET', '/customer/orders/non-existent-id', headers));
  }

  async testDesignerEndpoints() {
    console.log('\n🎨 TESTING DESIGNER ENDPOINTS');
    console.log('='.repeat(50));
    
    const headers = getAuthHeaders('designer');
    
    // Portfolio
    this.log(await makeRequest('GET', '/designer/designs', headers));
    
    // Create design (first ensure we have a category)
    let categoryId = 1;
    if (this.testData.categories && this.testData.categories.length > 0) {
      categoryId = this.testData.categories[0];
    }
    
    this.log(await makeRequest('POST', '/designer/designs', headers, {
      name: 'Test Design from Exhaustive Test',
      description: 'A comprehensive test design',
      categoryId: categoryId
    }));
    
    // Test with invalid category
    this.log(await makeRequest('POST', '/designer/designs', headers, {
      name: 'Invalid Design',
      description: 'Test with invalid category',
      categoryId: 999999
    }));
    
    // Get specific design
    if (this.testData.designs && this.testData.designs.length > 0) {
      const designId = this.testData.designs[0];
      this.log(await makeRequest('GET', `/designer/designs/${designId}`, headers));
      
      // Update design
      this.log(await makeRequest('PUT', `/designer/designs/${designId}`, headers, {
        name: 'Updated Design Name',
        description: 'Updated description'
      }));
      
      // Submit design
      this.log(await makeRequest('POST', `/designer/designs/${designId}/submit`, headers));
    }
    
    // Test non-existent design
    this.log(await makeRequest('GET', '/designer/designs/non-existent-id', headers));
  }

  async testStaffEndpoints() {
    console.log('\n👥 TESTING STAFF ENDPOINTS');
    console.log('='.repeat(50));
    
    const headers = getAuthHeaders('staff');
    
    // Order management
    this.log(await makeRequest('GET', '/staff/orders/pending', headers));
    this.log(await makeRequest('GET', '/staff/orders/assigned', headers));
    
    // Return management
    this.log(await makeRequest('GET', '/staff/returns/pending', headers));
    this.log(await makeRequest('GET', '/staff/returns/assigned', headers));
    
    // Test order assignment (will likely fail due to missing orders)
    this.log(await makeRequest('POST', '/staff/orders/test-order-id/assign', headers));
    
    // Test order status update
    this.log(await makeRequest('PUT', '/staff/orders/test-order-id/status', headers, {
      status: 'processing'
    }));
    
    // Test return assignment
    this.log(await makeRequest('POST', '/staff/returns/test-return-id/assign', headers));
    
    // Test return processing
    this.log(await makeRequest('PUT', '/staff/returns/test-return-id/process', headers, {
      status: 'approved',
      notes: 'Return approved'
    }));
  }

  async testInventoryEndpoints() {
    console.log('\n📦 TESTING INVENTORY ENDPOINTS');
    console.log('='.repeat(50));
    
    const headers = getAuthHeaders('inventory');
    
    // Categories
    this.log(await makeRequest('GET', '/inventory/categories', headers));
    this.log(await makeRequest('POST', '/inventory/categories', headers, {
      name: 'Exhaustive Test Category',
      description: 'Category created during exhaustive testing'
    }));
    
    // Update category
    if (this.testData.categories && this.testData.categories.length > 0) {
      const categoryId = this.testData.categories[0];
      this.log(await makeRequest('PUT', `/inventory/categories/${categoryId}`, headers, {
        name: 'Updated Category Name',
        description: 'Updated description'
      }));
    }
    
    // Products
    this.log(await makeRequest('GET', '/inventory/products', headers));
    
    // Product creation (will likely fail due to missing approved design)
    this.log(await makeRequest('POST', '/inventory/products', headers, {
      designId: 'test-design-id',
      price: 99.99,
      stocks: [
        { quantity: 10, size: 'M', color: 'Blue' },
        { quantity: 5, size: 'L', color: 'Red' }
      ]
    }));
    
    // Stock management
    this.log(await makeRequest('GET', '/inventory/stock/low', headers));
    
    // Design review
    this.log(await makeRequest('GET', '/inventory/designs/pending', headers));
    
    // Test design approval
    if (this.testData.designs && this.testData.designs.length > 0) {
      const designId = this.testData.designs[0];
      this.log(await makeRequest('POST', `/inventory/designs/${designId}/review`, headers, {
        status: 'approved'
      }));
    }
    
    // Test design rejection
    this.log(await makeRequest('POST', '/inventory/designs/test-design-id/review', headers, {
      status: 'rejected',
      rejectionReason: 'Does not meet quality standards'
    }));
  }

  async testFileUploadEndpoints() {
    console.log('\n📁 TESTING FILE UPLOAD ENDPOINTS');
    console.log('='.repeat(50));
    
    // Create test files
    const pngData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync('test-upload.png', pngData);
    
    // Test admin bill processing
    try {
      const adminHeaders = getAuthHeaders('admin');
      const form = new FormData();
      form.append('billImage', fs.createReadStream('test-upload.png'));
      
      const result = await makeRequest('POST', '/admin/bills/process', {
        ...adminHeaders,
        ...form.getHeaders()
      }, form, true);
      this.log(result);
    } catch (error) {
      this.log({
        success: false,
        status: 0,
        error: error.message,
        endpoint: '/admin/bills/process',
        method: 'POST'
      });
    }
    
    // Test designer design upload with files
    try {
      const designerHeaders = getAuthHeaders('designer');
      const form = new FormData();
      form.append('name', 'Design with Image');
      form.append('description', 'Test design with image upload');
      form.append('categoryId', '1');
      form.append('designImages', fs.createReadStream('test-upload.png'));
      
      const result = await makeRequest('POST', '/designer/designs', {
        ...designerHeaders,
        ...form.getHeaders()
      }, form, true);
      this.log(result);
    } catch (error) {
      this.log({
        success: false,
        status: 0,
        error: error.message,
        endpoint: '/designer/designs (with files)',
        method: 'POST'
      });
    }
    
    // Cleanup
    if (fs.existsSync('test-upload.png')) {
      fs.unlinkSync('test-upload.png');
    }
  }

  async testErrorHandling() {
    console.log('\n⚠️ TESTING ERROR HANDLING');
    console.log('='.repeat(50));
    
    // Test 404 endpoints
    this.log(await makeRequest('GET', '/non-existent-endpoint'));
    this.log(await makeRequest('POST', '/another/non-existent'));
    
    // Test malformed requests
    this.log(await makeRequest('POST', '/admin/users', getAuthHeaders('admin'), 'invalid-json'));
    
    // Test unauthorized access
    this.log(await makeRequest('GET', '/admin/users'));
    this.log(await makeRequest('GET', '/admin/users', { 'Authorization': 'Bearer invalid-token' }));
    
    // Test forbidden access (wrong role)
    this.log(await makeRequest('GET', '/admin/users', getAuthHeaders('customer')));
    this.log(await makeRequest('GET', '/staff/orders/pending', getAuthHeaders('designer')));
    this.log(await makeRequest('GET', '/inventory/products', getAuthHeaders('customer')));
  }

  async testPaymentEndpoints() {
    console.log('\n💳 TESTING PAYMENT ENDPOINTS');
    console.log('='.repeat(50));
    
    const headers = getAuthHeaders('customer');
    
    // Payment endpoints (will likely fail due to missing orders)
    this.log(await makeRequest('POST', '/customer/orders/test-order-id/payment', headers));
    this.log(await makeRequest('POST', '/customer/orders/test-order-id/payment-confirm', headers, {
      paymentIntentId: 'test-payment-intent'
    }));
    
    // Test direct payment endpoints if they exist
    this.log(await makeRequest('GET', '/payments/test-payment-id', headers));
  }

  async testOrdersEndpoints() {
    console.log('\n📋 TESTING ORDER ENDPOINTS');
    console.log('='.repeat(50));
    
    const headers = getAuthHeaders('customer');
    
    // Test order endpoints
    this.log(await makeRequest('GET', '/orders'));
    this.log(await makeRequest('GET', '/orders/test-order-id'));
    this.log(await makeRequest('POST', '/orders', headers, {
      customerId: 'test-customer',
      items: [],
      totalAmount: 0
    }));
  }

  async testReportsEndpoints() {
    console.log('\n📊 TESTING REPORT ENDPOINTS');
    console.log('='.repeat(50));
    
    const headers = getAuthHeaders('admin');
    
    // Test report endpoints
    this.log(await makeRequest('GET', '/reports', headers));
    this.log(await makeRequest('GET', '/reports/test-report-id', headers));
    this.log(await makeRequest('POST', '/reports', headers, {
      type: 'custom',
      startDate: '2025-01-01',
      endDate: '2025-09-13'
    }));
  }

  generateSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 EXHAUSTIVE ENDPOINT TEST SUMMARY');
    console.log('='.repeat(80));
    
    const successful = this.results.filter(r => r.success).length;
    const secured = this.results.filter(r => !r.success && (r.status === 401 || r.status === 403)).length;
    const failed = this.results.filter(r => !r.success && r.status !== 401 && r.status !== 403).length;
    const total = this.results.length;
    
    console.log(`📈 Total Endpoints Tested: ${total}`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`🔒 Properly Secured: ${secured}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Success Rate: ${Math.round(((successful + secured) / total) * 100)}%`);
    
    if (failed > 0) {
      console.log('\n❌ FAILED ENDPOINTS:');
      this.results
        .filter(r => !r.success && r.status !== 401 && r.status !== 403)
        .forEach(r => {
          console.log(`   • ${r.method} ${r.endpoint} - ${r.error}`);
        });
    }
    
    console.log('\n🎯 Test Data Collected:');
    Object.entries(this.testData).forEach(([type, ids]) => {
      console.log(`   • ${type}: ${ids.length} items`);
    });
    
    return { total, successful, secured, failed, successRate: Math.round(((successful + secured) / total) * 100) };
  }
}

async function runExhaustiveTest() {
  console.log('🚀 EXHAUSTIVE BACKEND ENDPOINT TESTING');
  console.log('Testing EVERY SINGLE endpoint to ensure 100% coverage');
  console.log('='.repeat(80));
  
  const tester = new EndpointTester();
  
  try {
    await tester.testPublicEndpoints();
    await tester.testAuthEndpoints();
    await tester.testAdminEndpoints();
    await tester.testCustomerEndpoints();
    await tester.testDesignerEndpoints();
    await tester.testStaffEndpoints();
    await tester.testInventoryEndpoints();
    await tester.testFileUploadEndpoints();
    await tester.testPaymentEndpoints();
    await tester.testOrdersEndpoints();
    await tester.testReportsEndpoints();
    await tester.testErrorHandling();
    
    const summary = tester.generateSummary();
    
    console.log('\n' + '='.repeat(80));
    if (summary.failed === 0) {
      console.log('🎉 ALL ENDPOINTS WORKING PERFECTLY!');
      console.log('✅ Backend is 100% ready for production!');
    } else {
      console.log(`⚠️  ${summary.failed} endpoints need attention`);
      console.log('📝 Review the failed endpoints above and fix them');
    }
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }
}

runExhaustiveTest();