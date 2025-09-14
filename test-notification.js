require('dotenv').config();
const db = require('./models');

async function testNotification() {
  try {
    await db.sequelize.authenticate();
    console.log('Database connected');

    // Test creating a notification with 'system' type
    const testNotification = await db.notification.create({
      userId: 'test_user_123',
      type: 'system',
      title: 'Test Notification',
      message: 'This is a test notification',
      data: { test: true }
    });

    console.log('Notification created successfully:', testNotification.id);

    // Clean up
    await testNotification.destroy();
    console.log('Test notification cleaned up');

    process.exit(0);
  } catch (error) {
    console.error('Notification test failed:', error);
    process.exit(1);
  }
}

testNotification();