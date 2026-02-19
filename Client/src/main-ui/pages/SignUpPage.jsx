import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Link, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import AuthFormLayout from '../components/Auth/AuthFormLayout.jsx';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setMessage('');
      setError('Password aur confirm password match nahi kar rahe.');
      return;
    }

    setMessage('Sign up UI ready hai. Backend register endpoint connect karna pending hai.');
  };

  return (
    <AuthFormLayout title="Create Account" subtitle="Join General Store and start shopping smarter.">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {message && <Alert severity="info">{message}</Alert>}
          <TextField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" size="large" fullWidth>
            Sign Up
          </Button>
          <Link component={RouterLink} to="/sign-in" underline="hover" sx={{ textAlign: 'center' }}>
            Already have an account? Sign In
          </Link>
        </Stack>
      </Box>
    </AuthFormLayout>
  );
};

export default SignUpPage;
