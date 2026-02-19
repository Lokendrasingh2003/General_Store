import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/Admin/AdminLayout.jsx';
import AdminRoute from './components/Admin/AdminRoute.jsx';
import DashboardPage from './pages/Admin/DashboardPage.jsx';
import ProductsPage from './pages/Admin/ProductsPage.jsx';
import CategoriesPage from './pages/Admin/CategoriesPage.jsx';
import OrdersPage from './pages/Admin/OrdersPage.jsx';
import SettingsPage from './pages/Admin/SettingsPage.jsx';
import HomePage from './pages/HomePage.jsx';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
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
