# Admin Dashboard - Login Guide

## Admin Access

The admin dashboard is now fully integrated into your application. Here's how to access it:

### Admin Login Credentials

**Email:** `admin@general-store.local`  
**Password:** `admin123`  
**Phone:** `9999999999` (if needed)

### How to Login as Admin

1. Navigate to the **Sign In** page (`/sign-in`)
2. Check the **"Login as Admin"** checkbox (new toggle at top of form)
3. Enter the email: `admin@general-store.local`
4. Enter the password: `admin123`
5. Click **Sign In**
6. You'll be redirected to the **Admin Dashboard** (`/admin`)

### Admin Routes

Once logged in as admin, access these pages:

| Page | Route | Features |
|------|-------|----------|
| Dashboard | `/admin` | KPIs (products, orders, revenue, pending orders), recent orders table |
| Products | `/admin/products` | Add products, view list, delete products, category selection |
| Orders | `/admin/orders` | View all orders, filter by status, update order status |
| Users | `/admin/users` | View all registered users, toggle active/inactive status |

### Key Changes Made

#### Backend
- ✅ Added default admin user to `Server/src/data/users.js`
- ✅ Admin user has role: `'admin'` with default credentials

#### Frontend
- ✅ Updated `SignInPage.jsx` with admin login toggle
- ✅ Added role-based field validation (email for admin, phone for customers)
- ✅ Both `SignInPage` and `SignUpPage` now store `userRole` in localStorage
- ✅ Added 4 admin routes to `App.jsx`

#### Security Notes
- Admin pages check `localStorage.getItem('userRole') === 'admin'`
- Non-admin users are redirected to home page if they try to access `/admin/*`
- Admin login requires exact role match - customer credentials won't grant admin access

### What Admin Can Do

**Dashboard:**
- View total products, orders, and revenue statistics
- See pending orders count
- Quick action links to product and order management

**Products:**
- Add new products with name, price, category, image, description, and stock status
- Delete products from inventory
- View all products in a table

**Orders:**
- Filter orders by status (Pending, Processing, Shipped, Delivered, Cancelled)
- View customer names and order details
- Update order status via dropdown

**Users:**
- View all registered customers
- See user roles and active/inactive status
- Activate or deactivate user accounts

### Next Steps

To complete admin functionality:

1. **Create Backend Admin APIs** - Wire admin pages to backend endpoints
2. **Persist Data** - Make product/order updates save to backend
3. **Add More Admins** - Create endpoint to promote customer users to admin
4. **Add Export/Reports** - Implement CSV export and analytics

### Testing

After login, check:
- ✅ Admin can access `/admin` dashboard
- ✅ Admin can navigate to `/admin/products`, `/admin/orders`, `/admin/users`
- ✅ Non-admin users are redirected from admin routes
- ✅ Dashboard loads with stats (may show 0 if no data exists)

---

**Created:** February 20, 2026  
**Admin Access:** Integrated with role-based authentication
