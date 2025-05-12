const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models
db.user = require("./user.model.js")(sequelize, Sequelize);
db.product = require("./product.model.js")(sequelize, Sequelize);
db.stock = require("./stock.model.js")(sequelize, Sequelize);
db.design = require("./design.model.js")(sequelize, Sequelize);
db.order = require("./order.model.js")(sequelize, Sequelize);
db.orderItem = require("./order-item.model.js")(sequelize, Sequelize);
db.return = require("./return.model.js")(sequelize, Sequelize);
db.payment = require("./payment.model.js")(sequelize, Sequelize);
db.category = require("./category.model.js")(sequelize, Sequelize);
db.notification = require("./notification.model.js")(sequelize, Sequelize);
db.report = require("./report.model.js")(sequelize, Sequelize);

// Relationships

// User relationships
db.user.hasMany(db.design, { foreignKey: 'designerId', as: 'designs' });
db.user.hasMany(db.order, { foreignKey: 'customerId', as: 'orders' });
db.user.hasMany(db.order, { foreignKey: 'staffId', as: 'processedOrders' });
db.user.hasMany(db.return, { foreignKey: 'staffId', as: 'processedReturns' });
db.user.hasMany(db.notification, { foreignKey: 'userId', as: 'notifications' });

// Product relationships
db.product.belongsTo(db.user, { foreignKey: 'designerId', as: 'designer' });
db.product.belongsTo(db.category, { foreignKey: 'categoryId', as: 'category' });
db.product.hasMany(db.stock, { foreignKey: 'productId', as: 'stocks' });
db.product.belongsToMany(db.order, { through: db.orderItem, foreignKey: 'productId', otherKey: 'orderId' });

// Stock relationships
db.stock.belongsTo(db.product, { foreignKey: 'productId', as: 'product' });
db.stock.hasMany(db.orderItem, { foreignKey: 'stockId', as: 'orderItems' });

// Design relationships
db.design.belongsTo(db.user, { foreignKey: 'designerId', as: 'designer' });
db.design.belongsTo(db.category, { foreignKey: 'categoryId', as: 'category' });

// Order relationships
db.order.belongsTo(db.user, { foreignKey: 'customerId', as: 'customer' });
db.order.belongsTo(db.user, { foreignKey: 'staffId', as: 'staff' });
db.order.hasMany(db.orderItem, { foreignKey: 'orderId', as: 'items' });
db.order.hasOne(db.payment, { foreignKey: 'orderId', as: 'payment' });
db.order.hasMany(db.return, { foreignKey: 'orderId', as: 'returns' });

// OrderItem relationships
db.orderItem.belongsTo(db.order, { foreignKey: 'orderId', as: 'order' });
db.orderItem.belongsTo(db.product, { foreignKey: 'productId', as: 'product' });
db.orderItem.belongsTo(db.stock, { foreignKey: 'stockId', as: 'stock' });
db.orderItem.hasOne(db.return, { foreignKey: 'orderItemId', as: 'return' });

// Return relationships
db.return.belongsTo(db.order, { foreignKey: 'orderId', as: 'order' });
db.return.belongsTo(db.orderItem, { foreignKey: 'orderItemId', as: 'orderItem' });
db.return.belongsTo(db.user, { foreignKey: 'customerId', as: 'customer' });
db.return.belongsTo(db.user, { foreignKey: 'staffId', as: 'staff' });

// Payment relationships
db.payment.belongsTo(db.order, { foreignKey: 'orderId', as: 'order' });
db.payment.belongsTo(db.user, { foreignKey: 'customerId', as: 'customer' });

// Category relationships
db.category.hasMany(db.product, { foreignKey: 'categoryId', as: 'products' });
db.category.hasMany(db.design, { foreignKey: 'categoryId', as: 'designs' });
db.category.hasMany(db.category, { foreignKey: 'parentId', as: 'subcategories' });
db.category.belongsTo(db.category, { foreignKey: 'parentId', as: 'parent' });

// Report relationships
db.report.belongsTo(db.user, { foreignKey: 'createdBy', as: 'creator' });

module.exports = db;