const db = require('./models');

async function fixDatabase() {
  try {
    await db.sequelize.authenticate();
    console.log('Database connected successfully');

    // Update the notification type ENUM to include new values
    await db.sequelize.query(`
      ALTER TABLE notifications
      MODIFY COLUMN type ENUM(
        'low_stock',
        'new_order',
        'order_status',
        'payment',
        'return',
        'system',
        'design_review',
        'return_status'
      ) NOT NULL;
    `);

    console.log('Database schema updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database update failed:', error);
    process.exit(1);
  }
}

fixDatabase();