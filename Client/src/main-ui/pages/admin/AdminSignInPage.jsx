import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ToastMessage from '../../components/common/ToastMessage';
import { useTimedToast } from '../../hooks/useTimedToast';
import { login } from '../../services/authApi';

const AdminSignInPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showToast } = useTimedToast(4000);

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please fix the errors', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const response = await login({ email, password });

      if (response.accessToken) {
        // Set admin auth with separate keys
        localStorage.setItem('adminAuthToken', response.accessToken);
        localStorage.setItem('adminUserId', response.userId);
        localStorage.setItem('adminName', response.name);
        localStorage.setItem('adminRole', response.role);
      }

      if (response.role !== 'admin') {
        showToast('Admin credentials required', 'error');
        localStorage.removeItem('adminAuthToken');
        localStorage.removeItem('adminUserId');
        localStorage.removeItem('adminName');
        localStorage.removeItem('adminRole');
        setIsLoading(false);
        return;
      }

      showToast('Admin sign in successful!', 'success');
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (err) {
      showToast(err.message || 'Sign in failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center px-4">
      <main className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl font-bold text-amber-700 mb-2">Admin Portal</h1>
            <p className="text-sm text-stone-600">Authorized personnel only</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-stone-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({ ...errors, email: '' });
                }}
                className={`mt-2 w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                  errors.email ? 'border-red-300 focus:ring-red-200' : 'border-stone-300 focus:ring-amber-200'
                }`}
                placeholder="admin@general-store.local"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-stone-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: '' });
                }}
                className={`mt-2 w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                  errors.password ? 'border-red-300 focus:ring-red-200' : 'border-stone-300 focus:ring-amber-200'
                }`}
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full rounded-lg bg-amber-600 py-2.5 font-semibold text-white transition hover:bg-amber-700 disabled:bg-stone-400"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </main>

      <ToastMessage toast={toast} />
    </div>
  );
};

export default AdminSignInPage;
