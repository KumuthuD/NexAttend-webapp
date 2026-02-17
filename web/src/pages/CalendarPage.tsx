import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, MapPin, Plus, Trash2, X, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getEvents, createEvent, deleteEvent, getClassrooms, Event as IEvent, EventCreate, Classroom } from '../services/api';

// Simple Notification Component
const Notification = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
    <motion.div
        initial={{ opacity: 0, y: 50, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: 50, x: '-50%' }}
        className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-3 ${
            type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}
    >
        <span>{message}</span>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
            <X size={16} />
        </button>
    </motion.div>
);

const CalendarPage: React.FC = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState<IEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // New Event State
    const [newEvent, setNewEvent] = useState<EventCreate>({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: '',
        type: 'meeting',
        color: 'bg-blue-500'
    });

    const [classrooms, setClassrooms] = useState<Classroom[]>([]);

    useEffect(() => {
        const loadClassrooms = async () => {
            try {
                const data = await getClassrooms();
                setClassrooms(data);
            } catch (error) {
                console.error("Failed to fetch classrooms", error);
            }
        };
        loadClassrooms();
    }, []);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setIsLoading(true);
            const data = await getEvents();
            setEvents(data);
        } catch (error) {
            console.error('Failed to fetch events', error);
            showNotification('Failed to load events', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/get-started');
    };

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAddEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submitting event:", newEvent);
        try {
            // Combine date with time
            const dateStr = selectedDate.toISOString().split('T')[0];
            const startDateTime = new Date(`${dateStr}T${newEvent.start_time}`);
            const endDateTime = new Date(`${dateStr}T${newEvent.end_time}`);

            console.log("Parsed dates:", { startDateTime, endDateTime });

            await createEvent({
                ...newEvent,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
            });

            console.log("Event created successfully");
            showNotification('Event scheduled successfully', 'success');
            setShowAddModal(false);
            setNewEvent({
                title: '',
                description: '',
                start_time: '',
                end_time: '',
                location: '',
                type: 'meeting',
                color: 'bg-blue-500'
            });
            fetchEvents();
        } catch (error) {
            console.error('Failed to create event', error);
            showNotification('Failed to schedule event', 'error');
        }
    };

    const handleDeleteEvent = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            await deleteEvent(id);
            fetchEvents();
            showNotification('Event removed successfully', 'success');
        } catch (error) {
            console.error('Failed to delete event', error);
            showNotification('Failed to delete event', 'error');
        }
    };

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
        return events.filter(event => {
            const eventDate = new Date(event.start_time);
            return isSameDay(eventDate, date);
        });
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const selectedDayEvents = getEventsForDay(selectedDate);

    // Format greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';


    return (
        <DashboardLayout>
            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <Notification
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotification(null)}
                    />
                )}
            </AnimatePresence>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
            >
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">
                        Calendar
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        Manage your schedule and upcoming events
                    </p>
                </div>

                <div className="flex items-center gap-4 self-end md:self-auto">
                    <ThemeToggle />
                    <button
                        onClick={handleLogout}
                        className="px-5 py-2 text-sm text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-900 rounded-xl transition-all duration-200 font-medium bg-white dark:bg-white/5 dark:text-gray-400 dark:border-white/10 dark:hover:text-white dark:hover:border-white/20"
                    >
                        Logout
                    </button>
                </div>
            </motion.div>

            <div className="flex flex-col xl:flex-row gap-8 w-full">
                    {/* Calendar Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex-1 bg-white dark:bg-[#1a1d2e] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-6 shadow-sm transition-colors duration-300"
                    >
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
                    </motion.div>

                    {/* Side Panel for Selected Day */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="w-full lg:w-80 flex flex-col gap-6"
                    >
                        <div className="bg-white dark:bg-[#1a1d2e] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-6 shadow-sm flex-1 transition-colors duration-300 flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-300">
                                        {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                        {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-100 hover:scale-110 transition-all font-bold"
                                    title="Add Event"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>

                            <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                                {selectedDayEvents.length > 0 ? (
                                    selectedDayEvents.map(event => (
                                        <div
                                            key={event._id}
                                            className={`group relative p-4 rounded-xl border-l-4 ${event.color || 'border-blue-500'} bg-gray-50 dark:bg-white/5 transition-all hover:translate-x-1 duration-200`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-sm mb-1 text-gray-900 dark:text-white">
                                                    {event.title}
                                                </h4>
                                                <button
                                                    onClick={() => event._id && handleDeleteEvent(event._id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-500 transition-opacity"
                                                    title="Delete Event"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 text-xs opacity-80 mb-1 text-gray-600 dark:text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    <span>
                                                        {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {' - '}
                                                        {new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                            {event.location && (
                                                <div className="flex items-center gap-2 text-xs opacity-80 text-gray-600 dark:text-gray-400">
                                                    <MapPin size={12} />
                                                    <span>{event.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10">
                                        <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
                                            <CalendarIcon size={20} className="text-gray-300 dark:text-gray-600" />
                                        </div>
                                        <p className="text-gray-400 dark:text-gray-500 text-sm">No events scheduled</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>

            {/* Add Event Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-[#1a1d2e] rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100 dark:border-white/[0.06]"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add New Event</h3>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-500"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAddEvent} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Event Title</label>
                                    {newEvent.type === 'class' && classrooms.length > 0 ? (
                                        <select
                                            required
                                            className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            value={newEvent.title}
                                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                        >
                                            <option value="">Select a Class</option>
                                            {classrooms.map(cls => (
                                                <option key={cls._id} value={cls.name}>{cls.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            value={newEvent.title}
                                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                            placeholder="Meeting with team"
                                        />
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                                        <select
                                            className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            value={newEvent.type}
                                            onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                                        >
                                            <option value="class">Class</option>
                                            <option value="meeting">Meeting</option>
                                            <option value="deadline">Deadline</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Color</label>
                                        <select
                                            className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            value={newEvent.color}
                                            onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
                                        >
                                            <option value="border-blue-500">Blue</option>
                                            <option value="border-green-500">Green</option>
                                            <option value="border-red-500">Red</option>
                                            <option value="border-yellow-500">Yellow</option>
                                            <option value="border-purple-500">Purple</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            required
                                            className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            value={newEvent.start_time}
                                            onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">End Time</label>
                                        <input
                                            type="time"
                                            required
                                            className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            value={newEvent.end_time}
                                            onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Location (Optional)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        value={newEvent.location}
                                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                        placeholder="Room 101 or Zoom Link"
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-violet-500/20"
                                    >
                                        Add Event
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default CalendarPage;
