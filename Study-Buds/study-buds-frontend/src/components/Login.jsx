import React, { useState } from 'react';
import { TextField, Button, Typography, Box } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import GoogleIcon from '@mui/icons-material/Google';
import TwitterIcon from '@mui/icons-material/Twitter';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AuthForm.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/auth/login', { email, password });

      // Assuming the backend sends a token upon successful login
      const { token } = response.data;

      // Store the token in localStorage for future authenticated requests
      localStorage.setItem('token', token);

      // Display success message and redirect to dashboard
      alert(`Login successful: ${response.data.message}`);
      navigate('/dashboard'); // Redirect to dashboard page
    } catch (err) {
      // Set error message from backend or fallback message
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="auth-container">
      <Box className="auth-card">
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!error && !email}
            helperText={!email && error ? 'Email is required.' : ''}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error && !password}
            helperText={!password && error ? 'Password is required.' : ''}
          />
          {error && (
            <Typography color="error" variant="body2" marginBottom={2}>
              {error}
            </Typography>
          )}
          <Box display="flex" justifyContent="space-between" marginBottom={2}>
            <Button color="primary" variant="text" className="forgot-password-btn">
              Forgot password?
            </Button>
          </Box>
          <Button variant="contained" color="primary" fullWidth type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'LOGIN'}
          </Button>
        </form>
        <Typography variant="body1" align="center" marginTop={2}>
          Or Sign Up Using
        </Typography>
        <Box display="flex" justifyContent="center" marginTop={2}>
          <Button startIcon={<FacebookIcon />} color="primary" />
          <Button startIcon={<GoogleIcon />} color="error" />
          <Button startIcon={<TwitterIcon />} color="info" />
        </Box>
        <Typography variant="body2" align="center" marginTop={2}>
          Don't have an account? <a href="/register">SIGN UP</a>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
