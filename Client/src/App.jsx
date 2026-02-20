import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './main-ui/pages/HomePage.jsx';
import SignInPage from './main-ui/pages/SignInPage.jsx';
import SignUpPage from './main-ui/pages/SignUpPage.jsx';
import ForgotPasswordPage from './main-ui/pages/ForgotPasswordPage.jsx';
import CategoryPage from './main-ui/pages/CategoryPage.jsx';
import CartPage from './main-ui/pages/CartPage.jsx';
import CheckoutPage from './main-ui/pages/CheckoutPage.jsx';
import ProfilePage from './main-ui/pages/ProfilePage.jsx';
import OrderDetailPage from './main-ui/pages/OrderDetailPage.jsx';
import AdminDashboard from './main-ui/pages/admin/AdminDashboard.jsx';
import AdminProducts from './main-ui/pages/admin/AdminProducts.jsx';
import AdminOrders from './main-ui/pages/admin/AdminOrders.jsx';
import AdminUsers from './main-ui/pages/admin/AdminUsers.jsx';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/category/:category" element={<CategoryPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/orders/:orderId" element={<OrderDetailPage />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/products" element={<AdminProducts />} />
      <Route path="/admin/orders" element={<AdminOrders />} />
      <Route path="/admin/users" element={<AdminUsers />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
