const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fashion Mart Backend API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for the Fashion Mart Smart Fashion Management System',
      contact: {
        name: 'Fashion Mart Team',
        email: 'api@fashionmart.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.fashionmart.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'User ID (Clerk ID)' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: {
              type: 'string',
              enum: ['admin', 'customer', 'designer', 'staff', 'inventory_manager']
            },
            phoneNumber: { type: 'string' },
            profileImage: { type: 'string' },
            active: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'string' },
            categoryId: { type: 'integer' },
            designerId: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            featured: { type: 'boolean' },
            trending: { type: 'boolean' },
            active: { type: 'boolean' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            customerId: { type: 'string' },
            totalAmount: { type: 'number' },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
            },
            paymentStatus: {
              type: 'string',
              enum: ['pending', 'paid', 'failed', 'refunded']
            },
            shippingAddress: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Design: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            designerId: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            status: {
              type: 'string',
              enum: ['draft', 'pending', 'approved', 'rejected']
            },
            categoryId: { type: 'integer' },
            approvedDate: { type: 'string', format: 'date-time' },
            rejectionReason: { type: 'string' }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' },
            image: { type: 'string' },
            active: { type: 'boolean' },
            parentId: { type: 'integer' }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
            error: { type: 'string' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js', './server.js']
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi
};