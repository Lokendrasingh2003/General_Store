const { users } = require('../data/users');

const register = (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Validate input
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and phone are required'
      });
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email || u.phone === phone);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone already registered'
      });
    }

    // Create new user
    const userId = `user-${Date.now()}`;
    const newUser = {
      id: userId,
      name,
      email,
      phone,
      password, // In production, this should be hashed
      role: role || 'customer',
      createdAt: new Date().toISOString(),
      isActive: true
    };

    users.push(newUser);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        accessToken: newUser.id // Simple token for now
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

const login = (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = users.find((u) => u.email === email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password (in production, use bcrypt.compare)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User account is disabled'
      });
    }

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        accessToken: user.id // Simple token for now
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

const logout = (req, res) => {
  // Simple logout - just return success
  res.json({
    success: true,
    message: 'Logout successful'
  });
};

const getProfile = (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID required'
      });
    }

    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

// Store OTPs in memory (in production, use Redis or database)
const otpStore = {};

const requestPasswordReset = (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Validate input
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber.replace(/\D/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit phone number'
      });
    }

    // Find user by phone
    const user = users.find((u) => u.phone === phoneNumber);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this phone number'
      });
    }

    // Generate simple OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    
    // Store OTP with expiry (5 minutes)
    otpStore[phoneNumber] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0
    };

    return res.json({
      success: true,
      message: `OTP sent to +91 ${phoneNumber}`,
      data: { phoneNumber } // In production, don't return OTP
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to request password reset',
      error: error.message
    });
  }
};

const verifyOtp = (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    // Validate input
    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }

    // Check if OTP exists and is valid
    const storedOtp = otpStore[phoneNumber];
    if (!storedOtp) {
      return res.status(400).json({
        success: false,
        message: 'No OTP request found for this phone number'
      });
    }

    // Check if OTP has expired
    if (Date.now() > storedOtp.expiresAt) {
      delete otpStore[phoneNumber];
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Check attempt limit
    if (storedOtp.attempts >= 3) {
      delete otpStore[phoneNumber];
      return res.status(400).json({
        success: false,
        message: 'Too many attempts. Please request a new OTP'
      });
    }

    // Verify OTP
    if (storedOtp.otp !== otp) {
      storedOtp.attempts += 1;
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // OTP verified, keep it in store for password reset
    storedOtp.verified = true;
    storedOtp.verifiedAt = Date.now();

    return res.json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message
    });
  }
};

const resetPassword = (req, res) => {
  try {
    const { phoneNumber, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!phoneNumber || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if OTP was verified
    const storedOtp = otpStore[phoneNumber];
    if (!storedOtp || !storedOtp.verified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify OTP first'
      });
    }

    // Find user
    const user = users.find((u) => u.phone === phoneNumber);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update password
    user.password = newPassword;
    user.updatedAt = new Date().toISOString();

    // Clear OTP
    delete otpStore[phoneNumber];

    return res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  requestPasswordReset,
  verifyOtp,
  resetPassword
};
