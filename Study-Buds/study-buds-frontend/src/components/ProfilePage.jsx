import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Avatar, Alert } from '@mui/material';
import axios from 'axios'; // Ensure axios is imported
import Sidebar from './Sidebar';
import Header from './Header';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', profile_picture: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5001/user/profile', { headers });
        setProfile(response.data);
        setForm({
          name: response.data.name || '',
          email: response.data.email || '',
          profile_picture: response.data.profile_picture || '',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(
          error.response?.data?.error ||
            'Failed to fetch profile. Please try again later.'
        );
      }
    };
    fetchProfile();
  }, [headers]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const { name, email, profile_picture } = form;
    if (!name || !email) {
      setError('Name and Email are required.');
      return;
    }
    try {
      // Use the correct endpoint with user_id
      await axios.put(`http://localhost:5001/users/${profile.user_id}`, { name, email, profile_picture }, { headers });
      setSuccess('Profile updated successfully.');
      setError('');
      // Refetch profile to ensure data consistency
      const response = await axios.get('http://localhost:5001/user/profile', { headers });
      setProfile(response.data);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(
        error.response?.data?.error ||
          'Failed to update profile. Please try again later.'
      );
      setSuccess('');
    }
  };

  if (!profile) return <Box p={3}>Loading...</Box>;

  return (
    <Box display="flex" height="100vh">
      <Sidebar />
      <Box flex={1} display="flex" flexDirection="column">
        <Header />
        <Box p={3} flex={1} overflow="auto">
          <Typography variant="h4" gutterBottom>
            My Profile
          </Typography>

          {/* Display Success or Error Messages */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Paper sx={{ p: 2, maxWidth: 600, background: '#ffffff' }}>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  src={form.profile_picture}
                  alt={form.name}
                  sx={{ width: 56, height: 56 }}
                >
                  {form.name.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <Typography variant="h6">Change Profile Picture</Typography>
              </Box>
              <TextField
                label="Full Name"
                variant="outlined"
                fullWidth
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
              <TextField
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
              <TextField
                label="Profile Picture URL"
                variant="outlined"
                fullWidth
                value={form.profile_picture}
                onChange={(e) => handleChange('profile_picture', e.target.value)}
              />
              <Box display="flex" gap={2}>
                <Button variant="contained" color="primary" onClick={handleSave}>
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  onClick={() =>
                    setForm({
                      name: profile.name,
                      email: profile.email,
                      profile_picture: profile.profile_picture,
                    })
                  }
                >
                  Reset
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfilePage;