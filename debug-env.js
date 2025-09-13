require('dotenv').config();

console.log('Environment Debug:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD present:', !!process.env.DB_PASSWORD);
console.log('DB_PASSWORD length:', process.env.DB_PASSWORD?.length || 0);

const dbConfig = require('./config/db.config.js');
console.log('\nConfig Object:');
console.log('HOST:', dbConfig.HOST);
console.log('USER:', dbConfig.USER);
console.log('DB:', dbConfig.DB);
console.log('PASSWORD present:', !!dbConfig.PASSWORD);
console.log('PASSWORD length:', dbConfig.PASSWORD?.length || 0);