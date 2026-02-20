# Backend Structure + Agent Prompt (General Store)

## 1) Goal
Create backend based on current frontend progress:
- Category click and View All already route to category page.
- Category page currently uses demo data.
- Next step is backend APIs so frontend can switch from demo to API later.

Keep implementation clean, modular, and production-ready.

---

## 2) Recommended Backend Stack
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT auth
- Bcrypt password hashing
- OTP flow (Redis preferred, Mongo fallback)
- Joi/Zod validation
- Central error handling

---

## 3) Folder Structure

```text
Server/
  src/
    server.js
    app.js

    config/
      environment.js
      database.js
      redis.js                 # optional

    routes/
      index.js

    modules/
      auth/
        auth.routes.js
        auth.controller.js
        auth.service.js
        auth.repository.js
        auth.validation.js

      products/
        products.routes.js
        products.controller.js
        products.service.js
        products.repository.js
        products.validation.js

      categories/
        categories.routes.js
        categories.controller.js
        categories.service.js

      cart/
        cart.routes.js
        cart.controller.js
        cart.service.js

      orders/
        orders.routes.js
        orders.controller.js
        orders.service.js
        orders.repository.js
        orders.validation.js

      adminOrders/
        adminOrders.routes.js
        adminOrders.controller.js
        adminOrders.service.js

    models/
      User.js
      Product.js
      Category.js
      Cart.js
      Order.js
      OtpToken.js

    middleware/
      auth.middleware.js
      validate.middleware.js
      error.middleware.js
      rateLimit.middleware.js

    utils/
      ApiError.js
      ApiResponse.js
      token.js
      password.js
      otp.js
      pagination.js

    constants/
      categories.js
      roles.js

    scripts/
      seedCategories.js
      seedDemoProducts.js

  tests/
    auth.test.js
    products.test.js
    categories.test.js
    orders.test.js
```

---

## 4) API Contract (Frontend-compatible)

### Product + Category APIs
- GET /api/products
- GET /api/products/:id
- GET /api/products/categories
- GET /api/products/category/:category

### Auth APIs
- POST /api/auth/signup
- POST /api/auth/signin
- POST /api/auth/forgot-password/send-otp
- POST /api/auth/forgot-password/verify-otp
- POST /api/auth/forgot-password/reset

### Cart APIs
- GET /api/cart
- POST /api/cart/items
- PATCH /api/cart/items/:id
- DELETE /api/cart/items/:id

### User Order APIs (Profile + History)
- POST /api/orders
- GET /api/orders
- GET /api/orders/:orderId
- POST /api/orders/:orderId/cancel

### Admin Order APIs
- GET /api/admin/orders
- GET /api/admin/orders/:orderId
- PATCH /api/admin/orders/:orderId/status
- PATCH /api/admin/orders/:orderId/payment-status
- POST /api/admin/orders/:orderId/notes

---

## 5) Minimal Data Models

### User
- name
- phoneNumber (unique)
- passwordHash
- role
- isVerified
- timestamps

### Product
- name
- brand
- category (slug)
- images: string[]
- price
- originalPrice
- discountPercent
- weights: [{ label, value, price, originalPrice, discountPercent }]
- isActive
- timestamps

### Category
- slug (unique)
- label
- isActive
- timestamps

### Cart
- userId
- items: [{ productId, weight, quantity, priceSnapshot }]
- timestamps

### OtpToken
- phoneNumber
- codeHash
- purpose (forgot-password/signup)
- expiresAt
- attempts
- consumed
- timestamps

### Order
- orderNumber (unique, human-readable)
- userId
- items: [{ productId, nameSnapshot, imageSnapshot, weight, unitPrice, quantity, lineTotal }]
- pricing: { subtotal, discountTotal, deliveryCharge, taxAmount, grandTotal }
- payment: { method, status, transactionId }
- shippingAddress
- status
- statusHistory: [{ status, changedBy, actorType, note, changedAt }]
- adminNotes
- placedAt
- deliveredAt
- cancelledAt
- timestamps

---

## 6A) Order Status Lifecycle (Real-world)

Use standard lifecycle values:
- pending
- confirmed
- packed
- shipped
- out_for_delivery
- delivered
- cancelled
- failed
- returned
- refunded

