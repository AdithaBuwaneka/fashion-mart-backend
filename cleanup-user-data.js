const dotenv = require('dotenv');
dotenv.config();

const db = require('./models');

async function cleanupUserData() {
  try {
    // Find users with empty firstName/lastName and convert to null
    const usersToUpdate = await db.user.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { firstName: '' },
          { lastName: '' }
        ]
      }
    });

    console.log(`Found ${usersToUpdate.length} users with empty firstName/lastName`);

    for (const user of usersToUpdate) {
      const updateData = {};
      if (user.firstName === '') updateData.firstName = null;
      if (user.lastName === '') updateData.lastName = null;
      
      await user.update(updateData);
      console.log(`Updated user ${user.id}: firstName="${user.firstName}" -> "${updateData.firstName || user.firstName}", lastName="${user.lastName}" -> "${updateData.lastName || user.lastName}"`);
    }

    console.log('User data cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning up user data:', error);
    process.exit(1);
  }
}

cleanupUserData();
