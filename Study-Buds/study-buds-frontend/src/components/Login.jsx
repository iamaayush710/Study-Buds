import React, { useState } from 'react';
import { TextField, Button, Typography, Box } from '@mui/material';
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
      const { token } = response.data;

      //store token for future use
      localStorage.setItem('token', token);

      navigate('/dashboard'); // redirect to dashboard 

    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="auth-container">
      <Box className="auth-card">
        <Typography className="app-name">StudyBuds</Typography>
        <Typography variant="h5" gutterBottom>
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
          <Button variant="contained" color="primary" fullWidth type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'LOGIN'}
          </Button>
        </form>
        <Typography variant="body2" align="center" marginTop={2}>
          Don't have an account? <a href="/register">SIGN UP</a>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
