import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TimerIcon from '@mui/icons-material/Timer';
import Sidebar from './Sidebar';
import Header from './Header';
import axios from 'axios';
import '../App.css';


const Dashboard = () => {
  const [profile, setProfile] = useState({name: 'User', email: 'user@example.com'});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({title: '', date: '', time: '', subject: ''});
  const [editingTask, setEditingTask] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const token = localStorage.getItem('token');
  const headers = {Authorization: `Bearer ${token}`};

  const fetchSessions= async () => {
    try{
      const response = await axios.get('http://localhost:5001/user_sessions/is_interested', {headers});
      const today = new Date().toISOString().split('T')[0]; //date YYYY-MM-DD
      const todaySessions = response.data.filter(
        (session) => session.date.split('T')[0] === today
      );
      setSessions(todaySessions);
      console.log('Fetched Sessions:', todaySessions);
    } catch (error) {
      console.error('Error fetching interested sessions:', error);
    }
  };

  //get profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5001/user/profile', {headers});
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, [headers]);

  //get tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://localhost:5001/tasks', {headers});
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  }, [headers]);

  //get today's interested sessions
  
  //fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5001/user/profile', { headers });
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, [headers]);

  //fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://localhost:5001/tasks', { headers });
        setTasks(response.data);
        console.error('Fetched Tasks:', response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  }, [headers]);

  //fetch interested sessions today
  useEffect(() => {
    fetchSessions(); 
  }, [headers]);

  //listened for 'interestChanged' Events to Refresh Sessions**
  useEffect(() => {
    const handleInterestChanged = () => {
      console.log('Interest changed event triggered.');
      fetchSessions();
    };

    window.addEventListener('interestChanged', handleInterestChanged);

    // Cleanup Event Listener on Unmount
    return () => {
      window.removeEventListener('interestChanged', handleInterestChanged);
    };
  }, [headers]);


  //current date and time
  useEffect(() => {
    const timerID = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerID);
  }, []);
  const currentDateStr = currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const currentTimeStr = currentTime.toLocaleTimeString(undefined, { hour: 'numeric', minute: 'numeric', hour12: true });
  //greeting based on time of day
  const hour = currentTime.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  //task add/edit dialog
  const handleOpenDialog = (task=null) => {
    setEditingTask(task);
    if(task) {
      setNewTask({
        title: task.title,
        date: task.due_date ? task.due_date.split('T')[0]: '',
        time: task.due_date ? task.due_date.split('T')[1].slice(0,5): '',
        subject: task.subject || '',
      });
    } else {
      setNewTask({title: '', date: '', time: '', subject: ''});
    }
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setEditingTask(null);
    setNewTask({title: '', date: '', time: '', subject: ''});
    setDialogOpen(false);
  };
  const handleSaveTask = async () => {
    const {title, date, time, subject} = newTask;
    if(!title){
      alert('Task title is required.');
      return;
    }
    try {
      if (editingTask) { //update task
        await axios.put( 
        `http://localhost:5001/tasks/${editingTask.task_id}`,
        {
          title,
          due_date: date && time ? `${date}T${time}:00` : null,
          subject,
        },
        {headers}
      );
      setTasks((prev) =>
        prev.map((task) =>
          task.task_id === editingTask.task_id
            ? {...task, title, due_date: date && time ? `${date}T${time}:00` : task.due_date, subject}
            : task
          )
        );
      } else { //add task
        const response = await axios.post(
          'http://localhost:5001/tasks',
          {
            title,
            due_date: date && time ? `${date}T${time}:00` : null,
            subject,
          },
          {headers}
        );
        setTasks((prev) => [...prev, response.data]);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };
  //handle complete task
  const handleCompleteTask = async (task) => {
    try {
      await axios.put(
        `http://localhost:5001/tasks/${task.task_id}`,
        { completed: 1 },
        { headers }
      );
      setTasks((prev) =>
        prev.map((t) => (t.task_id === task.task_id ? { ...t, completed: 1 } : t))
      );
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };
  //handle delete task
  const handleDeleteTask = async (task_id) => {
    try {
      await axios.delete(
        `http://localhost:5001/tasks/${task_id}`,
        {headers}
      );
        setTasks((prev) => prev.filter((task) => task.task_id !== task_id));  
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  //focus timer
  const [timer, setTimer] = useState(25 * 60); //automatically set to 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [customTime, setCustomTime] = useState(25);
  const timerRef = React.useRef(null);
  const [currentSubjectTimer, setCurrentSubjectTimer] = useState('');
  const [subjectTime, setSubjectTime] = useState([]);  

  useEffect(() => {
    if (isRunning && timer > 0){
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    if (!isRunning || timer <= 0){
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, timer]);
  useEffect(() => {
    if(timer === 0 && isRunning){
      setIsRunning(false);
      logFocusSession();
      alert('Focus session completed!');
      setTimer(customTime*60);
    }
  }, [timer, isRunning]);
  const logFocusSession = async () => {
    if(!currentSubjectTimer) return;
    try {
      await axios.post(
        'http://localhost:5001/activities',
        {description: `Studied ${currentSubjectTimer} for ${customTime} minutes`, subject: currentSubjectTimer},
        {headers}
      );
      setSubjectTime((prev) => {
        const index = prev.findIndex((s) => s.subject === currentSubjectTimer);
        if (index !== -1) {
          const updated = [...prev];
          updated[index].minutes += customTime;
          return updated;
        } else {
          return [...prev, {subject: currentSubjectTimer, minutes: customTime}];
        }
      });
    } catch (error) {
      console.error('Error logging focus session:', error);
    }
  };
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };
  const handleStartPauseTimer = () => {
    if(!currentSubjectTimer && !isRunning){
      alert('Please enter the subject you are studying.');
      return;
    }
    setIsRunning((prev) => !prev);
    setIsStarted(true);
  };
  const handleEndTimer = () => {
    setIsRunning(false);
    setTimer(customTime*60);
    setIsStarted(false);
    alert('Focus session ended.');
  };
  const handleResetTimer = () => {
    setIsRunning(false);
    setTimer(customTime*60);
    setCurrentSubjectTimer('');
  };
  const handleCustomTimeChange = (e) => {
    const newTime = parseInt(e.target.value, 10);
    if (!isNaN(newTime) && newTime > 0) {
      setCustomTime(newTime);
      if (!isStarted){
        setTimer(newTime * 60);
      }
    }
  };

  return (
    <Box display="flex" height="100vh">
      <Sidebar />
      <Box flex={1} display="flex" flexDirection="column">
        <Header />
        <Box p={3} flex={1} overflow="auto" 
          sx={{backgroundColor: 'background.default',
         }}
        >
          <Grid container spacing={3}>
            {/*Left Column*/}
            <Grid item xs={12} md={8}>

              {/*Greeting Card*/}
              <Paper className="greeting-card">
                <Typography variant="h5" gutterBottom>
                  {greeting}, {profile.name.split(' ')[0]}
                </Typography>
                <Typography variant="body2">
                  You have {tasks.length} task(s) today. Stay focused!
                </Typography>
              </Paper>

              {/*Add Tasks Section*/}
              <Paper className="dashboard-section">
                <Typography variant="h6" className="dashboard-section-title" gutterBottom>
                  Quick Add Task
                </Typography>
                <Button variant="contained" onClick={() => handleOpenDialog()}>
                  Add Task
                </Button>
              </Paper>

              {/*My Tasks Section*/}
              <Paper className="dashboard-section">
                <Typography variant="h6" className="dashboard-section-title" gutterBottom>
                  My Tasks
                </Typography>
                {tasks.length === 0 ? (
                  <Typography>No tasks available. Add a new task!</Typography>
                ) : (
                  <List>
                    {tasks.map((task) => (
                      <ListItem
                        key = {task.task_id}
                        secondaryAction={
                          <>
                          {!task.completed && (
                            <IconButton edge="end" onClick={() => handleCompleteTask(task)}>
                              <CheckCircleIcon color="success" />
                            </IconButton>
                          )}
                          <IconButton edge="end" onClick={() => handleOpenDialog(task)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton edge="end" onClick={() => handleDeleteTask(task.task_id)}>
                            <DeleteIcon />
                          </IconButton>
                          </>
                        }
                      >
                        <ListItemText
                          primary={
                            <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                              {task.title}
                            </span>
                          }
                          secondary={
                            <>
                              {task.subject && <span>Subject: {task.subject} | </span>}
                              {task.due_date
                                ? `Due: ${new Date(task.due_date).toLocaleDateString()} ${new Date(
                                    task.due_date
                                  ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                : 'No due date'}
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>

            {/*Right Column */}
            <Grid item xs={12} md={4}>

              {/*Mini today's sessions*/}
              <Paper className="dashboard-section">
                <Typography varaint="h6" className="dashboard-section-title" gutterBottom>
                  Today's Sessions
                </Typography>
                {sessions.length === 0 ? (
                  <Typography>No sessions you're interested in today.</Typography>
                ) : (
                  <List>
                    {sessions.map((session) => (
                      <ListItem key={session.session_id}>
                        <ListItemText
                        primary={session.title}
                        secondary={`${session.venue} at ${new Date(session.date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>

              {/*Focus Timer*/}
              <Paper className="dashboard-section focus-timer">
                <Typography variant="h6" className="dashboard-section-title" gutterBottom>
                  Focus Timer
                </Typography>
                <TextField
                  label="Subject"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={currentSubjectTimer}
                  onChange={(e) => setCurrentSubjectTimer(e.target.value)}
                  disabled={isStarted}
                />
                <TextField
                  label="Custom Time (minutes)"
                  type="number"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={customTime}
                  onChange={(e) => handleCustomTimeChange(e)}
                  disabled={isStarted}
                  />
                  <Typography varaint="h3" className="timer-display"
                    sx={{
                      fontWeight: 'bold',
                      fontFamily: 'Roboto',
                      color: '#000',
                      marginY: 2,
                    }}
                  >
                    {isStarted ? formatTime(timer) : '--:--'}
                  </Typography>
                  <Box display="flex" gap={2} justifyContent="center">
                    {!isStarted ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleStartPauseTimer}
                      startIcon={<TimerIcon />}
                    >
                      Start
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="error"
                        onClick={handleEndTimer}
                        >
                          End
                          </Button>
                    )}
                    <Button variant="outlined" color="secondary" onClick={handleResetTimer}>
                      Reset
                    </Button>
                  </Box>
                  <Typography variant="h6" className="dashboard-section-title" gutterBottom sx={{marginTop: 4}}>
                    Focus Sessions Completed
                  </Typography>
                  {subjectTime.length === 0 ? (
                  <Typography>No focus sessions logged yet.</Typography>
                  ) : (
                    <List>
                      {subjectTime.map((item, index) => (
                       <ListItem key={index}>
                          <ListItemText primary={item.subject} secondary={`${item.minutes} minutes`} />
                        </ListItem>
                      ))}
                    </List>
                  )}
              </Paper>
            </Grid>
          </Grid>

          {/* Task Add/Edit Dialog */}
          <Dialog open={dialogOpen} onClose={handleCloseDialog}>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Add Task'}</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Task Title"
                type="text"
                fullWidth
                variant="outlined"
                value={newTask.title}
                onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
              />
              <TextField
                margin="dense"
                label="Subject"
                type="text"
                fullWidth
                variant="outlined"
                value={newTask.subject}
                onChange={(e) => setNewTask((prev) => ({ ...prev, subject: e.target.value }))}
              />
              <TextField
                margin="dense"
                label="Due Date"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={newTask.date}
                onChange={(e) => setNewTask((prev) => ({ ...prev, date: e.target.value }))}
              />
              <TextField
                margin="dense"
                label="Due Time"
                type="time"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={newTask.time}
                onChange={(e) => setNewTask((prev) => ({ ...prev, time: e.target.value }))}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleSaveTask}>{editingTask ? 'Update' : 'Add'}</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
};
   

export default Dashboard;
