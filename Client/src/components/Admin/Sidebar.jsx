import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const menuItems = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Products', path: '/admin/products' },
  { label: 'Categories', path: '/admin/categories' },
  { label: 'Orders', path: '/admin/orders' },
  { label: 'Settings', path: '/admin/settings' }
];

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.brand}>General Store</div>
        <nav className={styles.nav}>
          {menuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ''}`
              }
              onClick={onClose}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div
        className={`${styles.backdrop} ${isOpen ? styles.show : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
    </>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default Sidebar;
