import PropTypes from 'prop-types';
import styles from './Header.module.css';

const Header = ({ onToggleSidebar }) => {
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userRole');
    window.location.href = '/admin/login';
  };

  return (
    <header className={styles.header}>
      <button
        className={styles.menuButton}
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>
      <div className={styles.title}>Admin Dashboard</div>
      <div className={styles.profile}>
        <div className={styles.avatar}>A</div>
        <div className={styles.profileInfo}>
          <span className={styles.name}>Admin</span>
          <span className={styles.role}>Store Manager</span>
        </div>
        <button className={styles.logout} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

Header.propTypes = {
  onToggleSidebar: PropTypes.func.isRequired
};

export default Header;
