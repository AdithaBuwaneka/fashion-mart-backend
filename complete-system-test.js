require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';
const tokens = JSON.parse(fs.readFileSync('./test-tokens.json', 'utf8'));

let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  issues: []
};

// Helper function to test an endpoint
async function testEndpoint(name, method, url, token, data = null, expectedStatus = [200, 201]) {
  testResults.total++;
  try {
    const config = {
      method: method.toLowerCase(),
      url: `${BASE_URL}${url}`,
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      timeout: 10000
    };

    if (data) {
      if (data instanceof FormData) {
        config.data = data;
        config.headers = { ...config.headers, ...data.getHeaders() };
      } else {
        config.data = data;
        config.headers['Content-Type'] = 'application/json';
      }
    }

    const response = await axios(config);

    if (Array.isArray(expectedStatus) ? expectedStatus.includes(response.status) : response.status === expectedStatus) {
      console.log(`✅ ${name}: ${method} ${url} - ${response.status}`);
      testResults.passed++;
      return { success: true, data: response.data, status: response.status };
    } else {
      console.log(`❌ ${name}: Expected ${expectedStatus}, got ${response.status}`);
      testResults.failed++;
      testResults.issues.push(`${name}: Expected status ${expectedStatus}, got ${response.status}`);
      return { success: false, status: response.status };
    }
  } catch (error) {
    const status = error.response?.status || 'Network Error';
    const message = error.response?.data?.message || error.message;

    if (Array.isArray(expectedStatus) ? expectedStatus.includes(status) : status === expectedStatus) {
      console.log(`✅ ${name}: ${method} ${url} - ${status} (Expected error)`);
      testResults.passed++;
      return { success: true, status, expectedError: true };
    } else {
      console.log(`❌ ${name}: ${method} ${url} - ${status} - ${message}`);
      testResults.failed++;
      testResults.issues.push(`${name}: ${status} - ${message}`);
      return { success: false, status, message };
    }
  }
}

async function runCompleteSystemTest() {
  console.log('🚀 COMPLETE FASHION MART SYSTEM TEST');
  console.log('=' .repeat(60));

  // Store IDs for related tests
  const testData = {
    orderId: null,
    designId: null,
    productId: null,
    categoryId: null,
    stockId: null,
    returnId: null,
    paymentId: null
  };

  // 1. AUTHENTICATION TESTS
  console.log('\n1️⃣ AUTHENTICATION TESTS');
  console.log('-'.repeat(40));

  await testEndpoint('Health Check', 'GET', '/health', null);

  for (const [role, token] of Object.entries(tokens)) {
    await testEndpoint(`${role} Session`, 'GET', '/auth/session', token);
    await testEndpoint(`${role} Profile`, 'GET', '/auth/profile', token);
  }

  // Test role-based access control
  await testEndpoint('Customer accessing Admin (Should fail)', 'GET', '/admin/users', tokens.customer, null, [403, 401]);
  await testEndpoint('Designer accessing Staff (Should fail)', 'GET', '/staff/orders/pending', tokens.designer, null, [403, 401]);

  // 2. ADMIN TESTS
  console.log('\n2️⃣ ADMIN ENDPOINT TESTS');
  console.log('-'.repeat(40));

  const adminTests = [
    ['Admin Dashboard Stats', 'GET', '/admin/dashboard/stats'],
    ['Admin Users List', 'GET', '/admin/users'],
    ['Admin Reports List', 'GET', '/admin/reports']
  ];

  for (const [name, method, url] of adminTests) {
    await testEndpoint(name, method, url, tokens.admin);
  }

  // Test admin role updates
  await testEndpoint('Admin Update User Role', 'PATCH', `/admin/users/demo_customer_001/role`, tokens.admin, { role: 'customer' });

  // 3. CUSTOMER TESTS
  console.log('\n3️⃣ CUSTOMER ENDPOINT TESTS');
  console.log('-'.repeat(40));

  await testEndpoint('Customer Profile', 'GET', '/customer/profile', tokens.customer);

  // Update customer profile
  await testEndpoint('Customer Update Profile', 'PUT', '/customer/profile', tokens.customer, {
    firstName: 'Updated',
    lastName: 'Customer',
    phoneNumber: '+1234567890'
  });

  // Get customer orders
  await testEndpoint('Customer Orders', 'GET', '/customer/orders', tokens.customer);

  // Get customer returns
  await testEndpoint('Customer Returns', 'GET', '/customer/returns', tokens.customer);

  // 4. DESIGNER TESTS
  console.log('\n4️⃣ DESIGNER ENDPOINT TESTS');
  console.log('-'.repeat(40));

  // Get categories
  const categoriesResult = await testEndpoint('Designer Categories', 'GET', '/designer/categories', tokens.designer);
  if (categoriesResult.success && categoriesResult.data.data.length > 0) {
    testData.categoryId = categoriesResult.data.data[0].id;
  }

  // Create design
  const designResult = await testEndpoint('Designer Create Design', 'POST', '/designer/designs', tokens.designer, {
    name: `System Test Design ${Date.now()}`,
    description: 'Complete system test design',
    categoryId: testData.categoryId
  });

  if (designResult.success) {
    testData.designId = designResult.data.data.id;

    // Test design operations
    await testEndpoint('Designer Get Design', 'GET', `/designer/designs/${testData.designId}`, tokens.designer);
    await testEndpoint('Designer Update Design', 'PUT', `/designer/designs/${testData.designId}`, tokens.designer, {
      description: 'Updated description'
    });
    await testEndpoint('Designer Submit Design', 'POST', `/designer/designs/${testData.designId}/submit`, tokens.designer);
  }

  // Get all designs
  await testEndpoint('Designer All Designs', 'GET', '/designer/designs', tokens.designer);

  // 5. INVENTORY MANAGER TESTS
  console.log('\n5️⃣ INVENTORY MANAGER ENDPOINT TESTS');
  console.log('-'.repeat(40));

  // Get pending designs
  const pendingDesignsResult = await testEndpoint('Inventory Pending Designs', 'GET', '/inventory/designs/pending', tokens.inventory_manager);

  // Approve a design if available
  if (pendingDesignsResult.success && pendingDesignsResult.data.data.length > 0) {
    const designToApprove = pendingDesignsResult.data.data[0];
    await testEndpoint('Inventory Approve Design', 'POST', `/inventory/designs/${designToApprove.id}/review`, tokens.inventory_manager, {
      status: 'approved'
    });

    // Create product from approved design
    const productResult = await testEndpoint('Inventory Create Product', 'POST', '/inventory/products', tokens.inventory_manager, {
      designId: designToApprove.id,
      price: 299.99,
      stocks: [
        { size: 'S', color: 'Blue', quantity: 50, lowStockThreshold: 10 },
        { size: 'M', color: 'Blue', quantity: 100, lowStockThreshold: 15 },
        { size: 'L', color: 'Blue', quantity: 75, lowStockThreshold: 12 }
      ]
    });

    if (productResult.success) {
      testData.productId = productResult.data.data.id;
      testData.stockId = productResult.data.data.stocks[0].id;
    }
  }

  // Get all products
  await testEndpoint('Inventory All Products', 'GET', '/inventory/products', tokens.inventory_manager);

  // Get product by ID if available
  if (testData.productId) {
    await testEndpoint('Inventory Get Product', 'GET', `/inventory/products/${testData.productId}`, tokens.inventory_manager);
  }

  // Category management
  const categoryResult = await testEndpoint('Inventory Create Category', 'POST', '/inventory/categories', tokens.inventory_manager, {
    name: `Test Category ${Date.now()}`,
    description: 'System test category'
  });

  await testEndpoint('Inventory All Categories', 'GET', '/inventory/categories', tokens.inventory_manager);

  // Stock management
  await testEndpoint('Inventory Low Stock', 'GET', '/inventory/stock/low', tokens.inventory_manager);

  if (testData.stockId) {
    await testEndpoint('Inventory Update Stock', 'PUT', `/inventory/stock/${testData.stockId}`, tokens.inventory_manager, {
      quantity: 25
    });
  }

  // 6. COMPLETE ORDER WORKFLOW TEST
  console.log('\n6️⃣ COMPLETE ORDER WORKFLOW TEST');
  console.log('-'.repeat(40));

  if (testData.productId && testData.stockId) {
    // Customer creates order
    const orderResult = await testEndpoint('Customer Create Order', 'POST', '/customer/orders', tokens.customer, {
      items: [{
        productId: testData.productId,
        stockId: testData.stockId,
        quantity: 2
      }],
      shippingAddress: {
        name: 'System Test Customer',
        street: '123 System Test St',
        city: 'Test City',
        state: 'Test State',
        zip: '12345',
        country: 'Test Country'
      }
    });

    if (orderResult.success) {
      testData.orderId = orderResult.data.data.order.id;

      // Get order details
      await testEndpoint('Customer Get Order', 'GET', `/customer/orders/${testData.orderId}`, tokens.customer);

      // Create payment intent
      const paymentResult = await testEndpoint('Customer Create Payment', 'POST', `/customer/orders/${testData.orderId}/payment`, tokens.customer, {
        paymentMethodId: 'pm_card_visa'
      });

      if (paymentResult.success) {
        testData.paymentId = paymentResult.data.data.stripePaymentIntentId;

        // Simulate payment confirmation
        await testEndpoint('Customer Confirm Payment', 'POST', `/customer/orders/${testData.orderId}/payment/confirm`, tokens.customer, {
          paymentIntentId: testData.paymentId
        });
      }
    }
  }

  // 7. STAFF WORKFLOW TESTS
  console.log('\n7️⃣ STAFF WORKFLOW TESTS');
  console.log('-'.repeat(40));

  await testEndpoint('Staff Pending Orders', 'GET', '/staff/orders/pending', tokens.staff);
  await testEndpoint('Staff Assigned Orders', 'GET', '/staff/orders/assigned', tokens.staff);
  await testEndpoint('Staff Pending Returns', 'GET', '/staff/returns/pending', tokens.staff);
  await testEndpoint('Staff Assigned Returns', 'GET', '/staff/returns/assigned', tokens.staff);

  // If there are orders to process
  if (testData.orderId) {
    await testEndpoint('Staff Assign Order', 'POST', `/staff/orders/${testData.orderId}/assign`, tokens.staff);
    await testEndpoint('Staff Update Order Status', 'PUT', `/staff/orders/${testData.orderId}/status`, tokens.staff, {
      status: 'processing'
    });
  }

  // 8. RETURN WORKFLOW TEST
  console.log('\n8️⃣ RETURN WORKFLOW TEST');
  console.log('-'.repeat(40));

  if (testData.orderId) {
    // Create return request (would need order items)
    // This requires the order to be delivered first, so we'll test the endpoint availability
    await testEndpoint('Customer Return Request Structure', 'POST', '/customer/returns', tokens.customer, {
      orderId: testData.orderId,
      orderItemId: 'dummy-item-id',
      reason: 'System test return',
      images: []
    }, [400, 404]); // Expected to fail due to dummy data, but tests endpoint
  }

  // 9. PUBLIC ENDPOINTS TEST
  console.log('\n9️⃣ PUBLIC ENDPOINTS TEST');
  console.log('-'.repeat(40));

  await testEndpoint('Public Products', 'GET', '/products', null);
  await testEndpoint('Public Categories', 'GET', '/categories', null);

  // 10. ERROR HANDLING TESTS
  console.log('\n🔟 ERROR HANDLING TESTS');
  console.log('-'.repeat(40));

  await testEndpoint('Invalid Endpoint', 'GET', '/invalid-endpoint', tokens.customer, null, 404);
  await testEndpoint('Unauthorized Access', 'GET', '/admin/users', null, null, [401, 403]);
  await testEndpoint('Invalid Token', 'GET', '/customer/profile', 'invalid-token', null, [401, 403]);

  // SUMMARY
  console.log('\n📊 SYSTEM TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`Total Endpoints Tested: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

  if (testResults.issues.length > 0) {
    console.log('\n🔍 ISSUES FOUND:');
    testResults.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  } else {
    console.log('\n🎉 ALL TESTS PASSED! SYSTEM IS FULLY FUNCTIONAL!');
  }

  // Save test results
  fs.writeFileSync('system-test-results.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    results: testResults,
    testData
  }, null, 2));

  console.log('\n📄 Test results saved to system-test-results.json');
  return testResults;
}

// Run the complete system test
runCompleteSystemTest().then(() => {
  process.exit(testResults.failed > 0 ? 1 : 0);
}).catch(error => {
  console.error('❌ System test failed:', error);
  process.exit(1);
});