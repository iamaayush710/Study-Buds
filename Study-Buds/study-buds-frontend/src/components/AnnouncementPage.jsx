import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import axios from 'axios';

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5001/announcements', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAnnouncements(response.data);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <Box display="flex" height="100vh">
      <Sidebar />
      <Box flex={1} display="flex" flexDirection="column">
        <Header />
        <Box p={3} flex={1} overflow="auto">
          <Typography variant="h4" gutterBottom>
            Announcements
          </Typography>
          <Paper sx={{ p: 2 }}>
            {announcements.length === 0 ? (
              <Typography>No announcements available.</Typography>
            ) : (
              <List>
                {announcements.map((announcement) => (
                  <ListItem key={announcement.id} alignItems="flex-start">
                    <ListItemText
                      primary={announcement.title}
                      secondary={announcement.content}
                    />
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

export default AnnouncementsPage;