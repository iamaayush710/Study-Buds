import React, {useState} from 'react';
import {Box, Typography} from '@mui/material';
import {styled} from '@mui/material/styles';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const CalendarContainer = styled(Box)(({theme}) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
    padding: theme.spacing(3),
    margin: theme.spacing(3,2),
}));

const CalendarPage = () => {
    return <div>CalendarPage</div>
};
/**
const CalendarPage = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const handleDateChange = (date) => {
        setSelectedDate(date);
        console.log('Selected Date:', date);
    };

    return (
        <CalendarContainer>
            <Typography varient="h5" gutterButton>Calendar</Typography>
            <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            tileClassName="calendar-tile"
            />
        </CalendarContainer>
    );
};
**/
export default CalendarPage;