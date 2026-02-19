import styles from './AdminPages.module.css';

const DashboardPage = () => {
  return (
    <div className={styles.page}>
      <h1>Dashboard</h1>
      <p>Overview of store performance, sales, and inventory status.</p>
    </div>
  );
};

export default DashboardPage;
