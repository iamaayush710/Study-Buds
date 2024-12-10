import React, {useState} from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Collapse,
  Divider,
  Typography,
  Toolbar,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonIcon from '@mui/icons-material/Person';
import EventNoteIcon from '@mui/icons-material/EventNote';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TimerIcon from '@mui/icons-material/Timer';
import ToolsIcon from '@mui/icons-material/Construction';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import '../App.css';

const drawerWidth = 260; // fixed width for the sidebar

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [toolsOpen, setToolsOpen] = useState(false);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Sessions', icon: <EventNoteIcon />, path: "/sessions" },
    { text: 'Announcements', icon: <AnnouncementIcon />, path: '/announcements' },
    { text: 'Activities', icon: <AssessmentIcon />, path: '/activities' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'Calendar', icon: <CalendarTodayIcon />, path: '/calendar' },
    { text: 'Focus Timer', icon: <TimerIcon />, path: '/focus-timer' },
    { 
        text: 'Tools',
        icon: <ToolsIcon />,
        subMenu: [
            {text: 'Grammarly', url: 'https://www.grammarly.com/'},
            {text: 'Quizlet', url: 'https://quizlet.com/'},
            {text: 'Khan Academy', url: 'https://www.khanacademy.org/'},
            {text: 'Google Scholar', url: 'https://scholar.google.com/'},
        ],
     },
    { text: 'Logout', icon: <LogoutIcon />, path: '/logout' },
  ];

  const handleLogout = () => {
    // Clear token and redirect to login
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleNavigation = (path) => {
    if (path === '/logout') {
      handleLogout();
    } else {
      navigate(path);
    }
  };

  const handleToolsClick = () => {
    setToolsOpen((prevOpen) => !prevOpen);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(135deg, #8ec5fc, #e0c3fc)',
          color: '#fff',
        },
      }}
    >

      <Toolbar
        sx={{
          paddingX: 2,
          paddingY: 1,
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
        >
        <Typography 
        variant="h4" 
        noWrap 
        component="div" 
        sx={{ 
          fontWeight: 'bold',
          color: '#fff',
          fontFamily: 'Roboto',
          marginLeft: 1,
          textAlign: 'left',
          }}
        >
          StudyBuds
        </Typography>
      </Toolbar>

      <Divider />

      {/* Menu Items */}
      <List>
        {menuItems.map((item) =>
          item.subMenu ? (
            <React.Fragment key={item.text}>
              <ListItemButton
                onClick={() => setToolsOpen((prev) => !prev)}
                selected={location.pathname === '/tools'}
                sx={{
                  borderRadius: 2,
                  marginY: 1,
                  color: '#fff',
                  '&.Mui-selected': { backgroundColor: '#6c63ff', color: '#fff' },
                  '&:hover': { backgroundColor: '#d1e3ff' },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
                {toolsOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              <Collapse in={toolsOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.subMenu.map((subItem) => (
                    <ListItemButton
                      component="a"
                      href={subItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={subItem.text}
                      sx={{
                        paddingLeft: 4,
                        '&:hover': { backgroundColor: '#e6f2ff' },
                      }}
                    >
                      <ListItemText primary={subItem.text} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ) : (
            <ListItemButton
              onClick={()=> (item.path === '/logout' ? handleLogout() : navigate(item.path))}
              selected={location.pathname === item.path}
              key={item.text}
              sx={{
                borderRadius: 2,
                marginY: 1,
                '&.Mui-selected': { backgroundColor: '#6c63ff', color: '#fff' },
                '&:hover': { backgroundColor: '#d1e3ff' },
              }}
            >
            <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>

      <Divider />

      {/* Footer */}
      <Typography
        variant="caption"
        align="center"
        sx={{ color: 'rgba(255,255,255,0.8)', marginTop: 'auto', padding: 2 }}
      >
        © {new Date().getFullYear()} StudyBuds
      </Typography>
    </Drawer>
  );
};

export default Sidebar;