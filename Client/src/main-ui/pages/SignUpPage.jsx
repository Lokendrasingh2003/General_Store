import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainHeader from '../components/Header/MainHeader';
import ToastMessage from '../components/common/ToastMessage';
import { useTimedToast } from '../hooks/useTimedToast';
import { register } from '../services/authApi';
import { saveAddress } from '../services/addressesApi';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [address, setAddress] = useState({
    label: '',
    fullName: '',
    phone: '',
    line1: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showToast } = useTimedToast(4000);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Mobile number is required';
    if (formData.phoneNumber && !/^[0-9]{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Mobile number must be 10 digits';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (formData.password && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : (name === 'phoneNumber' ? value.replace(/\D/g, '') : value)
    });
    setErrors({ ...errors, [name]: '' });
  };

  const handleAddressChange = (field) => (e) => {
    const value = e.target.value;
    setAddress((prev) => ({ ...prev, [field]: value }));
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
      const response = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phoneNumber,
        password: formData.password,
        role: 'customer'
      });

      // Save address if provided
      if (address.line1 && address.line1.trim().length > 0) {
        try {
          await saveAddress({
            label: address.label || 'Home',
            name: address.fullName || formData.name,
            phone: address.phone || formData.phoneNumber,
            line1: address.line1,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            isDefault: true
          });
        } catch {
          // Address save failed but account created, so continue
          localStorage.setItem('tempAddress', JSON.stringify(address));
        }
      }

      // Store auth tokens
      if (response.accessToken) {
        localStorage.setItem('authToken', response.accessToken);
        localStorage.setItem('userId', response.userId);
        localStorage.setItem('userName', response.name);
        localStorage.setItem('userRole', response.role);
        localStorage.setItem('userPhone', formData.phoneNumber);
        localStorage.setItem('userEmail', formData.email);
      }

      showToast('Account created successfully!', 'success');
      setTimeout(() => {
        navigate('/sign-in');
      }, 1500);
    } catch (err) {
      showToast(err.message || 'Registration failed. Please try again.', 'error');
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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-stone-900">Join Us</h1>
              <p className="text-xs text-stone-500">Amazing shopping experience awaits</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off" className="mt-6 space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-stone-700">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-2 w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${errors.name ? 'border-red-300 focus:ring-red-200' : 'border-stone-300 focus:ring-primary-200'}`}
                placeholder="John Doe"
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-stone-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="off"
                className={`mt-2 w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${errors.email ? 'border-red-300 focus:ring-red-200' : 'border-stone-300 focus:ring-primary-200'}`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Mobile Number Field */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-semibold text-stone-700">
                Mobile Number
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-2.5 focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-200">
                <span className="text-sm font-semibold text-stone-600">+91</span>
                <input
                  id="phoneNumber"
                  type="tel"
                  maxLength="10"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="flex-1 border-0 bg-transparent text-sm focus:outline-none focus:ring-0"
                  placeholder="9876543210"
                />
              </div>
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                className={`mt-2 w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${errors.password ? 'border-red-300 focus:ring-red-200' : 'border-stone-300 focus:ring-primary-200'}`}
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-stone-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                className={`mt-2 w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${errors.confirmPassword ? 'border-red-300 focus:ring-red-200' : 'border-stone-300 focus:ring-primary-200'}`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2">
              <input
                id="agreeTerms"
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className={`mt-1 rounded border ${
                  errors.agreeTerms ? 'border-red-300 text-red-500' : 'border-stone-300 text-primary-600'
                } focus:ring-2 focus:ring-primary-200`}
              />
              <label htmlFor="agreeTerms" className="text-xs text-stone-600">
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>
            {errors.agreeTerms && <p className="text-xs text-red-600">{errors.agreeTerms}</p>}

            {/* Optional Address Section */}
            <div className="mt-4 rounded-lg border border-stone-200 bg-stone-50 p-4">
              <button
                type="button"
                onClick={() => setShowAddressForm((prev) => !prev)}
                className="w-full text-left text-sm font-semibold text-stone-700 hover:text-stone-900"
              >
                {showAddressForm ? '✕ Hide ' : '+ Add '} delivery address (optional)
              </button>

              {showAddressForm && (
                <div className="mt-3 space-y-2">
                  <div>
                    <label className="text-xs font-semibold text-stone-600">Full Name</label>
                    <input
                      type="text"
                      value={address.fullName}
                      onChange={handleAddressChange('fullName')}
                      placeholder="Your name"
                      className="mt-1 w-full rounded border border-stone-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-600">Phone</label>
                    <input
                      type="tel"
                      maxLength="10"
                      value={address.phone}
                      onChange={(e) => {
                        const sanitized = e.target.value.replace(/\D/g, '');
                        setAddress((prev) => ({ ...prev, phone: sanitized }));
                      }}
                      placeholder="10-digit number"
                      className="mt-1 w-full rounded border border-stone-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-600">Address</label>
                    <input
                      type="text"
                      value={address.line1}
                      onChange={handleAddressChange('line1')}
                      placeholder="House no, street, area"
                      className="mt-1 w-full rounded border border-stone-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-stone-600">City</label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={handleAddressChange('city')}
                        placeholder="City"
                        className="mt-1 w-full rounded border border-stone-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-600">State</label>
                      <input
                        type="text"
                        value={address.state}
                        onChange={handleAddressChange('state')}
                        placeholder="State"
                        className="mt-1 w-full rounded border border-stone-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-600">Pincode</label>
                    <input
                      type="text"
                      maxLength="6"
                      value={address.pincode}
                      onChange={(e) => {
                        const sanitized = e.target.value.replace(/\D/g, '');
                        setAddress((prev) => ({ ...prev, pincode: sanitized }));
                      }}
                      placeholder="6-digit pincode"
                      className="mt-1 w-full rounded border border-stone-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full rounded-lg bg-primary-600 py-2.5 font-semibold text-white transition hover:bg-primary-700 disabled:bg-stone-400"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-sm text-stone-600">
            Already have an account?{' '}
            <Link to="/sign-in" className="font-semibold text-primary-600 hover:text-primary-700">
              Sign In
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

export default SignUpPage;
