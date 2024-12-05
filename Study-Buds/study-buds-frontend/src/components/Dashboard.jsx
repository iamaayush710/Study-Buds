import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Button,
    Switch,
    Avatar,
    List,
    ListItem,
    ListItemText,
    Divider,
} from '@mui/material';
import axios from 'axios';

const Dashboard = () => {
    const [stats, setStats] = useState({});
    const [activities, setActivities] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [profile, setProfile] = useState({});
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const [statsRes, activitiesRes, announcementsRes, profileRes] = await Promise.all([
                    axios.get('http://localhost:5001/user/stats', { headers }),
                    axios.get('http://localhost:5001/user/activities', { headers }),
                    axios.get('http://localhost:5001/announcements', { headers }),
                    axios.get('http://localhost:5001/user/profile', { headers }),
                ]);

                setStats(statsRes.data);
                setActivities(activitiesRes.data);
                setAnnouncements(announcementsRes.data);
                setProfile(profileRes.data);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            }
        };

        fetchDashboardData();
    }, []);

    const handleThemeToggle = () => {
        setDarkMode((prevMode) => !prevMode);
    };

    return (
        <Container>
            <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={4}>
                <Typography variant="h4">Dashboard</Typography>
                <Switch checked={darkMode} onChange={handleThemeToggle} />
            </Box>
            <Grid container spacing={4}>
                {/* Profile Card */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} style={{ padding: '20px', textAlign: 'center' }}>
                        <Avatar style={{ margin: 'auto', width: 80, height: 80 }}>
                            {profile.name ? profile.name.charAt(0) : '?'}
                        </Avatar>
                        <Typography variant="h6" marginTop={2}>
                            {profile.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {profile.email}
                        </Typography>
                        <Button variant="outlined" color="primary" fullWidth style={{ marginTop: '15px' }}>
                            Edit Profile
                        </Button>
                    </Paper>
                </Grid>

                {/* Statistics */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={3} style={{ padding: '20px' }}>
                        <Typography variant="h6">Statistics</Typography>
                        <Grid container spacing={2} marginTop={2}>
                            <Grid item xs={6}>
                                <Typography>Active Study Groups</Typography>
                                <Typography variant="h5">{stats.activeGroups || 0}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography>Scheduled Sessions</Typography>
                                <Typography variant="h5">{stats.scheduledSessions || 0}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography>Unread Messages</Typography>
                                <Typography variant="h5">{stats.unreadMessages || 0}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography>Rating</Typography>
                                <Typography variant="h5">{stats.userRating || 'N/A'}</Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Announcements */}
                <Grid item xs={12}>
                    <Paper elevation={3} style={{ padding: '20px' }}>
                        <Typography variant="h6">Announcements</Typography>
                        <List>
                            {announcements.map((announcement, index) => (
                                <React.Fragment key={index}>
                                    <ListItem>
                                        <ListItemText
                                            primary={announcement.title}
                                            secondary={announcement.content}
                                        />
                                    </ListItem>
                                    {index < announcements.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Recent Activities */}
                <Grid item xs={12}>
                    <Paper elevation={3} style={{ padding: '20px' }}>
                        <Typography variant="h6">Recent Activities</Typography>
                        <List>
                            {activities.map((activity, index) => (
                                <ListItem key={index}>
                                    <ListItemText primary={activity.description} secondary={activity.date} />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard;
