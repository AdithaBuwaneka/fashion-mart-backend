# FASHION MART BACKEND - API DOCUMENTATION

## 📚 Complete API Reference Guide

**Version:** 1.0.0  
**Base URL:** `http://localhost:5000/api`  
**Authentication:** JWT Bearer Token  
**Status:** ✅ Production Ready  

---

## 🔐 AUTHENTICATION

### Authentication Headers
```javascript
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

### User Roles
- **admin** - Full system access
- **customer** - Customer operations
- **designer** - Design management
- **staff** - Order/return processing
- **inventory_manager** - Inventory management

---

## 🌐 PUBLIC ENDPOINTS

### Health Check
- **GET** `/health`
- **Description:** System health status
- **Auth Required:** No
- **Response:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2025-09-13T12:00:00.000Z"
}
```

### Products
- **GET** `/products` - Get all products
- **GET** `/products?page=1&limit=10` - Paginated products
- **GET** `/products?search=dress` - Search products
- **GET** `/products?category=1` - Filter by category
- **GET** `/products?minPrice=10&maxPrice=100` - Price range filter

### Categories
- **GET** `/categories` - Get all public categories

---

## 🔐 AUTHENTICATION ENDPOINTS

### Session Management
- **GET** `/auth/session` - Validate current session
- **POST** `/auth/webhook` - Clerk webhook handler
- **GET** `/auth/profile` - Get user profile
- **POST** `/auth/sync` - Sync user from Clerk
- **PATCH** `/auth/user/:id/role` - Update user role

---

## 👑 ADMIN ENDPOINTS

**Required Role:** `admin`

### Dashboard
- **GET** `/admin/dashboard/stats` - Dashboard statistics
- **GET** `/admin/users` - User management
- **GET** `/admin/reports` - All reports
- **POST** `/admin/reports/monthly` - Generate monthly report

### Bill Processing
- **POST** `/admin/bills/process` - Process bill images with AI

---

## 🛍️ CUSTOMER ENDPOINTS

**Required Role:** `customer`

### Profile Management
- **GET** `/customer/profile` - Get customer profile
- **PUT** `/customer/profile` - Update profile (with image upload)

### Order Management
- **GET** `/customer/orders` - Get order history
- **GET** `/customer/orders/:orderId` - Get specific order
- **POST** `/customer/orders` - Create new order
- **POST** `/customer/orders/:orderId/payment` - Create payment intent
- **POST** `/customer/orders/:orderId/payment/confirm` - Confirm payment

### Returns
- **GET** `/customer/returns` - Get return requests
- **POST** `/customer/returns` - Create return request (with images)

---

## 🎨 DESIGNER ENDPOINTS

**Required Role:** `designer`

### Design Management
- **GET** `/designer/designs` - Get designer portfolio
- **POST** `/designer/designs` - Create new design (with file upload)
- **GET** `/designer/designs/:designId` - Get specific design
- **PUT** `/designer/designs/:designId` - Update design
- **POST** `/designer/designs/:designId/submit` - Submit for approval

---

## 👥 STAFF ENDPOINTS

**Required Role:** `staff`

### Order Processing
- **GET** `/staff/orders/pending` - Get pending orders
- **GET** `/staff/orders/assigned` - Get assigned orders
- **POST** `/staff/orders/:orderId/assign` - Assign order
- **PUT** `/staff/orders/:orderId/status` - Update order status

### Return Processing
- **GET** `/staff/returns/pending` - Get pending returns
- **GET** `/staff/returns/assigned` - Get assigned returns
- **POST** `/staff/returns/:returnId/assign` - Assign return
- **PUT** `/staff/returns/:returnId/process` - Process return

---

## 📦 INVENTORY ENDPOINTS

**Required Role:** `inventory_manager`

### Category Management
- **GET** `/inventory/categories` - Get all categories
- **POST** `/inventory/categories` - Create category
- **PUT** `/inventory/categories/:categoryId` - Update category

### Product Management
- **GET** `/inventory/products` - Get all products
- **POST** `/inventory/products` - Create product
- **GET** `/inventory/stock/low` - Get low stock items

### Design Review
- **GET** `/inventory/designs/pending` - Get pending designs
- **POST** `/inventory/designs/:designId/review` - Approve/reject design

---

## 📋 ORDER ENDPOINTS

**Required Role:** Authenticated users

### General Order Management
- **GET** `/orders` - Get all orders (admin/staff)
- **POST** `/orders` - Create order (any authenticated user)
- **GET** `/orders/:orderId` - Get specific order (admin/staff)
- **PUT** `/orders/:orderId/status` - Update order status (admin/staff)
- **GET** `/orders/analytics` - Order analytics (admin/staff)
- **GET** `/orders/export` - Export orders report (admin/staff)

---

## 💳 PAYMENT ENDPOINTS

### Payment Processing
- **GET** `/payments/:paymentId` - Get payment details (role-restricted)

---

## 📊 REPORT ENDPOINTS

**Required Role:** `admin`

### Report Management
- **GET** `/reports` - Get all reports
- **POST** `/reports` - Create custom report
- **GET** `/reports/:reportId` - Get specific report
- **POST** `/reports/monthly` - Generate monthly report
- **POST** `/reports/quarterly` - Generate quarterly report
- **DELETE** `/reports/:reportId` - Delete report

---

## 📁 FILE UPLOAD ENDPOINTS

### Supported File Types
- **Images:** PNG, JPG, JPEG, GIF
- **Documents:** PDF
- **Size Limit:** 10MB per file

### Upload Endpoints
- **POST** `/admin/bills/process` - Bill image upload
- **POST** `/designer/designs` - Design file upload
- **PUT** `/customer/profile` - Profile image upload
- **POST** `/customer/returns` - Return images upload

---

## 🔒 SECURITY FEATURES

### Rate Limiting
- **API Requests:** 1000 requests per 15 minutes
- **Speed Limiting:** Delays after 500 requests
- **Max Delay:** 2 seconds

### Security Headers
- **Helmet.js:** XSS protection, content security policy
- **CORS:** Configured for specific origins
- **Input Sanitization:** XSS and injection protection

### Authentication
- **JWT Tokens:** Secure token-based authentication
- **Role-Based Access:** Fine-grained permission control
- **Session Validation:** Real-time session checking

---

## 📈 RESPONSE FORMATS

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Technical error details"
}
```

### Pagination Response
```json
{
  "success": true,
  "data": {
    "items": [/* array of items */],
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

## 🚀 STATUS CODES

- **200:** Success
- **201:** Created
- **400:** Bad Request
- **401:** Unauthorized
- **403:** Forbidden
- **404:** Not Found
- **429:** Too Many Requests
- **500:** Internal Server Error

---

## 🔧 TESTING

### Test Files Available
- `EXHAUSTIVE_ENDPOINT_TEST.js` - Complete endpoint testing
- `FINAL_DEMO.js` - End-to-end workflow demonstration
- `test-file-upload.js` - File upload testing
- `comprehensive-test.js` - Authentication testing

### Running Tests
```bash
# Start server
npm start

# Run comprehensive test
node FINAL_DEMO.js

# Run exhaustive endpoint test
node EXHAUSTIVE_ENDPOINT_TEST.js
```

---

**Documentation Status:** ✅ Complete and Up-to-Date  
**API Coverage:** 100% of all endpoints documented  
**Testing Status:** ✅ All endpoints tested and verified  