import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import Sidebar from './Sidebar';
import Header from './Header';
import axios from 'axios';

const ActivitiesPage = () => {
  const [studyTime, setStudyTime] = useState([]);
  const [subjectBreakdown, setSubjectBreakdown] = useState([]);
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchStudyTime = async () => {
      try {
        const response = await axios.get('http://localhost:5001/user/study-time', { headers });
        setStudyTime(response.data);
      } catch (error) {
        console.error('Error fetching study time:', error);
      }
    };
    fetchStudyTime();
  }, [headers]);

  useEffect(() => {
    const fetchSubjectBreakdown = async () => {
      try {
        const response = await axios.get('http://localhost:5001/user/study-time', { headers });
        const breakdown = {};
        response.data.forEach((entry) => {
          const subject = entry.subject || 'Unknown';
          breakdown[subject] = (breakdown[subject] || 0) + entry.total_minutes;
        });
        const formatted = Object.keys(breakdown).map((key) => ({
          name: key,
          value: breakdown[key],
        }));
        setSubjectBreakdown(formatted);
      } catch (error) {
        console.error('Error fetching subject breakdown:', error);
      }
    };
    fetchSubjectBreakdown();
  }, [headers]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF'];

  return (
    <Box display="flex" height="100vh">
      <Sidebar />
      <Box flex={1} display="flex" flexDirection="column">
        <Header />
        <Box p={3} flex={1} overflow="auto">
          <Typography variant="h4" gutterBottom>
            My Activities
          </Typography>

          {/* Study Time Over Last 7 Days */}
          <Paper sx={{ p: 2, mb: 4, background: '#ffffff' }}>
            <Typography variant="h6" gutterBottom>
              Study Time Over Last 7 Days
            </Typography>
            {studyTime.length === 0 ? (
              <Typography>No study data available.</Typography>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={studyTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="total_minutes" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Paper>

          {/* Study Time by Subject */}
          <Paper sx={{ p: 2, background: '#ffffff' }}>
            <Typography variant="h6" gutterBottom>
              Study Time by Subject
            </Typography>
            {subjectBreakdown.length === 0 ? (
              <Typography>No subject data available.</Typography>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={subjectBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                  >
                    {subjectBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ActivitiesPage;