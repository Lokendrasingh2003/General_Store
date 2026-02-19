import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import styles from './AdminLayout.module.css';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      <div className={styles.content}>
        <Header onToggleSidebar={handleToggleSidebar} />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
