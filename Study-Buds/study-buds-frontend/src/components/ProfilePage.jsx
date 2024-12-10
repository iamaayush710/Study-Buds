import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Avatar, Alert,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
 } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', profile_picture: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/user/profile'); // Using relative path since baseURL is set in api.js
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
  }, []);

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
      const response = await api.put(`/users/${profile.user_id}`, { name, email, profile_picture });
      setSuccess(response.data.message || 'Profile updated successfully.');
      setError('');
      //update profile state
      setProfile(response.data.user);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response && error.response.data) {
        if (error.response.data.errors) {
          // Handle validation errors
          const validationErrors = error.response.data.errors.map(err => err.msg).join(' ');
          setError(validationErrors);
        } else {
          setError(error.response.data.error || 'Failed to update profile. Please try again later.');
        }
      } else {
        setError('Failed to update profile. Please try again later.');
      }
      setSuccess('');
    }
  };

  const handleReset = () => {
    if(profile) {
      setForm({
        name: profile.name || '',
        email: profile.email || '',
        profile_picture: profile.profile_picture || '',
      });
      setError('');
      setSuccess('');
    }
  };

  const handleDeleteProfile = async () => {
    try {
      const response = await api.delete(`/users/${profile.user_id}`);
      alert(response.data.message || 'Profile deleted successfully.');
      // Clear the token and redirect to login or home page
      localStorage.removeItem('token');
      navigate('/login'); 
    } catch (error) {
      console.error('Error deleting profile:', error);
      if (error.response && error.response.data) {
        setError(error.response.data.error || 'Failed to delete profile. Please try again later.');
      } else {
        setError('Failed to delete profile. Please try again later.');
      }
    }
  };

  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  if (!profile) return <Box p={3}>Loading...</Box>;

  return (
    <Box display="flex" height="100vh">
      <Sidebar />
      <Box flex={1} display="flex" flexDirection="column">
        <Header />
        <Box p={3} flex={1} overflow="auto">
          {/*<Typography variant="h4" gutterBottom>
            My Profile
          </Typography>*/}

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
                  alt={form.name}
                  sx={{ 
                    width: 56, 
                    height: 56,
                    backgroundColor: form.profile_picture }}
                >
                  {form.name.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <Typography variant="h6">Update Profile</Typography>
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
                label="Profile Picture Color"
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
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </Box>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleOpenDeleteDialog}
                >
                  Delete Profile
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={openDeleteDialog}
            onClose={handleCloseDeleteDialog}
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
          >
            <DialogTitle id="delete-dialog-title">Confirm Profile Deletion</DialogTitle>
            <DialogContent>
              <DialogContentText id="delete-dialog-description">
                Are you sure you want to delete your profile? This action is irreversible and will remove all your data from our system.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
              <Button onClick={handleDeleteProfile} color="error">
                Delete
              </Button>
            </DialogActions>
          </Dialog>

        </Box>
      </Box>
    </Box>
  );
};

export default ProfilePage;