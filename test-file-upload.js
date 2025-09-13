const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const jwt = require('jsonwebtoken');

async function testFileUpload() {
  try {
    // Create a simple PNG image file (1x1 transparent pixel)
    const pngData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync('test-image.png', pngData);
    
    // Create JWT token for admin
    const token = jwt.sign({sub: 'demo_admin_001'}, 'demo-secret-key');
    
    // Create form data
    const form = new FormData();
    form.append('billImage', fs.createReadStream('test-image.png'));
    
    console.log('🧪 Testing file upload endpoint...');
    
    const response = await axios.post('http://localhost:5000/api/admin/bills/process', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000
    });
    
    console.log('✅ File upload test successful:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ File upload test failed:', error.response?.status || 'NO_RESPONSE');
    console.log('Error:', error.response?.data?.message || error.message);
  } finally {
    // Cleanup
    if (fs.existsSync('test-image.png')) {
      fs.unlinkSync('test-image.png');
    }
  }
}

testFileUpload();