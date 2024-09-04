import React, { useState, useEffect, useRef } from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, addMonths, isBefore, isToday } from 'date-fns';
import { Button } from "../components/Button";

const ScheduledAssessment = ({ name }) => {
    return (<div style={{
        border: 'solid 1px var(--foreground-border)',
        borderRadius: '4px',
        padding: 3
    }}>{name}</div>)
}

const Day = ({date}) => {

    return (
        <div style={{
            padding: '10px',
            background: `var(--background-${(isBefore(date, Date.now()) && !isToday(date)) ? 'primary' : date.getMonth() % 2 === 1 ? 'tertiary' : 'secondary'})`,
            border: `1px solid var(--foreground-${isToday(date) ? 'primary' : 'border'})`,
        }}
        >
            <span style={{ color: 'var(--foreground-secondary)' }}>
                {(format(date, 'd') === '1' && format(date, 'MMM') === 'Jan') ? format(date, 'yyyy ') : ''}
                {format(date, 'd') === '1' ? format(date, 'MMM ') : ''}
                {format(date, 'd')}
            </span>
            {format(date, 'd') === '21' ? (
                ScheduledAssessment({ name: "Test" })
            ) : ''}
            {format(date, 'd') === '15' ? (
                <>
                    <ScheduledAssessment name="Test 1" />
                    <ScheduledAssessment name="Test 2" />
                </>
            ) : ''}
        </div>
    );
};

export const Calendar = () => {
    const [days, setDays] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        // Initialize with the current month
        loadMoreDays();
    }, []);

    const loadMoreDays = () => {
        setCurrentDate(prevDate => {
            const start = startOfMonth(prevDate);
            const end = endOfMonth(currentDate.setDate(currentDate.getDate() + 180));
            const daysArray = eachDayOfInterval({ start, end });
            setDays(prevDays => [...prevDays, ...daysArray]);
            return addMonths(prevDate, 1);
        });
    };


    const handleScroll = () => {
        const { scrollTop, scrollHeight } = document.documentElement;
        const clientHeight = window.innerHeight;

        if (scrollTop + clientHeight >= scrollHeight - 50) {
            loadMoreDays(); // Load more days when near the bottom of the page
        }
    };

    window.addEventListener('scroll', handleScroll);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {days.map(day => (
                <Day key={day} date={day} />
            ))}
        </div>
    );
};

export default Calendar;