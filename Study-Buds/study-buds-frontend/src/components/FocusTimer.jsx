import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, TextField, Paper, List, ListItem, ListItemText } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import Sidebar from './Sidebar';
import Header from './Header';
import axios from 'axios';

const FocusTimer = () => {
  const [timer, setTimer] = useState(25 * 60); // 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [customTime, setCustomTime] = useState(25);
  const [currentSubject, setCurrentSubject] = useState('');
  const [subjectTime, setSubjectTime] = useState([]);
  const timerRef = useRef(null);
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (isRunning && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    if (!isRunning || timer <= 0) {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, timer]);

  useEffect(() => {
    if (timer === 0 && isRunning) {
      setIsRunning(false);
      logFocusSession();
      alert('Focus session goal completed!');
      setTimer(customTime * 60); // Reset timer
    }
  }, [timer, isRunning]);

  const logFocusSession = async () => {
    if (!currentSubject) return;
    try {
      await axios.post(
        'http://localhost:5001/activities',
        { description: `Studied ${currentSubject} for ${customTime} minutes`, subject: currentSubject },
        { headers }
      );
      // Update local subject time
      setSubjectTime((prev) => {
        const index = prev.findIndex((s) => s.subject === currentSubject);
        if (index !== -1) {
          const updated = [...prev];
          updated[index].minutes += customTime;
          return updated;
        } else {
          return [...prev, { subject: currentSubject, minutes: customTime }];
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
    return `${m} : ${s}`;
  };

  const handleStartPause = () => {
    if (!currentSubject && !isRunning) {
      alert('Please enter the subject you are studying.');
      return;
    }
    setIsRunning((prev) => !prev);
    setIsStarted(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimer(customTime * 60);
    setCurrentSubject('');
    setIsStarted(false);
  };

  const handleEnd = () => {
    setIsRunning(false);
    setTimer(customTime*60);
    setIsStarted(false);
    alert('Focus session ended.');
  };

  const handleCustomTimeChange = (e) => {
    const newTime = parseInt(e.target.value, 10);
    if (!isNaN(newTime) && newTime > 0) {
        setCustomTime(newTime);
        if (!isStarted) {
            setTimer(newTime * 60);
        }
    }
    };


  return (
    <Box display="flex" height="100vh">
      <Sidebar />
      <Box flex={1} display="flex" flexDirection="column">
        <Header />
        <Box p={3} flex={1} display="flex" justifyContent="center" alignItems="center">
          <Paper sx={{ p: 4, textAlign: 'center', width: 300 }}>
            <Typography variant="h5" gutterBottom>
              Focus Timer
            </Typography>
            <TextField
              label="Subject"
              variant="outlined"
              fullWidth
              margin="normal"
              value={currentSubject}
              onChange={(e) => setCurrentSubject(e.target.value)}
              disabled={isStarted}
            />
            <TextField
                label="Custom Time (minutes)"
                type="number"
                variant="outlined"
                fullWidth
                margin="normal"
                value={customTime}
                onChange={handleCustomTimeChange}
                disabled={isStarted}
                />
            <Typography variant="h4" sx={{ fontWeight: 600, marginY: 2 }}>
              {formatTime(timer)}
            </Typography>
            <Box display="flex" gap={2} justifyContent="center">
                {!isStarted ? (
                    <Button 
                        variant="contained"
                        color="primary"
                        onClick={handleStartPause}
                        startIcon={<TimerIcon />}
                        >
                            Start
                        </Button>
                ) : (
                    <Button variant="contanied" color="error" onClick={handleEnd}>
                        End
                    </Button>
                )}
              <Button variant="outlined" color="secondary" onClick={handleReset}>
                Reset
              </Button>
            </Box>
            <Typography variant="h6" gutterBottom sx={{ marginTop: 4 }}>
              Time Spent per Subject
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
        </Box>
      </Box>
    </Box>
  );

};

export default FocusTimer;