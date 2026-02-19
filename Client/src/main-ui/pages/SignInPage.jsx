import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Link, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import AuthFormLayout from '../components/Auth/AuthFormLayout.jsx';

const SignInPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage('Sign in UI ready hai. Backend auth endpoint connect karna pending hai.');
  };

  return (
    <AuthFormLayout title="Sign In" subtitle="Welcome back! Continue to your account.">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          {message && <Alert severity="info">{message}</Alert>}
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
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" size="large" fullWidth>
            Sign In
          </Button>
          <Link component={RouterLink} to="/sign-up" underline="hover" sx={{ textAlign: 'center' }}>
            Don&apos;t have an account? Sign Up
          </Link>
        </Stack>
      </Box>
    </AuthFormLayout>
  );
};

export default SignInPage;
