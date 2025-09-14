# Fashion Mart Backend - Smart Fashion Management System

A comprehensive Node.js REST API backend for a fashion e-commerce platform with advanced inventory management, role-based access control, payment processing, and AI-powered image analysis.

## 🏗️ System Architecture

### Core Technologies
- **Runtime**: Node.js with Express.js framework
- **Database**: MySQL with Sequelize ORM
- **Authentication**: Clerk.dev integration with JWT tokens
- **Payment**: Stripe payment processing
- **Image Analysis**: Google Cloud Vision API
- **Documentation**: Swagger/OpenAPI 3.0
- **Logging**: Winston with daily log rotation
- **Security**: Helmet, rate limiting, input sanitization

### Database Schema

#### Users System
- **Users** (`users`): Multi-role user management (admin, designer, customer, staff, inventory_manager)
- **Authentication**: Clerk-based auth with session management

#### Product Catalog
- **Products** (`products`): Core product information with designer attribution
- **Categories** (`categories`): Hierarchical category system with parent-child relationships
- **Stock** (`stocks`): Size/color variant inventory tracking
- **Designs** (`designs`): Designer-specific product designs

#### Order Management
- **Orders** (`orders`): Order lifecycle management
- **Order Items** (`order_items`): Individual product items within orders
- **Payments** (`payments`): Payment transaction records
- **Returns** (`returns`): Return and refund processing

#### System Features
- **Notifications** (`notifications`): User notification system
- **Reports** (`reports`): Business analytics and reporting

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MySQL 5.7+ or 8.0+
- Clerk.dev account (for authentication)
- Stripe account (for payments)
- Google Cloud Vision API credentials (for image analysis)

### Installation

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd fashion-mart-backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE fashionmart;
   EXIT;
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   # Server runs on http://localhost:5000
   # API Documentation: http://localhost:5000/api-docs
   ```

## ⚙️ Configuration

### Environment Variables (.env)

#### Database Configuration
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_strong_password
DB_NAME=fashionmart
```

#### Server Configuration
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

#### Authentication (Clerk)
```env
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
JWT_SECRET=your_32_char_jwt_secret
```

#### Email Configuration
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

#### Payment Processing (Stripe)
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

#### AI Services
```env
GOOGLE_APPLICATION_CREDENTIALS=./config/google-vision-credentials.json
```

### Google Cloud Vision Setup
1. Create a Google Cloud project
2. Enable Vision API
3. Create service account and download JSON credentials
4. Place credentials file in `/config/google-vision-credentials.json`

## 🔐 Authentication & Authorization

### Authentication Flow
- **Primary**: Clerk.dev session-based authentication
- **Token**: JWT tokens for API access
- **Webhooks**: Clerk webhook integration for user sync

### User Roles & Permissions

| Role | Permissions |
|------|------------|
| `admin` | Full system access, user management, reports |
| `designer` | Product creation, design management |
| `customer` | Shopping, order placement, returns |
| `staff` | Order processing, customer support |
| `inventory_manager` | Stock management, inventory reports |

### Protected Routes
```javascript
// Role-based middleware examples
app.use('/api/admin/*', verifySession, isAdmin);
app.use('/api/designer/*', verifySession, isDesigner);
app.use('/api/inventory/*', verifySession, isAdminOrInventoryManager);
```

## 📡 API Endpoints

### Core API Structure
```
/api
├── /auth              # Authentication & session management
├── /admin             # Administrative functions
├── /customer          # Customer operations
├── /designer          # Designer tools & product creation
├── /staff             # Staff operations
├── /inventory         # Inventory management
├── /products          # Product catalog
├── /categories        # Category management
├── /orders            # Order processing
├── /payments          # Payment processing
└── /reports           # Analytics & reporting
```

### Key Endpoint Examples

#### Authentication
- `POST /api/auth/webhook` - Clerk webhook handler
- `GET /api/auth/session` - Get current user session

#### Products
- `GET /api/products` - List products (with filtering)
- `POST /api/products` - Create product (designers)
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

#### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders (role-based filtering)
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/return` - Process return

#### Inventory
- `GET /api/inventory/stock` - Stock levels
- `PUT /api/inventory/stock/:id` - Update stock
- `POST /api/inventory/restock` - Restock items
- `GET /api/inventory/alerts` - Low stock alerts

## 🛡️ Security Features

### Security Middleware Stack
1. **Helmet**: Security headers (CSP, HSTS, XSS protection)
2. **CORS**: Configured for specific origins only
3. **Rate Limiting**: 1000 requests per 15 minutes per IP
4. **Speed Limiting**: Progressive delays after 500 requests
5. **Input Sanitization**: XSS prevention for all inputs
6. **Security Logging**: Comprehensive security event logging

### Data Protection
- **Password Security**: Handled by Clerk (bcrypt + salt)
- **JWT Tokens**: Secure token generation and validation
- **SQL Injection**: Sequelize ORM prevents SQL injection
- **XSS Prevention**: Input sanitization and CSP headers
- **CSRF Protection**: Token-based CSRF protection

### Logging & Monitoring
```javascript
// Winston logger configuration
- Error logs: logs/error-YYYY-MM-DD.log
- Combined logs: logs/combined-YYYY-MM-DD.log
- HTTP requests: Morgan middleware with Winston stream
- Security events: Detailed security logging
```

## 🎯 Business Features

### Multi-Role Management
- **Customers**: Browse, purchase, track orders, returns
- **Designers**: Create products, manage designs, view sales
- **Staff**: Process orders, handle customer service
- **Inventory Managers**: Manage stock, generate reports
- **Admins**: Full system control and analytics

### Advanced Inventory
- **Size/Color Variants**: Multiple variants per product
- **Stock Tracking**: Real-time inventory levels
- **Low Stock Alerts**: Automated notifications
- **Restock Management**: Purchase order integration

### Order Processing
- **Status Tracking**: Pending → Processing → Shipped → Delivered
- **Payment Integration**: Stripe payment processing
- **Return Management**: Customer returns and refunds
- **Order Analytics**: Sales reporting and insights

### AI-Powered Features
- **Image Analysis**: Google Vision API for product images
- **Smart Categorization**: AI-assisted product categorization
- **Quality Assessment**: Automated image quality checks

## 📊 Monitoring & Analytics

### System Monitoring
- **Health Check**: `GET /api/health`
- **Database Monitoring**: Connection pool status
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Request timing and throughput

### Business Analytics
- **Sales Reports**: Revenue tracking and analysis
- **Inventory Reports**: Stock levels and movement
- **User Analytics**: Customer behavior insights
- **Performance Dashboards**: Real-time business metrics

## 🔧 Development

### Scripts
```bash
npm start          # Production server
npm run dev        # Development with nodemon
npm run build      # No build required for Node.js
npm test           # Run Jest tests

# API Documentation available at:
# Development: http://localhost:5000/api-docs
# Production: http://your-domain:5000/api-docs
```

### Code Structure
```
/
├── server.js              # Application entry point
├── /config               # Configuration files
├── /controllers          # Business logic controllers
├── /middleware          # Express middleware
├── /models              # Sequelize database models
├── /routes              # API route definitions
├── /services            # Business service layer
├── /utils               # Utility functions
├── /logs                # Application logs
├── /uploads             # File uploads
└── /reports             # Generated reports
```

### Database Management
```javascript
// Auto-sync on startup (development)
await db.sequelize.sync({ force: false });

// Production: Manual migrations recommended
// Use Sequelize CLI for production deployments
```

### Testing
```bash
# Run test suite
npm test

# Test specific modules
npm test -- --testPathPattern=auth
npm test -- --testPathPattern=products
```


### Documentation Features
- Complete API endpoint documentation
- Request/response schemas
- Authentication examples
- Interactive API testing
- Error response documentation

## 🚀 Deployment

### Production Checklist
1. **Environment Variables**
   - Set strong JWT_SECRET (32+ characters)
   - Configure production database
   - Set NODE_ENV=production
   - Update CLIENT_URL for production frontend

2. **Database**
   - Run production migrations
   - Set up database backups
   - Configure connection pooling

3. **Security**
   - Enable HTTPS
   - Configure proper CORS origins
   - Set up rate limiting for production
   - Review security headers

4. **Monitoring**
   - Set up error tracking (Sentry, etc.)
   - Configure log aggregation
   - Set up health checks
   - Monitor database performance

### Environment-Specific Configs
```bash
# Development
NODE_ENV=development

# Staging
NODE_ENV=staging

# Production
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards
- Follow ESLint configuration
- Write comprehensive tests
- Document API changes
- Update README for new features

## 📞 Support

### Technical Support
- **Documentation**: `http://localhost:5000/api-docs` for complete API reference
- **Health Check**: `/api/health` for system status
- **Logs**: Check `logs/` directory for detailed error information

### Business Logic
- Multi-tenant fashion marketplace
- Role-based inventory management
- Integrated payment processing
- AI-powered product analysis

---

**Version**: 1.0.0
**License**: MIT
**Author**: Fashion Mart Team

For additional support or questions, please refer to the API documentation at `http://localhost:5000/api-docs` when the server is running.