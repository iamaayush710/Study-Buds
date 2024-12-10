import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Sidebar from './Sidebar';
import Header from './Header';
import axios from 'axios';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get('http://localhost:5001/tasks', { headers })
      .then(res => setTasks(res.data))
      .catch(err => console.error(err));
  }, [headers]);

  const addTask = () => {
    if(!newTask)return;
    axios.post('http://localhost:5001/tasks', {title:newTask}, {headers})
      .then(res => {
        setTasks(prev=>[...prev,res.data]);
        setNewTask('');
      })
      .catch(err => console.error(err));
  };

  const deleteTask = (id) => {
    axios.delete(`http://localhost:5001/tasks/${id}`, {headers})
      .then(() => setTasks(prev=>prev.filter(t=>t.task_id!==id)))
      .catch(err => console.error(err));
  };

  return (
    <Box display="flex" height="100vh">
      <Sidebar />
      <Box flex={1} display="flex" flexDirection="column">
        <Header />
        <Box p={3}>
          <Typography variant="h4" gutterBottom>My Tasks</Typography>
          <Paper sx={{ p:2, mb:2 }}>
            <TextField fullWidth placeholder="New task title" value={newTask} onChange={(e)=>setNewTask(e.target.value)} />
            <Button variant="contained" color="primary" onClick={addTask} sx={{ mt:2 }}>Add Task</Button>
          </Paper>
          <List>
            {tasks.map(task => (
              <ListItem key={task.task_id} 
                secondaryAction={
                  <IconButton edge="end" onClick={()=>deleteTask(task.task_id)}><DeleteIcon /></IconButton>
                }
              >
                <ListItemText primary={task.title} secondary={task.due_date || 'No due date'} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Box>
  );
};

export default TasksPage;