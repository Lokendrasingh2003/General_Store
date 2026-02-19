import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Login failed');
      }

      const accessToken = data?.data?.accessToken;
      const role = data?.data?.role;

      if (!accessToken || !role) {
        throw new Error('Invalid login response');
      }

      localStorage.setItem('adminToken', accessToken);
      localStorage.setItem('userRole', role);

      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1>General Store Admin</h1>
        <p>Sign in to access the admin dashboard and manage your store.</p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={styles.input}
            placeholder="ex@gmail.com"
            required
          />
          <label className={styles.label} htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={styles.input}
            placeholder="12345"
            required
          />
          {error && <div className={styles.error}>{error}</div>}
          <button className={styles.button} type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HomePage;
