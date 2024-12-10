import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Box, Typography, Avatar, Tooltip } from '@mui/material';
import axios from 'axios';
import '../App.css';

const Header = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get('http://localhost:5001/user/profile', { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          console.log('Profile Data:', res.data);
          setProfile(res.data)
      })
        .catch((err) => {
          console.error(err);
          setProfile(null); 
        });
    }
  }, []);

  const currentDateStr = currentTime.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const currentTimeStr = currentTime.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  return (
    <AppBar
      position="static"
      sx={{
        background: '#ffffff',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1',
        borderBottom: '1px solid #ddd',
        width: '100%',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
      sx={{
        justifyContent: 'space-between',
        paddingX: 2,
      }}
    >
      {/*Time and Date */}
      <Box flexGrow={1} display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
          {currentTimeStr}
        </Typography>
        <Typography variant="body2" sx={{ color: '#555' }}>
          {currentDateStr}
        </Typography>
      </Box>

      {/* Profile */}
      {profile && (
        <Tooltip title={`${profile.name} - ${profile.email}`}>
          <Avatar
            src={profile.profile_picture?.startsWith('#') ? undefined : profile.profile_picture}
            sx={{
              backgroundColor: profile.profile_picture?.startsWith('#')
                ? profile.profile_picture
                : undefined, 
              color: profile.profile_picture?.startsWith('#') ? '#fff' : '#000',
              width: 56,
              height: 56,
              cursor: 'pointer',
              border: '2px solid #000',
              fontWeight: 'bold',
            }}
          >
            {profile.name?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
        </Tooltip>
      )}
    </Toolbar>
    </AppBar>
  );
};

export default Header;