import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Avatar,
  CssBaseline,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Button,
  Paper,
  Divider,
  TextField,
  Tooltip,
  Grid
} from '@mui/material';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';

// Icons
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import TimerIcon from '@mui/icons-material/Timer';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SettingsIcon from '@mui/icons-material/Settings';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// Light Pastel Theme
const theme = createTheme({
  palette: {
    primary: { main: '#8ec5fc' }, 
    secondary: { main: '#e0c3fc' },
    background: { default: '#f7f9fc', paper: '#ffffff' },
    text: { primary: '#333333', secondary: '#555555' },
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
    h4: { fontWeight: 600, fontSize: '1.5rem' },
    h5: { fontWeight: 500, fontSize: '1.2rem' },
    body1: { fontSize: '0.95rem' }
  }
});

// Sidebar styling
const Sidebar = styled(Box)(({ theme }) => ({
  width: 260,
  height: '100vh',
  background: 'linear-gradient(135deg, #8ec5fc, #e0c3fc)',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  boxSizing: 'border-box',
  color: '#333',
}));

const NavItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    cursor: 'pointer',
  },
  marginBottom: theme.spacing(1),
  transition: 'all 0.2s ease'
}));

const ContentArea = styled(Box)(({ theme }) => ({
  flex: 1,
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(3),
  overflowY: 'auto'
}));

const Card = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0px 2px 6px rgba(0,0,0,0.05)',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2)
}));

const GreetingCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #fbeee4, #e6f2fe)',
  minHeight: 150,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
}));

const QuickAddCard = styled(Card)(({ theme }) => ({
  background: '#ffffff',
}));

const CalendarCard = styled(Card)(({ theme }) => ({
  background: '#ffffff',
}));

const ExamsCard = styled(Card)(({ theme }) => ({
  background: '#ffffff',
}));

const FocusTimerCard = styled(Card)(({ theme }) => ({
  background: '#ffffff',
}));

// Header Component (Top AppBar)
const HeaderBar = styled(AppBar)(({ theme }) => ({
  background: '#ffffff',
  color: theme.palette.text.primary,
  boxShadow: 'none',
  borderBottom: '1px solid #e0e0e0',
}));

