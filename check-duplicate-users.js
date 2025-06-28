const dotenv = require('dotenv');
dotenv.config();

const db = require('./models');
const { Op } = require('sequelize');

async function checkDuplicateUsers() {
  try {
    // Check for users with duplicate emails
    const duplicateEmails = await db.sequelize.query(`
      SELECT email, COUNT(*) as count
      FROM users
      GROUP BY email
      HAVING COUNT(*) > 1
    `, { type: db.sequelize.QueryTypes.SELECT });

    console.log('Duplicate emails found:', duplicateEmails);

    // Check for the specific email from the error
    const specificUser = await db.user.findAll({
      where: { email: 'adithaf7@gmail.com' }
    });

    console.log('Users with email adithaf7@gmail.com:', specificUser.map(u => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      createdAt: u.createdAt
    })));

    process.exit(0);
  } catch (error) {
    console.error('Error checking duplicate users:', error);
    process.exit(1);
  }
}

checkDuplicateUsers();
