import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { parse, startOfWeek, getDay, format } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Sidebar from './Sidebar';
import Header from './Header';
import axios from 'axios';
import enUS from 'date-fns/locale/en-US';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date()),
  getDay,
  locales,
});

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [open, setOpen] = useState(false);
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const tasksResponse = await axios.get('http://localhost:5001/tasks', { headers });
        const sessionsResponse = await axios.get('http://localhost:5001/sessions/all', { headers });

        const tasks = tasksResponse.data.map((task) => ({
          title: task.title,
          start: new Date(task.due_date),
          end: new Date(new Date(task.due_date).getTime() + 60 * 60 * 1000),
          allDay: false,
          type: 'task',
          details: task,
        }));

        const sessions = sessionsResponse.data.map((session) => ({
          title: session.title,
          start: new Date(session.date),
          end: new Date(new Date(session.date).getTime() + session.duration * 60 * 1000),
          allDay: false,
          type: 'session',
          details: session,
        }));

        setEvents([...tasks, ...sessions]);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, [headers]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  return (
    <Box display="flex" height="100vh">
      <Sidebar />
      <Box flex={1} display="flex" flexDirection="column">
        <Header />
        <Box p={3} flex={1} style={{paddingBottom: '20px'}}>
          {/*<Typography variant="h4" gutterBottom>
            Calendar
          </Typography>*/}
          <Paper sx={{ p: 2, height: 'calc(100% - 50px)', background: '#ffffff', overflow: 'hidden'}}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%', minHeight: 0 }}
              views={['month', 'week', 'day']}
              defaultView="month"
              onSelectEvent={handleSelectEvent}
            />
          </Paper>
        </Box>
      </Box>

      {/* Event Modal */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Event Details</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <>
              <Typography variant="h6">{selectedEvent.title}</Typography>
              {selectedEvent.type === 'task' && (
                <>
                  <Typography>Due Date: {new Date(selectedEvent.details.due_date).toLocaleString()}</Typography>
                  <Typography>Subject: {selectedEvent.details.subject || 'N/A'}</Typography>
                </>
              )}
              {selectedEvent.type === 'session' && (
                <>
                  <Typography>Venue: {selectedEvent.details.venue}</Typography>
                  <Typography>Type: {selectedEvent.details.type}</Typography>
                  <Typography>Date: {new Date(selectedEvent.details.date).toLocaleString()}</Typography>
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarPage;
