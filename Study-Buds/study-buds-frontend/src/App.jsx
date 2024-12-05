import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme';
import LoginForm from './components/Login';
import RegistrationForm from './components/Register';
import Dashboard from './components/Dashboard';
import HomePage from './components/HomePage'; // Import HomePage if required

// A utility component to protect routes that require authentication
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token'); // Check for a token in localStorage
  return isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginForm />} />
          <Route path="/register" element={<RegistrationForm />} />

          {/* Private Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
