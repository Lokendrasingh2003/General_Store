# General Store - Project Documentation

## 1. Overview
General Store is a full-stack web app with customer storefront + admin panel.

- Frontend: React (Vite), Tailwind CSS, Material UI
- Backend: Node.js, Express
- Data: In-memory collections (products, users, orders, addresses)
- Image Upload: Multer-based local upload

---

## 2. Project Structure

- `Client/` - frontend application
- `Server/` - backend APIs
- `Server/uploads/products/` - uploaded product images

Key frontend areas:
- `Client/src/main-ui/pages/` - app pages
- `Client/src/main-ui/pages/admin/` - admin pages
- `Client/src/main-ui/components/Home/SmartBasketCard.jsx` - product card UI
- `Client/src/main-ui/services/` - API service wrappers

Key backend areas:
- `Server/src/app.js` - API registration
- `Server/src/server.js` - server bootstrap
- `Server/src/controllers/` - business logic
- `Server/src/routes/` - route mapping
- `Server/src/data/` - in-memory datasets
- `Server/src/utils/imageService.js` - image upload URL/service logic

---

## 3. Run Locally

### Backend
```bash
cd Server
npm install
npm run dev
```
Backend runs at: `http://localhost:5000`

### Frontend
```bash
cd Client
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 4. Environment
Frontend uses:
- `VITE_API_BASE_URL` (default: `http://localhost:5000`)

Backend uses:
- `PORT` (default: `5000`)
- `API_BASE_URL` (used by upload URL generation; default: `http://localhost:5000`)
- `STORAGE_TYPE` (`local` recommended in this setup)

---

## 5. Main API Endpoints

### Public / Customer
- `GET /api/products`
- `GET /api/products/categories`
- `GET /api/products/category/:category`
- `GET /api/products/:id`
- `GET /api/products/suggestions`

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/profile`
- `POST /api/auth/forgot-password`
- `POST /api/auth/verify-otp`
- `POST /api/auth/reset-password`

### Orders
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:orderId`
- `POST /api/orders/:orderId/cancel`

### Addresses
- `POST /api/addresses`
- `GET /api/addresses`
- `PUT /api/addresses/:addressId`
- `DELETE /api/addresses/:addressId`

### Admin
- `POST /api/admin/products`
- `PUT /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `GET /api/admin/orders`
- `PUT /api/admin/orders/:id/status`
- `GET /api/admin/users`
- `PUT /api/admin/users/:id/toggle-status`
- `PUT /api/admin/users/:id/promote`

### Upload
- `POST /api/upload` (single image, form-data field: `image`)
- `POST /api/upload/batch`
- Static images: `GET /uploads/products/:filename`

---

## 6. Admin Panel Features

### Admin Products
- Material UI DataGrid
- Search + category filter
- Add product with weight variants
- Edit product (name/category/description/image/stock/weights)
- Delete product (confirmation popup)
- Stock toggle button in action column
- Success popups for add/edit/delete actions

### Admin Orders
- Material table for order listing
- Status update via dropdown

### Admin Users
- User list, active/inactive toggle, role handling

---

## 7. Product Model (Used in App)
Typical product fields:
- `_id`, `name`, `brand`, `category`
- `image`, `images[]`
- `price`, `originalPrice`, `discountPercent`
- `inStock`
- `weights[]`:
  - `label`, `value`, `price`, `originalPrice`, `discountPercent`

Stock behavior:
- `inStock === false` means out of stock
- frontend product cards show unavailable state for out-of-stock items

---

## 8. Image Upload Flow
1. Admin selects image in product form.
2. Frontend calls `POST /api/upload` with `FormData(image)`.
3. Backend stores file in `Server/uploads/products/`.
4. Backend returns image URL under `/uploads/products/...`.
5. Product create/update API stores returned URL.
6. Frontend card/table renders image using resolved URL.

Validation:
- Allowed formats: jpeg/png/gif/webp
- Max size: ~5 MB for product images

---

## 9. Frontend Out-of-Stock UX
In `SmartBasketCard`:
- Out-of-stock card shows `Unavailable` badge
- Card gets subtle red-tint shadow
- Add button is disabled and non-clickable
- `handleAdd` returns early for out-of-stock products

---

## 10. Known Constraints
- Data is in-memory; restarting backend resets runtime changes.
- Docker compose may fail for old/unavailable image tags in current setup.
- For production: migrate data to DB and add full auth security.

---

## 11. Troubleshooting

### `POST /api/upload` returns 404
- Ensure backend is running with latest code:
```bash
cd Server
npm run dev
```
- Verify route exists in `Server/src/app.js` as `/api/upload`.

### `Cannot find module 'aws-sdk'`
- Current code supports local mode without AWS.
- Keep `STORAGE_TYPE=local` and restart backend.

### Product add not visible immediately
- Ensure API returns success.
- Products list refresh is triggered after add in admin products page.
- Clear category/search filters if needed.

### Push to GitHub denied (403)
- Current authenticated GitHub user lacks write permission.
- Use account with repo access or add collaborator permission.

---

## 12. Default Admin Login
- Email: `admin@general-store.local`
- Password: `admin123`

---

## 13. Suggested Next Improvements
- Persistent database (MongoDB/PostgreSQL)
- Role-based token auth on all admin APIs
- Better file storage (Cloudinary/S3) with env-based switch
- Unit/integration tests
- CI pipeline + deployment config hardening
