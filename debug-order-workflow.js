require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:5000/api';
const tokens = JSON.parse(fs.readFileSync('./test-tokens.json', 'utf8'));

async function debugOrderWorkflow() {
  try {
    console.log('🔍 DEBUGGING ORDER WORKFLOW');
    console.log('=' .repeat(50));

    // 1. Get all products to check what's available
    const products = await axios.get(`${BASE_URL}/inventory/products`, {
      headers: { 'Authorization': `Bearer ${tokens.inventory_manager}` }
    });

    console.log(`📦 Available Products: ${products.data.data.length}`);
    if (products.data.data.length > 0) {
      const product = products.data.data[0];
      console.log(`   - Product: ${product.name} ($${product.price})`);
      console.log(`   - Product ID: ${product.id}`);
      console.log(`   - Stock variants: ${product.stocks.length}`);
      if (product.stocks.length > 0) {
        console.log(`   - First stock: Size ${product.stocks[0].size}, Color ${product.stocks[0].color}, Qty: ${product.stocks[0].quantity}`);
        console.log(`   - Stock ID: ${product.stocks[0].id}`);
      }

      // 2. Create order with detailed logging
      console.log('\n📋 Creating Order...');
      const orderPayload = {
        items: [{
          productId: product.id,
          stockId: product.stocks[0].id,
          quantity: 1
        }],
        shippingAddress: {
          name: 'Debug Test Customer',
          street: '123 Debug Street',
          city: 'Debug City',
          state: 'Debug State',
          zip: '12345',
          country: 'Debug Country'
        }
      };

      console.log('Order Payload:', JSON.stringify(orderPayload, null, 2));

      const newOrder = await axios.post(`${BASE_URL}/customer/orders`, orderPayload, {
        headers: { 'Authorization': `Bearer ${tokens.customer}` }
      });

      console.log('\n✅ Order Response:');
      console.log(`   - Order ID: ${newOrder.data.data.id}`);
      console.log(`   - Total: $${newOrder.data.data.totalAmount}`);
      console.log(`   - Status: ${newOrder.data.data.status}`);
      console.log(`   - Payment Status: ${newOrder.data.data.paymentStatus}`);

      // 3. Try to create payment intent
      console.log('\n💳 Creating Payment Intent...');
      try {
        const paymentIntent = await axios.post(`${BASE_URL}/customer/orders/${newOrder.data.data.id}/payment`, {
          paymentMethodId: 'pm_card_visa'
        }, {
          headers: { 'Authorization': `Bearer ${tokens.customer}` }
        });

        console.log('✅ Payment Intent Created:');
        console.log(`   - Client Secret: ${paymentIntent.data.data.clientSecret.substring(0, 20)}...`);
        console.log(`   - Stripe Payment Intent ID: ${paymentIntent.data.data.stripePaymentIntentId}`);
      } catch (paymentError) {
        console.log('❌ Payment Intent Error:', paymentError.response?.data || paymentError.message);
      }

      // 4. Check current order status
      console.log('\n📋 Checking Order Status...');
      const updatedOrder = await axios.get(`${BASE_URL}/customer/orders/${newOrder.data.data.id}`, {
        headers: { 'Authorization': `Bearer ${tokens.customer}` }
      });

      console.log(`   - Order Status: ${updatedOrder.data.data.status}`);
      console.log(`   - Payment Status: ${updatedOrder.data.data.paymentStatus}`);
      if (updatedOrder.data.data.payment) {
        console.log(`   - Payment Method: ${updatedOrder.data.data.payment.method}`);
        console.log(`   - Payment Amount: $${updatedOrder.data.data.payment.amount}`);
      }
    } else {
      console.log('❌ No products available to create orders');
    }

  } catch (error) {
    console.error('\n❌ DEBUG FAILED:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error(`HTTP ${error.response.status}: ${error.response.statusText}`);
    }
    if (error.response?.data) {
      console.log('Full Error Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

debugOrderWorkflow();