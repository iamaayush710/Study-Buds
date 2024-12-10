import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const StudyGraph = ({ data }) => {
  // data: [{day:'2024-09-01', total_minutes:120}, ...]
  const chartData = data.map(d => ({ day: d.day, minutes: d.total_minutes }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top:20, right:20, left:0, bottom:20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis label={{ value: 'Minutes', angle: -90, position:'insideLeft' }}/>
        <Tooltip />
        <Bar dataKey="minutes" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StudyGraph;