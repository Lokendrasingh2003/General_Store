import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';

const isAdminAuthenticated = () => {
  const token = localStorage.getItem('adminToken');
  const role = localStorage.getItem('userRole');
  return Boolean(token) && role === 'admin';
};

const AdminRoute = ({ children }) => {
  const location = useLocation();

  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
};

AdminRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default AdminRoute;
