import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, MapPin, Plus, Menu, LogOut, X, Trash2, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CalendarEvent,
    CalendarEventCreate,
    getEvents,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
} from '../services/api';

// ─── Event type colour presets ─────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
    class: 'border-violet-500 bg-violet-50 dark:bg-violet-500/10',
    meeting: 'border-blue-500 bg-blue-50 dark:bg-blue-500/10',
    deadline: 'border-rose-500 bg-rose-50 dark:bg-rose-500/10',
};

const TYPE_DOT_COLORS: Record<string, string> = {
    class: 'bg-violet-500',
    meeting: 'bg-blue-500',
    deadline: 'bg-rose-500',
};

// ─── Helpers ───────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, '0');

const toDateStr = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

const isToday = (d: Date) => isSameDay(d, new Date());

// ─── Component ─────────────────────────────────────────────────
const CalendarPage: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Events state
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Form fields
    const [formTitle, setFormTitle] = useState('');
    const [formDate, setFormDate] = useState('');
    const [formStartTime, setFormStartTime] = useState('09:00');
    const [formEndTime, setFormEndTime] = useState('10:00');
    const [formLocation, setFormLocation] = useState('');
    const [formType, setFormType] = useState<'class' | 'meeting' | 'deadline'>('class');
    const [formSaving, setFormSaving] = useState(false);

    const handleLogout = () => { logout(); navigate('/get-started'); };

    // ── Fetch events when month changes ────────────────────────
    const fetchEvents = async () => {
        setLoading(true);
        try {
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            const data = await getEvents(month, year);
            setEvents(data);
        } catch (err) {
            console.error('Failed to fetch events', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEvents(); }, [currentDate.getMonth(), currentDate.getFullYear()]);

    // ── Calendar grid helpers ──────────────────────────────────
    const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const getDaysArray = () => {
        const total = daysInMonth(currentDate);
        const first = firstDayOfMonth(currentDate);
        const days: (Date | null)[] = [];
        for (let i = 0; i < first; i++) days.push(null);
        for (let i = 1; i <= total; i++) days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
        return days;
    };

    const getEventsForDay = (date: Date) => events.filter(e => e.date === toDateStr(date));
    const selectedDayEvents = getEventsForDay(selectedDate);

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    // ── Modal open helpers ─────────────────────────────────────
    const openAddModal = () => {
        setEditingEvent(null);
        setFormTitle('');
        setFormDate(toDateStr(selectedDate));
        setFormStartTime('09:00');
        setFormEndTime('10:00');
        setFormLocation('');
        setFormType('class');
        setModalOpen(true);
    };

    const openEditModal = (event: CalendarEvent) => {
        setEditingEvent(event);
        setFormTitle(event.title);
        setFormDate(event.date);
        setFormStartTime(event.start_time);
        setFormEndTime(event.end_time);
        setFormLocation(event.location || '');
        setFormType(event.type);
        setModalOpen(true);
    };

    // ── Save (create / update) ─────────────────────────────────
    const handleSave = async () => {
        if (!formTitle.trim() || !formDate || !formStartTime || !formEndTime) return;
        setFormSaving(true);
        try {
            if (editingEvent) {
                const updated = await updateCalendarEvent(editingEvent.id, {
                    title: formTitle,
                    date: formDate,
                    start_time: formStartTime,
                    end_time: formEndTime,
                    location: formLocation || undefined,
                    type: formType,
                });
                setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
            } else {
                const payload: CalendarEventCreate = {
                    title: formTitle,
                    date: formDate,
                    start_time: formStartTime,
                    end_time: formEndTime,
                    location: formLocation || undefined,
                    type: formType,
                };
                const created = await createCalendarEvent(payload);
                setEvents(prev => [...prev, created]);
            }
            setModalOpen(false);
        } catch (err) {
            console.error('Failed to save event', err);
        } finally {
            setFormSaving(false);
        }
    };

    // ── Delete ─────────────────────────────────────────────────
    const handleDelete = async (id: string) => {
        try {
            await deleteCalendarEvent(id);
            setEvents(prev => prev.filter(e => e.id !== id));
            setDeleteConfirmId(null);
        } catch (err) {
            console.error('Failed to delete event', err);
        }
    };

    // ── Render ─────────────────────────────────────────────────
    return (
        <div className="flex min-h-screen bg-white dark:bg-[#0f1117] transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Mobile Top Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#0f1117] border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between px-4 z-30">
                <button onClick={() => setIsSidebarOpen(true)} className="p-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <button onClick={handleLogout} className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors" title="Logout">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <main className={`flex-1 lg:ml-64 p-4 md:p-7 relative transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'blur-sm lg:blur-none' : ''}`}>
                <div className="lg:hidden h-16" />

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex justify-between items-center mb-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">Calendar</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Manage your schedule and upcoming events</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center gap-3">
                            <ThemeToggle />
                            <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1" />
                            <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors" title="Logout">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                <div className="w-full h-1 bg-violet-500 dark:bg-white/[0.1] rounded-full mb-8 transition-colors duration-300" />

                <div className="flex flex-col lg:flex-row gap-8 max-w-7xl">
                    {/* ── Calendar Grid ────────────────────────── */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex-1 bg-white dark:bg-[#1a1d2e] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-6 shadow-sm transition-colors duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white transition-colors duration-300">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h2>
                            <div className="flex items-center gap-2">
                                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-600 dark:text-gray-400 transition-colors">
                                    <ChevronLeft size={20} />
                                </button>
                                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-600 dark:text-gray-400 transition-colors">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 mb-4">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider py-2">{day}</div>
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
                                    <button key={index} onClick={() => setSelectedDate(date)}
                                        className={`
                                            aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all duration-200
                                            ${isSelected ? 'bg-violet-600 text-white shadow-lg shadow-violet-200 dark:shadow-violet-500/20'
                                                : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'}
                                            ${isCurrentDay && !isSelected ? 'text-violet-600 dark:text-violet-400 font-bold bg-violet-50 dark:bg-violet-500/10' : ''}
                                        `}>
                                        <span className={`text-sm ${isSelected || isCurrentDay ? 'font-bold' : 'font-medium'}`}>{date.getDate()}</span>
                                        {hasEvents && (
                                            <div className="flex gap-1 mt-1">
                                                {dayEvents.slice(0, 3).map((ev, i) => (
                                                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : (TYPE_DOT_COLORS[ev.type] || 'bg-violet-500')}`} />
                                                ))}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {loading && (
                            <div className="text-center mt-4 text-gray-400 text-sm animate-pulse">Loading events…</div>
                        )}
                    </motion.div>

                    {/* ── Side Panel ────────────────────────────── */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
                        className="w-full lg:w-80 flex flex-col gap-6">
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
                                <button onClick={openAddModal}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-500/30 transition-colors"
                                    title="Add event">
                                    <Plus size={18} />
                                </button>
                            </div>

                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                                {selectedDayEvents.length > 0 ? (
                                    selectedDayEvents.map(event => (
                                        <div key={event.id}
                                            className={`group p-4 rounded-xl border-l-4 ${TYPE_COLORS[event.type] || TYPE_COLORS.class} transition-all hover:translate-x-1 duration-200 relative`}>
                                            <h4 className="font-bold text-sm mb-1 text-gray-900 dark:text-white pr-14">{event.title}</h4>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                <Clock size={12} />
                                                <span>{event.start_time}{event.end_time ? ` – ${event.end_time}` : ''}</span>
                                            </div>
                                            {event.location && (
                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <MapPin size={12} />
                                                    <span>{event.location}</span>
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEditModal(event)}
                                                    className="p-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400" title="Edit">
                                                    <Edit3 size={14} />
                                                </button>
                                                <button onClick={() => setDeleteConfirmId(event.id)}
                                                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 dark:hover:text-red-400" title="Delete">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>

                                            {/* Delete confirmation */}
                                            <AnimatePresence>
                                                {deleteConfirmId === event.id && (
                                                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                                                        className="absolute inset-0 bg-white/95 dark:bg-[#1a1d2e]/95 rounded-xl flex items-center justify-center gap-2 backdrop-blur-sm">
                                                        <span className="text-xs text-gray-600 dark:text-gray-300">Delete?</span>
                                                        <button onClick={() => handleDelete(event.id)}
                                                            className="px-3 py-1 text-xs font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors">Yes</button>
                                                        <button onClick={() => setDeleteConfirmId(null)}
                                                            className="px-3 py-1 text-xs font-medium rounded-lg bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">No</button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
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
                    </motion.div>
                </div>
            </main>

            {/* ── Add / Edit Modal ──────────────────────────────── */}
            <AnimatePresence>
                {modalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        onClick={() => setModalOpen(false)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-white dark:bg-[#1a1d2e] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/[0.06] w-full max-w-md p-6"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {editingEvent ? 'Edit Event' : 'New Event'}
                                </h3>
                                <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Title</label>
                                    <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. Data Structures Lecture"
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-sm" />
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Date</label>
                                    <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-sm" />
                                </div>

                                {/* Time row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Start Time</label>
                                        <input type="time" value={formStartTime} onChange={e => setFormStartTime(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">End Time</label>
                                        <input type="time" value={formEndTime} onChange={e => setFormEndTime(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-sm" />
                                    </div>
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Location <span className="text-gray-300 dark:text-gray-600">(optional)</span></label>
                                    <input value={formLocation} onChange={e => setFormLocation(e.target.value)} placeholder="e.g. Room 201"
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-sm" />
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Type</label>
                                    <div className="flex gap-2">
                                        {(['class', 'meeting', 'deadline'] as const).map(t => (
                                            <button key={t} onClick={() => setFormType(t)}
                                                className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all capitalize
                                                    ${formType === t
                                                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300'
                                                        : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20'
                                                    }`}>
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setModalOpen(false)}
                                    className="px-5 py-2.5 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={formSaving || !formTitle.trim()}
                                    className="px-5 py-2.5 text-sm font-bold rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-violet-200 dark:shadow-violet-500/20">
                                    {formSaving ? 'Saving…' : editingEvent ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CalendarPage;
