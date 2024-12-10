import React from 'react';
import ReactDOM from 'react-dom/client';
import { Routes, Route, BrowserRouter as Router, Navigate} from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PrivateRoute from "./components/PrivateRoute.jsx";
import SessionsPage from "./components/SessionsPage.jsx";
import {ThemeProvider} from "@mui/material/styles";
import theme from "./styles/theme.js";
import CssBaseline from "@mui/material/CssBaseline";
import RegistrationForm from "./components/Register";
import ProfilePage from "./components/ProfilePage.jsx";
import TasksPage from "./components/TasksPage.jsx";
import CalendarPage from "./components/CalendarPage.jsx";
import FocusTimer from "./components/FocusTimer.jsx";
import AnnouncementsPage from "./components/AnnouncementPage.jsx";
import ToolsPage from "./components/ToolsPage.jsx";
//import './index.css';

const App = () => (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
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
                    path="/tasks"
                    element={
                        <PrivateRoute>
                            <TasksPage />
                            </PrivateRoute>
                    }
                />
                <Route
                    path="/sessions"
                    element={
                        <PrivateRoute>
                            <SessionsPage />
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
                <Route
                    path="/focus-timer"
                    element={
                        <PrivateRoute>
                            <FocusTimer />
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
                    path="/tools"
                    element={
                        <PrivateRoute>
                            <ToolsPage />
                        </PrivateRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    </ThemeProvider>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
