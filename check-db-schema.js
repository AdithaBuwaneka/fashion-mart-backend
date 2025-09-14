const db = require('./models');

async function checkSchema() {
  try {
    await db.sequelize.authenticate();
    console.log('Database connected successfully');

    // Check notification table schema
    const [results] = await db.sequelize.query(`
      SHOW COLUMNS FROM notifications WHERE Field = 'type'
    `);

    console.log('Notification type column info:', results);

    process.exit(0);
  } catch (error) {
    console.error('Schema check failed:', error);
    process.exit(1);
  }
}

checkSchema();