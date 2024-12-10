// SessionsPage.jsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import Sidebar from './Sidebar';
import Header from './Header';
import axios from 'axios';

const SessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [newSession, setNewSession] = useState({
    title: '',
    venue: '',
    date: '',
    time: '',
    type: 'study',
    subject: '',
  });
  const [userId, setUserId] = useState(null);
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch logged-in user profile to get user ID
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5001/user/profile', { headers });
        setUserId(response.data.user_id);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        alert('Failed to fetch user profile. Please try logging in again.');
      }
    };
    fetchProfile();
  }, [headers]); // Added 'headers' as dependency

  // Fetch all sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get('http://localhost:5001/sessions/all', { headers });
        setSessions(response.data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        alert('Failed to fetch sessions. Please try again.');
      }
    };
    fetchSessions();
  }, [headers]); // Added 'headers' as dependency

  // Add a new session
  const handleAddSession = async () => {
    const { title, venue, date, time, type, subject } = newSession;
    if (!title || !venue || !date || !time || !type) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      await axios.post(
        'http://localhost:5001/sessions',
        {
          title,
          venue,
          date: `${date}T${time}:00`,
          type,
          subject,
        },
        { headers }
      );
      // Refresh sessions list
      const response = await axios.get('http://localhost:5001/sessions/all', { headers });
      setSessions(response.data);
      setNewSession({ title: '', venue: '', date: '', time: '', type: 'study', subject: '' });
      alert('Session created successfully!');
    } catch (error) {
      console.error('Error adding session:', error);
      alert('Failed to add session. Please ensure all details are correct and try again.');
    }
  };

  // Delete a session (only allowed for session creator)
  const handleDeleteSession = async (session_id) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    try {
      await axios.delete(`http://localhost:5001/sessions/${session_id}`, { headers });
      setSessions((prev) => prev.filter((session) => session.session_id !== session_id));
      alert('Session deleted successfully!');
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session. Please try again.');
    }
  };

  // Toggle interest in a session
  const handleToggleInterest = async (session_id, is_interested) => {
    try {
      // Call the correct toggle interest endpoint
      const response = await axios.post(
        `http://localhost:5001/sessions/${session_id}/interested`,
        {}, // Empty body as per backend implementation
        { headers }
      );

      // Show a success message based on the response
      alert(response.data.message); // "Marked as interested!" or "Interest removed!"

      // Update the session's is_interested status in the local state based on response
      const updatedSessions = sessions.map((session) =>
        session.session_id === session_id
          ? { ...session, is_interested: response.data.is_interested }
          : session
      );
      setSessions(updatedSessions);

      // Dispatch an event to inform Dashboard.jsx to refresh "Today's Sessions"
      window.dispatchEvent(new Event('interestChanged'));
    } catch (error) {
      console.error('Error toggling interest in session:', error);
      alert('Failed to toggle interest. Please try again.');
    }
  };

  // Update input fields for creating a session
  const handleChange = (key, value) => {
    setNewSession((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Box display="flex" height="100vh">
      <Sidebar />
      <Box flex={1} display="flex" flexDirection="column">
        <Header />
        <Box p={3} flex={1} overflow="auto">
          <Typography variant="h4" gutterBottom>
            Study Sessions
          </Typography>
          {/* Add Session Form */}
          <Paper sx={{ p: 2, mb: 2, background: '#ffffff' }}>
            <Typography variant="h6" gutterBottom>
              Create New Session
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Title"
                variant="outlined"
                fullWidth
                value={newSession.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />
              <TextField
                label="Venue"
                variant="outlined"
                fullWidth
                value={newSession.venue}
                onChange={(e) => handleChange('venue', e.target.value)}
              />
              <Box display="flex" gap={2}>
                <TextField
                  label="Date"
                  type="date"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={newSession.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Time"
                  type="time"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={newSession.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  fullWidth
                />
              </Box>
              <FormControl variant="outlined" fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newSession.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  label="Type"
                >
                  <MenuItem value="study">Study</MenuItem>
                  <MenuItem value="exam">Exam</MenuItem>
                  <MenuItem value="class">Class</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Subject"
                variant="outlined"
                fullWidth
                value={newSession.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
              />
              <Button variant="contained" color="primary" onClick={handleAddSession}>
                Create Session
              </Button>
            </Box>
          </Paper>

          {/* Sessions List */}
          <Paper sx={{ p: 2, background: '#ffffff' }}>
            <Typography variant="h6" gutterBottom>
              All Study Sessions
            </Typography>
            {sessions.length === 0 ? (
              <Typography>No sessions available.</Typography>
            ) : (
              <List>
                {sessions.map((session) => (
                  <ListItem key={session.session_id} divider>
                    <ListItemText
                      primary={`${session.title} (${session.type})`}
                      secondary={`Venue: ${session.venue} | Subject: ${session.subject || 'N/A'} | Time: ${new Date(
                        session.date
                      ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    />
                    {/* Interested Button */}
                    <IconButton
                      onClick={() => handleToggleInterest(session.session_id, session.is_interested)}
                      aria-label={session.is_interested ? 'Unmark Interest' : 'Mark as Interested'}
                    >
                      {session.is_interested ? (
                        <StarIcon style={{ color: 'gold' }} />
                      ) : (
                        <StarBorderIcon />
                      )}
                    </IconButton>
                    {/* Delete Button (only for session creator) */}
                    {session.user_id === userId && (
                      <IconButton
                        onClick={() => handleDeleteSession(session.session_id)}
                        aria-label="Delete Session"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default SessionsPage;