const Dashboard = () => {
  const navigate = useNavigate();
  const profile = { name: 'John Doe', email: 'john.doe@example.com' };

  // Current time and date
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timerID = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerID);
  }, []);
  const currentDateStr = currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const currentTimeStr = currentTime.toLocaleTimeString(undefined, { hour: 'numeric', minute: 'numeric', hour12: true });

  // Greeting based on time
  const hour = currentTime.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  // Placeholder Focus Timer
  const [focusTime, setFocusTime] = useState('24:59');
  

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Header */}
      <HeaderBar position="static">
        <Toolbar>
          <Box display="flex" flexDirection="column" flexGrow={1}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>{currentTimeStr}</Typography>
            <Typography variant="caption" color="text.secondary">{currentDateStr}</Typography>
          </Box>
          <Tooltip title={`${profile.name} - ${profile.email}`}>
            <Avatar sx={{ bgcolor: '#ffffff', color: '#8ec5fc', fontWeight: 700, marginRight: 2 }}>
              {profile.name.charAt(0).toUpperCase()}
            </Avatar>
          </Tooltip>
        </Toolbar>
      </HeaderBar>

      <Box display="flex" height="calc(100vh - 64px)">
        {/* Sidebar */}
        <Sidebar>
          <Button variant="contained" startIcon={<AddCircleOutlineIcon />} sx={{ marginBottom: 2, backgroundColor: '#ffffff', color: '#333' }}>
            Add New
          </Button>
          <List sx={{ flexGrow: 1 }}>
            <NavItem onClick={() => navigate('/dashboard')}>
              <ListItemIcon><DashboardIcon sx={{ color: '#ffffff' }} /></ListItemIcon>
              <ListItemText primary="Dashboard" primaryTypographyProps={{ color: '#ffffff' }} />
            </NavItem>
            <NavItem onClick={() => navigate('/calendar')}>
              <ListItemIcon><CalendarMonthIcon sx={{ color: '#ffffff' }} /></ListItemIcon>
              <ListItemText primary="Calendar" primaryTypographyProps={{ color: '#ffffff' }} />
            </NavItem>
            <NavItem onClick={() => navigate('/activities')}>
              <ListItemIcon><NewspaperIcon sx={{ color: '#ffffff' }} /></ListItemIcon>
              <ListItemText primary="Activities" primaryTypographyProps={{ color: '#ffffff' }} />
            </NavItem>
            <NavItem onClick={() => navigate('/focus-timer')}>
              <ListItemIcon><TimerIcon sx={{ color: '#ffffff' }} /></ListItemIcon>
              <ListItemText primary="Focus Timer" primaryTypographyProps={{ color: '#ffffff' }} />
            </NavItem>
          </List>

          <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.3)', marginY: 2 }} />

          <List>
            <NavItem>
              <ListItemIcon><CloudUploadIcon sx={{ color: '#ffffff' }} /></ListItemIcon>
              <ListItemText primary="Data Import" primaryTypographyProps={{ color: '#ffffff' }} />
            </NavItem>
            <NavItem>
              <ListItemIcon><HelpOutlineIcon sx={{ color: '#ffffff' }} /></ListItemIcon>
              <ListItemText primary="Help Center" primaryTypographyProps={{ color: '#ffffff' }} />
            </NavItem>
            <NavItem>
              <ListItemIcon><SettingsIcon sx={{ color: '#ffffff' }} /></ListItemIcon>
              <ListItemText primary="Settings" primaryTypographyProps={{ color: '#ffffff' }} />
            </NavItem>
            <NavItem>
              <ListItemIcon><Brightness4Icon sx={{ color: '#ffffff' }} /></ListItemIcon>
              <ListItemText primary="Light/Dark Mode" primaryTypographyProps={{ color: '#ffffff' }} />
            </NavItem>
          </List>

          <Typography variant="caption" align="center" sx={{ color: 'rgba(255,255,255,0.8)', marginTop: 'auto' }}>
            © {new Date().getFullYear()} MyStudyLife Clone
          </Typography>
        </Sidebar>

        {/* Main Content */}
        <ContentArea>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              {/* Greeting Card */}
              <GreetingCard>
                <Typography variant="h5" gutterBottom>{greeting}, {profile.name.split(' ')[0]}</Typography>
                <Typography variant="body2">You have no tasks due today. Enjoy your free time!</Typography>
              </GreetingCard>

              {/* Quick Add Task Section */}
              <QuickAddCard>
                <Typography variant="h6" gutterBottom>Quick Add Task</Typography>
                <Box display="flex" gap={1} marginBottom={2}>
                  <TextField variant="outlined" placeholder="What do you need to do?" fullWidth />
                  <Button variant="contained" color="primary">Add</Button>
                </Box>
                <Box display="flex" gap={1}>
                  <Button variant="outlined" size="small">Subject</Button>
                  <Button variant="outlined" size="small">Today</Button>
                  <Button variant="outlined" size="small">Tomorrow</Button>
                  <Button variant="outlined" size="small">Custom Date</Button>
                  <Button variant="outlined" size="small">Time</Button>
                </Box>
              </QuickAddCard>
            </Grid>

            <Grid item xs={12} md={4}>
              {/* Calendar Card */}
              <CalendarCard>
                <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
                  <IconButton size="small"><ArrowBackIosIcon fontSize="inherit" /></IconButton>
                  <Typography variant="h6">September 2024</Typography>
                  <IconButton size="small"><ArrowForwardIosIcon fontSize="inherit" /></IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary">No items found.</Typography>
              </CalendarCard>

              {/* Upcoming Exams Card */}
              <ExamsCard>
                <Typography variant="h6" gutterBottom>Upcoming Exams</Typography>
                <Typography variant="body2" color="text.secondary">No exams scheduled yet.</Typography>
              </ExamsCard>

              {/* Focus Timer Card */}
              <FocusTimerCard>
                <Typography variant="h6" gutterBottom>Focus Timer</Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, marginBottom: 2 }}>{focusTime}</Typography>
                <Button variant="contained" color="primary">Start</Button>
              </FocusTimerCard>
            </Grid>
          </Grid>
        </ContentArea>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;