Rules:
- Every status change must append a statusHistory entry.
- User profile should show latest status + timeline history.
- Admin panel should allow only valid forward transitions.
- Cancellation should capture reason and actor (user/admin).
- Delivered/cancelled/failed are terminal states (except return/refund flow).

---

## 6) Response Shape (Important)
Use a consistent JSON shape so frontend integration stays easy.

Success:
```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Error:
```json
{
  "success": false,
  "message": "...",
  "errors": []
}
```

---

## 7) Implementation Notes for Agent
- Keep code modular by feature (auth/products/categories/cart/orders).
- Use controller -> service -> repository flow.
- Add request validation for all POST/PATCH routes.
- Add global error handler and async wrapper.
- Add index route aggregator in src/routes/index.js.
- Add seed scripts matching demo category slugs used in frontend:
  - kitchen
  - snacks
  - beauty
  - bakery
  - household
- Keep /api/products/category/:category response compatible with current frontend card fields.
- Support weight-wise pricing in product payload; frontend should get price by selected weight.
- Orders must store price snapshots so future product price change does not alter old orders.
- Add pagination + filters for admin orders (status, date range, search by order number/phone).
- Expose user order history endpoints for profile screen timeline.
- Log every admin/user status action in statusHistory.
- Do not break existing frontend routes.

---

## 8) Ready-to-Paste Agent Prompt

You are implementing backend for an existing General Store project.

Objective:
Build a modular Express + Mongo backend that supports current frontend flows and allows replacing demo category data with APIs.

Requirements:
1. Follow this folder structure exactly (or closest practical equivalent):
   - src/modules/auth, products, categories, cart
   - src/models, middleware, utils, config, routes, scripts
2. Implement these APIs:
   - GET /api/products
   - GET /api/products/:id
   - GET /api/products/categories
   - GET /api/products/category/:category
   - POST /api/auth/signup
   - POST /api/auth/signin
   - POST /api/auth/forgot-password/send-otp
   - POST /api/auth/forgot-password/verify-otp
   - POST /api/auth/forgot-password/reset
   - GET /api/cart
   - POST /api/cart/items
   - PATCH /api/cart/items/:id
   - DELETE /api/cart/items/:id
    - POST /api/orders
    - GET /api/orders
    - GET /api/orders/:orderId
    - POST /api/orders/:orderId/cancel
    - GET /api/admin/orders
    - GET /api/admin/orders/:orderId
    - PATCH /api/admin/orders/:orderId/status
    - PATCH /api/admin/orders/:orderId/payment-status
    - POST /api/admin/orders/:orderId/notes
3. Use JWT for auth and bcrypt for password hashing.
4. Add request validation and centralized error handling.
5. Create seed scripts for categories/products matching frontend demo slugs:
   kitchen, snacks, beauty, bakery, household.
6. Use consistent response shape:
   { success, message, data } and proper error format.
7. Add a short README section for env variables and run commands.
8. Implement order lifecycle with status history tracking for user profile and admin panel.
9. Enforce valid order status transitions in service layer.

Important compatibility constraints:
- Product object should include fields frontend already uses:
  _id, name, brand, images (or image), price, originalPrice, discountPercent, category, weights.
- Each weight option should be able to carry its own pricing:
  weights[] -> { label, value, price, originalPrice, discountPercent }.
- If weight-level price is missing, fallback to product-level price fields.
- Category endpoint must return data usable by /category/:category page directly.
- User order history endpoint must return timeline-ready statusHistory.
- Admin status update endpoint must write changedBy + actorType in history.

Deliverables:
- Complete backend code in Server/src
- Seed scripts
- Example .env template
- Brief integration notes for frontend switch from demo data to API
- Order status transition map and sample response for profile timeline

---

## 9) Frontend Switch Plan (Later)
When backend is ready:
1. In category page, replace demo map with getProductsByCategory(category).
2. Keep SmartBasketCard payload compatible.
3. Add fallback to demo only for development if API fails.

---

## 10) Frontend Order Integration Plan
1. Profile page: call GET /api/orders and show latest status badge + timeline.
2. Order detail page: call GET /api/orders/:orderId and render statusHistory chronologically.
3. Admin panel orders page: call GET /api/admin/orders with filters and pagination.
4. Admin order detail: allow status update via PATCH /api/admin/orders/:orderId/status.
5. After admin status update, frontend should refresh current order + history list.
