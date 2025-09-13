// Script to create demo users with different roles
// Run this with: node create-demo-users.js

// Load environment variables first
require('dotenv').config();

const db = require('./models');
const User = db.user;

async function createDemoUsers() {
  try {
    const demoUsers = [
      {
        id: 'demo_admin_001',
        email: 'admin@fashionmart.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        active: true
      },
      {
        id: 'demo_designer_001',
        email: 'designer@fashionmart.com',
        firstName: 'Designer',
        lastName: 'User',
        role: 'designer',
        active: true
      },
      {
        id: 'demo_staff_001',
        email: 'staff@fashionmart.com',
        firstName: 'Staff',
        lastName: 'User',
        role: 'staff',
        active: true
      },
      {
        id: 'demo_inventory_001',
        email: 'inventory@fashionmart.com',
        firstName: 'Inventory',
        lastName: 'Manager',
        role: 'inventory_manager',
        active: true
      },
      {
        id: 'demo_customer_001',
        email: 'customer@fashionmart.com',
        firstName: 'Customer',
        lastName: 'User',
        role: 'customer',
        active: true
      }
    ];

    console.log('Creating demo users...');
    
    for (const userData of demoUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findByPk(userData.id);
        
        if (existingUser) {
          console.log(`User ${userData.email} already exists, updating role to ${userData.role}`);
          existingUser.role = userData.role;
          await existingUser.save();
        } else {
          const user = await User.create(userData);
          console.log(`Created user: ${user.email} with role: ${user.role}`);
        }
      } catch (error) {
        console.error(`Error creating user ${userData.email}:`, error.message);
      }
    }
    
    console.log('\nDemo users creation completed!');
    console.log('\nYou can now log in with these credentials:');
    console.log('- admin@fashionmart.com (Admin)');
    console.log('- designer@fashionmart.com (Designer)');
    console.log('- staff@fashionmart.com (Staff)');
    console.log('- inventory@fashionmart.com (Inventory Manager)');
    console.log('- customer@fashionmart.com (Customer)');
    
  } catch (error) {
    console.error('Error creating demo users:', error);
  } finally {
    // Close database connection
    await db.sequelize.close();
  }
}

createDemoUsers();
