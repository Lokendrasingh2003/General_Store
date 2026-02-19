import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/Admin/AdminLayout.jsx';
import AdminRoute from './components/Admin/AdminRoute.jsx';
import DashboardPage from './pages/Admin/DashboardPage.jsx';
import ProductsPage from './pages/Admin/ProductsPage.jsx';
import CategoriesPage from './pages/Admin/CategoriesPage.jsx';
import OrdersPage from './pages/Admin/OrdersPage.jsx';
import SettingsPage from './pages/Admin/SettingsPage.jsx';
import AdminLoginPage from './pages/HomePage.jsx';
import HomePage from './main-ui/pages/HomePage.jsx';
import SignInPage from './main-ui/pages/SignInPage.jsx';
import SignUpPage from './main-ui/pages/SignUpPage.jsx';
import CategoryPage from './main-ui/pages/CategoryPage.jsx';
import CartPage from './main-ui/pages/CartPage.jsx';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/category/:category" element={<CategoryPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
