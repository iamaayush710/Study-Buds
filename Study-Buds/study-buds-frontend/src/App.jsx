// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme';

import LoginForm from './components/Login';
import RegistrationForm from './components/Register';
import Dashboard from './components/Dashboard';
import ProfilePage from './components/ProfilePage';
import GroupsPage from './components/GroupsPage';
import AnnouncementsPage from './components/AnnouncementsPage';
import ActivitiesPage from './components/ActivitiesPage';
import CalendarPage from './components/CalendarPage';
import PrivateRoute from './components/PrivateRoute';

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
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/groups"
            element={
              <PrivateRoute>
                <GroupsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/announcements"
            element={
              <PrivateRoute>
                <AnnouncementsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/activities"
            element={
              <PrivateRoute>
                <ActivitiesPage />
              </PrivateRoute>
            }
          />
          <Route  
            path="/calendar"
            element={
              <PrivateRoute>
                <CalendarPage />
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
