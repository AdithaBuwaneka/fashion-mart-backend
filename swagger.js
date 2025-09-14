const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fashion Mart API',
      version: '1.0.0',
      description: 'Smart Fashion Management System - Complete E-commerce Backend API',
      contact: {
        name: 'Fashion Mart Team',
        email: 'support@fashionmart.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://api.fashionmart.com'
          : 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Clerk JWT token'
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-access-token',
          description: 'Custom JWT token header'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Clerk user ID'
            },
            email: {
              type: 'string',
              format: 'email'
            },
            firstName: {
              type: 'string'
            },
            lastName: {
              type: 'string'
            },
            role: {
              type: 'string',
              enum: ['admin', 'designer', 'customer', 'staff', 'inventory_manager']
            },
            phoneNumber: {
              type: 'string'
            },
            profileImage: {
              type: 'string'
            },
            active: {
              type: 'boolean',
              default: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            price: {
              type: 'number',
              format: 'decimal'
            },
            categoryId: {
              type: 'integer'
            },
            designerId: {
              type: 'string'
            },
            images: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            featured: {
              type: 'boolean',
              default: false
            },
            trending: {
              type: 'boolean',
              default: false
            },
            active: {
              type: 'boolean',
              default: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Stock: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            productId: {
              type: 'string',
              format: 'uuid'
            },
            size: {
              type: 'string'
            },
            color: {
              type: 'string'
            },
            quantity: {
              type: 'integer'
            },
            sku: {
              type: 'string'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            customerId: {
              type: 'string'
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']
            },
            totalAmount: {
              type: 'number',
              format: 'decimal'
            },
            shippingAddress: {
              type: 'object'
            },
            billingAddress: {
              type: 'object'
            },
            staffId: {
              type: 'string'
            },
            notes: {
              type: 'string'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            parentId: {
              type: 'integer'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean'
            },
            message: {
              type: 'string'
            },
            data: {
              type: 'object'
            },
            error: {
              type: 'string'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string'
            },
            error: {
              type: 'string'
            }
          }
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ],
    tags: [
      {
        name: 'System',
        description: 'System health and status endpoints'
      },
      {
        name: 'Authentication',
        description: 'User authentication and session management'
      },
      {
        name: 'Products',
        description: 'Product catalog management'
      },
      {
        name: 'Categories',
        description: 'Product category management'
      },
      {
        name: 'Orders',
        description: 'Order processing and management'
      },
      {
        name: 'Payments',
        description: 'Payment processing'
      },
      {
        name: 'Inventory',
        description: 'Stock and inventory management'
      },
      {
        name: 'Admin',
        description: 'Administrative functions'
      },
      {
        name: 'Designer',
        description: 'Designer-specific operations'
      },
      {
        name: 'Customer',
        description: 'Customer-specific operations'
      },
      {
        name: 'Staff',
        description: 'Staff operations'
      },
      {
        name: 'Reports',
        description: 'Business reports and analytics'
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi,
  serve: swaggerUi.serve,
  setup: swaggerUi.setup
};