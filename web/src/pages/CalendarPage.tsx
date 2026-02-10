import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, MapPin, Plus } from 'lucide-react';

interface Event {
    id: number;
    title: string;
    date: Date;
    startTime: string;
    endTime: string;
    location: string;
    type: 'class' | 'meeting' | 'deadline';
    color: string;
}

const CalendarPage: React.FC = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const handleLogout = () => {
        logout();
        navigate('/get-started');
    };

    // Mock Events
    const events: Event[] = [
        {
            id: 1,
            title: 'Advanced Client Side',
            date: new Date(new Date().setDate(new Date().getDate() + 0)), // Today
            startTime: '09:00 AM',
            endTime: '11:00 AM',
            location: 'Room 304',
            type: 'class',
            color: 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-500/30'
        },
        {
            id: 2,
            title: 'Database Systems',
            date: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
            startTime: '01:00 PM',
            endTime: '03:00 PM',
            location: 'Lab 2',
            type: 'class',
            color: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
        },
        {
            id: 3,
            title: 'Project Submission',
            date: new Date(new Date().setDate(new Date().getDate() + 3)),
            startTime: '11:59 PM',
            endTime: '',
            location: 'Online',
            type: 'deadline',
            color: 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30'
        },
        {
            id: 4,
            title: 'Team Meeting',
            date: new Date(new Date().setDate(new Date().getDate() + 0)), // Today
            startTime: '04:00 PM',
            endTime: '05:00 PM',
            location: 'Library',
            type: 'meeting',
            color: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30'
        }
    ];

    const daysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getDaysArray = () => {
        const totalDays = daysInMonth(currentDate);
        const firstDay = firstDayOfMonth(currentDate);
        const days = [];

        // Add empty cells for days before the 1st
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let i = 1; i <= totalDays; i++) {
            days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
        }

        return days;
    };

    const isSameDay = (date1: Date, date2: Date) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return isSameDay(date, today);
    };

    const getEventsForDay = (date: Date) => {
        return events.filter(event => isSameDay(event.date, date));
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const selectedDayEvents = getEventsForDay(selectedDate);

    // Format greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';


    return (
        <div className="flex min-h-screen bg-[#f8f9fc] dark:bg-[#0f1117] transition-colors duration-300">
            <Sidebar />

            <main className="flex-1 ml-64 p-10 relative">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">
                            Calendar
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            Manage your schedule and upcoming events
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <button
                            onClick={handleLogout}
                            className="px-5 py-2 text-sm text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-900 rounded-xl transition-all duration-200 font-medium bg-white dark:bg-white/5 dark:text-gray-400 dark:border-white/10 dark:hover:text-white dark:hover:border-white/20"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 max-w-7xl">
                    {/* Calendar Section */}
                    <div className="flex-1 bg-white dark:bg-[#1a1d2e] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-6 shadow-sm transition-colors duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white transition-colors duration-300">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={prevMonth}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => setCurrentDate(new Date())}
                                    className="px-3 py-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-lg transition-colors border border-transparent hover:border-violet-100 dark:hover:border-violet-500/20"
                                >
                                    Today
                                </button>
                                <button
                                    onClick={nextMonth}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 mb-4">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                            {getDaysArray().map((date, index) => {
                                if (!date) return <div key={`empty-${index}`} className="aspect-square" />;

                                const isSelected = isSameDay(date, selectedDate);
                                const isCurrentDay = isToday(date);
                                const dayEvents = getEventsForDay(date);
                                const hasEvents = dayEvents.length > 0;

                                return (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedDate(date)}
                                        className={`
                                            aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all duration-200
                                            ${isSelected
                                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-200 dark:shadow-violet-500/20'
                                                : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                                            }
                                            ${isCurrentDay && !isSelected ? 'text-violet-600 dark:text-violet-400 font-bold bg-violet-50 dark:bg-violet-500/10' : ''}
                                        `}
                                    >
                                        <span className={`text-sm ${isSelected || isCurrentDay ? 'font-bold' : 'font-medium'}`}>
                                            {date.getDate()}
                                        </span>
                                        {hasEvents && (
                                            <div className="flex gap-1 mt-1">
                                                {dayEvents.slice(0, 3).map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/70' : 'bg-violet-500'}`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Side Panel for Selected Day */}
                    <div className="w-full lg:w-80 flex flex-col gap-6">
                        <div className="bg-white dark:bg-[#1a1d2e] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-6 shadow-sm flex-1 transition-colors duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-300">
                                        {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                        {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-500/10 dark:hover:text-violet-400 transition-colors">
                                    <Plus size={18} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {selectedDayEvents.length > 0 ? (
                                    selectedDayEvents.map(event => (
                                        <div
                                            key={event.id}
                                            className={`p-4 rounded-xl border-l-4 ${event.color} transition-all hover:translate-x-1 duration-200`}
                                        >
                                            <h4 className="font-bold text-sm mb-1 text-gray-900 dark:text-white">
                                                {event.title}
                                            </h4>
                                            <div className="flex items-center gap-2 text-xs opacity-80 mb-1">
                                                <Clock size={12} />
                                                <span>
                                                    {event.startTime}
                                                    {event.endTime ? ` - ${event.endTime}` : ''}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs opacity-80">
                                                <MapPin size={12} />
                                                <span>{event.location}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10">
                                        <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
                                            <Clock size={20} className="text-gray-300 dark:text-gray-600" />
                                        </div>
                                        <p className="text-gray-400 dark:text-gray-500 text-sm">No events scheduled</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Summary Widget */}
                        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-violet-500/30">
                            <h3 className="font-bold text-lg mb-1">Upcoming Stats</h3>
                            <p className="text-violet-100 text-sm mb-4">Your activity this week</p>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-violet-100">Classes</span>
                                    <span className="font-bold">12</span>
                                </div>
                                <div className="w-full bg-black/20 rounded-full h-1.5">
                                    <div className="bg-white/80 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                                </div>

                                <div className="flex justify-between items-center text-sm mt-2">
                                    <span className="text-violet-100">Attendance</span>
                                    <span className="font-bold">92%</span>
                                </div>
                                <div className="w-full bg-black/20 rounded-full h-1.5">
                                    <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '92%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CalendarPage;
