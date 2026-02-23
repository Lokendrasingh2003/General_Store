import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainHeader from '../components/Header/MainHeader';
import ToastMessage from '../components/common/ToastMessage';
import { useTimedToast } from '../hooks/useTimedToast';
import { login } from '../services/authApi';

const SignInPage = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showToast } = useTimedToast(4000);

  const validateForm = () => {
    const newErrors = {};
    if (isAdminLogin) {
      // Admin login validation
      if (!phoneNumber) newErrors.phoneNumber = 'Phone number is required';
      if (!password) newErrors.password = 'Password is required';
    } else {
      // Regular customer login validation
      if (!phoneNumber) newErrors.phoneNumber = 'Mobile number is required';
      if (phoneNumber && !/^[0-9]{10}$/.test(phoneNumber.replace(/\D/g, ''))) {
        newErrors.phoneNumber = 'Mobile number must be 10 digits';
      }
      if (!password) newErrors.password = 'Password is required';
    }
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
      const response = await login({
        email: isAdminLogin ? phoneNumber : `${phoneNumber}@general-store.local`,
        password
      });

      // Store auth tokens
      if (response.accessToken) {
        localStorage.setItem('authToken', response.accessToken);
        localStorage.setItem('userId', response.userId);
        localStorage.setItem('userName', response.name);
        localStorage.setItem('userRole', response.role);
      }

      // Check if user has correct role
      if (isAdminLogin && response.role !== 'admin') {
        showToast('Admin credentials required', 'error');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        setIsLoading(false);
        return;
      }

      showToast('Sign in successful!', 'success');
      setTimeout(() => {
        navigate(isAdminLogin ? '/admin' : '/');
      }, 1500);
    } catch (err) {
      showToast(err.message || 'Sign in failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      <MainHeader />
      <main className="mx-auto flex min-h-[calc(100vh-70px)] max-w-md flex-col justify-center px-4 py-12">
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-stone-900">
                {isAdminLogin ? 'Admin Access' : 'Welcome Back'}
              </h1>
              <p className="text-xs text-stone-500">
                {isAdminLogin ? 'Admin credentials required' : 'Sign in to continue shopping'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Admin Login Toggle */}
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-stone-50 p-3">
              <input
                type="checkbox"
                id="adminToggle"
                checked={isAdminLogin}
                onChange={(e) => {
                  setIsAdminLogin(e.target.checked);
                  setPhoneNumber('');
                  setPassword('');
                  setErrors({});
                }}
                className="h-4 w-4 rounded border-stone-300 text-primary-600"
              />
              <label htmlFor="adminToggle" className="text-sm font-semibold text-stone-700">
                Login as Admin
              </label>
            </div>

            {/* Phone/Email Field */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-semibold text-stone-700">
                {isAdminLogin ? 'Email Address' : 'Mobile Number'}
              </label>
              {!isAdminLogin && (
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-2.5 focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-200">
                  <span className="text-sm font-semibold text-stone-600">+91</span>
                  <input
                    id="phoneNumber"
                    type="tel"
                    maxLength="10"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value.replace(/\D/g, ''));
                      setErrors({ ...errors, phoneNumber: '' });
                    }}
                    className="flex-1 border-0 bg-transparent text-sm focus:outline-none focus:ring-0"
                    placeholder="9876543210"
                  />
                </div>
              )}
              {isAdminLogin && (
                <input
                  id="phoneNumber"
                  type="email"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setErrors({ ...errors, phoneNumber: '' });
                  }}
                  className={`mt-2 w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                    errors.phoneNumber ? 'border-red-300 focus:ring-red-200' : 'border-stone-300 focus:ring-primary-200'
                  }`}
                  placeholder="admin@general-store.local"
                />
              )}
              {errors.phoneNumber && <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>}
            </div>

            {/* Password Field */}
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
                  errors.password ? 'border-red-300 focus:ring-red-200' : 'border-stone-300 focus:ring-primary-200'
                }`}
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full rounded-lg bg-primary-600 py-2.5 font-semibold text-white transition hover:bg-primary-700 disabled:bg-stone-400"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-stone-600">
            Don't have an account?{' '}
            <Link to="/sign-up" className="font-semibold text-primary-600 hover:text-primary-700">
              Sign Up
            </Link>
          </p>

          {/* Back to Home */}
          <Link to="/" className="mt-4 block text-center text-xs text-stone-500 hover:text-stone-700">
            ← Back to Home
          </Link>
        </div>
      </main>

      <ToastMessage toast={toast} />
    </div>
  );
};

export default SignInPage;
