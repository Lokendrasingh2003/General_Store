const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const register = async (payload) => {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Registration failed');
  }

  const data = await res.json();
  return data?.data ?? data;
};

export const login = async (payload) => {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Login failed');
  }

  const data = await res.json();
  return data?.data ?? data;
};

export const logout = async () => {
  const res = await fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Logout failed');
  }

  const data = await res.json();
  return data;
};

export const refreshAccessToken = async (refreshToken) => {
  const res = await fetch(`${API_BASE}/api/auth/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await res.json();
  return data?.data ?? data;
};

export const requestPasswordReset = async (phoneNumber) => {
  const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phoneNumber }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to request password reset');
  }

  const data = await res.json();
  return data;
};

export const verifyOtp = async (phoneNumber, otp) => {
  const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phoneNumber, otp }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to verify OTP');
  }

  const data = await res.json();
  return data;
};

export const resetPassword = async (phoneNumber, newPassword, confirmPassword) => {
  const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phoneNumber, newPassword, confirmPassword }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to reset password');
  }

  const data = await res.json();
  return data;
};
