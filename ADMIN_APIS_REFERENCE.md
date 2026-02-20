# Admin APIs - Quick Reference

## Base URL
```
http://localhost:5000/api
```

---

## Authentication

### Login (Any User)
```
POST /auth/login
Content-Type: application/json

{
  "email": "admin@general-store.local",
  "password": "admin123"
}

Response:
{
  "success": true,
  "data": {
    "userId": "admin-001",
    "name": "Admin User",
    "role": "admin",
    "accessToken": "admin-001"
  }
}
```

---

## Admin Products APIs

### Add Product
```
POST /admin/products
Content-Type: application/json

{
  "name": "Product Name",
  "price": 500,
  "originalPrice": 600,
  "category": "kitchen",
  "image": "https://...",
  "description": "Product description",
  "inStock": true
}

Response: {
  "success": true,
  "data": {
    "_id": "prod-1771597020607",
    "name": "Product Name",
    "price": 500,
    ...
  }
}
```

### Update Product
```
PUT /admin/products/:productId
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 450,
  ...
}
```

### Delete Product
```
DELETE /admin/products/:productId

Response: {
  "success": true,
  "message": "Product deleted successfully"
}
```

### Get All Products
```
GET /api/products

Returns: Array of products
```

---

## Admin Orders APIs

### Get All Orders
```
GET /admin/orders

Response: {
  "success": true,
  "data": [
    {
      "id": "order-123",
      "status": "pending",
      "createdAt": "2026-02-20T...",
      "items": [...],
      "pricing": { "subtotal": 1000, "tax": 100, "grandTotal": 1100 }
    }
  ]
}
```

### Update Order Status
```
PUT /admin/orders/:orderId/status
Content-Type: application/json

{
  "status": "confirmed"
}

Valid statuses:
- pending
- confirmed
- packed
- shipped
- out_for_delivery
- delivered
- cancelled

Response: {
  "success": true,
  "message": "Order status updated successfully",
  "data": { "id": "order-123", "status": "confirmed", ... }
}
```

---

## Admin Users APIs

### Get All Users
```
GET /admin/users

Response: {
  "success": true,
  "data": [
    {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "role": "customer",
      "isActive": true,
      "createdAt": "2026-02-20T..."
    }
  ]
}
```

### Toggle User Active/Inactive Status
```
PUT /admin/users/:userId/toggle-status
Content-Type: application/json

Response: {
  "success": true,
  "message": "User activated successfully",
  "data": {
    "id": "user-123",
    "name": "John Doe",
    "isActive": true,
    ...
  }
}
```

### Promote User to Admin
```
PUT /admin/users/:userId/promote
Content-Type: application/json

Response: {
  "success": true,
  "message": "User promoted to admin successfully",
  "data": {
    "id": "user-123",
    "name": "John Doe",
    "role": "admin",
    ...
  }
}
```

---

## Error Responses

All endpoints return error responses in this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (missing/invalid fields)
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (user not active)
- `404` - Not Found (resource doesn't exist)
- `500` - Server Error

---

## Frontend Integration Examples

### Add Product (AdminProducts.jsx)
```javascript
const response = await fetch('http://localhost:5000/api/admin/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, price, category, ... })
});
```

### Update Order Status (AdminOrders.jsx)
```javascript
const response = await fetch(
  `http://localhost:5000/api/admin/orders/${orderId}/status`,
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'confirmed' })
  }
);
```

### Get Users (AdminUsers.jsx)
```javascript
const response = await fetch('http://localhost:5000/api/admin/users');
const data = await response.json();
setUsers(data.data);
```

---

## Default Admin Account

```
Email: admin@general-store.local
Password: admin123
Role: admin
ID: admin-001
```

This account is seeded in `Server/src/data/users.js`

---

## Testing with cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@general-store.local","password":"admin123"}'

# Add product
curl -X POST http://localhost:5000/api/admin/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Rice","price":500,"category":"kitchen"}'

# Get users
curl http://localhost:5000/api/admin/users

# Update order status
curl -X PUT http://localhost:5000/api/admin/orders/order-123/status \
  -H "Content-Type: application/json" \
  -d '{"status":"confirmed"}'
```

---

## Notes

- All data is stored in-memory (resets on server restart)
- Passwords are NOT hashed (for development only)
- No authentication middleware on admin routes (add in production)
- For production deployment, add proper security:
  - JWT token validation
  - Password hashing
  - Rate limiting
  - Input validation
  - HTTPS only
  - CORS restrictions
