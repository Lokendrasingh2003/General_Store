import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainHeader from '../components/Header/MainHeader';
import ToastMessage from '../components/common/ToastMessage';
import { useTimedToast } from '../hooks/useTimedToast';
import { requestPasswordReset, verifyOtp, resetPassword } from '../services/authApi';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: phone, 2: otp, 3: reset password
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showToast } = useTimedToast(4000);

  // Step 1: Verify Phone Number
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    if (phoneNumber && !/^[0-9]{10}$/.test(phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please enter a valid phone number', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await requestPasswordReset(phoneNumber);
      showToast('OTP sent to +91 ' + phoneNumber, 'success');
      setStep(2);
    } catch (err) {
      showToast(err.message || 'Failed to send OTP', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!otp) newErrors.otp = 'OTP is required';
    if (otp && otp.length !== 6) newErrors.otp = 'OTP must be 6 digits';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please enter a valid OTP', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp(phoneNumber, otp);
      showToast('OTP verified successfully!', 'success');
      setStep(3);
    } catch (err) {
      showToast(err.message || 'Failed to verify OTP', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!newPassword) newErrors.newPassword = 'Password is required';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (newPassword && newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please fix the errors', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(phoneNumber, newPassword, confirmPassword);
      showToast('Password reset successful!', 'success');
      setTimeout(() => {
        navigate('/sign-in');
      }, 1500);
    } catch (err) {
      showToast(err.message || 'Failed to reset password', 'error');
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-stone-900">Reset Password</h1>
              <p className="text-xs text-stone-500">Secure account recovery</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mt-6 flex gap-2">
            <div className={`h-1 flex-1 rounded-full transition ${step >= 1 ? 'bg-primary-600' : 'bg-stone-200'}`}></div>
            <div className={`h-1 flex-1 rounded-full transition ${step >= 2 ? 'bg-primary-600' : 'bg-stone-200'}`}></div>
            <div className={`h-1 flex-1 rounded-full transition ${step >= 3 ? 'bg-primary-600' : 'bg-stone-200'}`}></div>
          </div>

          {/* Step 1: Phone Verification */}
          {step === 1 && (
            <form onSubmit={handlePhoneSubmit} className="mt-6 space-y-4">
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
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value.replace(/\D/g, ''));
                      setErrors({ ...errors, phoneNumber: '' });
                    }}
                    className="flex-1 border-0 bg-transparent text-sm focus:outline-none focus:ring-0"
                    placeholder="9876543210"
                  />
                </div>
                {errors.phoneNumber && <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 w-full rounded-lg bg-primary-600 py-2.5 font-semibold text-white transition hover:bg-primary-700 disabled:bg-stone-400"
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleOtpSubmit} className="mt-6 space-y-4">
              <p className="text-sm text-stone-600">We sent a 6-digit code to your mobile number</p>
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-stone-700">
                  Enter OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ''));
                    setErrors({ ...errors, otp: '' });
                  }}
                  className={`mt-2 w-full rounded-lg border px-4 py-3 text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 ${
                    errors.otp ? 'border-red-300 focus:ring-red-200' : 'border-stone-300 focus:ring-primary-200'
                  }`}
                  placeholder="000000"
                />
                {errors.otp && <p className="mt-1 text-xs text-red-600">{errors.otp}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 w-full rounded-lg bg-primary-600 py-2.5 font-semibold text-white transition hover:bg-primary-700 disabled:bg-stone-400"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-semibold"
              >
                Use Different Number
              </button>
            </form>
          )}

          {/* Step 3: Password Reset */}
          {step === 3 && (
            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-semibold text-stone-700">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setErrors({ ...errors, newPassword: '' });
                  }}
                  className={`mt-2 w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                    errors.newPassword ? 'border-red-300 focus:ring-red-200' : 'border-stone-300 focus:ring-primary-200'
                  }`}
                  placeholder="••••••••"
                />
                {errors.newPassword && <p className="mt-1 text-xs text-red-600">{errors.newPassword}</p>}
                <p className="mt-1 text-xs text-stone-500">At least 6 characters</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-stone-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors({ ...errors, confirmPassword: '' });
                  }}
                  className={`mt-2 w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                    errors.confirmPassword ? 'border-red-300 focus:ring-red-200' : 'border-stone-300 focus:ring-primary-200'
                  }`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 w-full rounded-lg bg-primary-600 py-2.5 font-semibold text-white transition hover:bg-primary-700 disabled:bg-stone-400"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          {/* Back to Sign In */}
          <Link to="/sign-in" className="mt-6 block text-center text-xs text-stone-500 hover:text-stone-700">
            ← Back to Sign In
          </Link>
        </div>
      </main>

      <ToastMessage toast={toast} />
    </div>
  );
};

export default ForgotPasswordPage;
