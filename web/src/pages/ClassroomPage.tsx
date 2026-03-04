import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { Send, Megaphone, MessageCircle, ArrowLeft, Users, Clock, Hash, CheckCircle, History, RefreshCw, Smile, Activity, Menu, LogOut, Trash2, AlertTriangle, Flag } from 'lucide-react';
import CameraCapture from '../components/common/WebcamCapture';
import AttendanceList from '../components/classroom/AttendanceList';
import AttendanceHistoryTable, { AttendanceRecord } from '../components/dashboard/AttendanceHistoryTable';
import { AnimatePresence, motion } from 'framer-motion';
import DatePicker from '../components/common/DatePicker';
import MotivationScoreDisplay from '../components/dashboard/MotivationScoreDisplay';
import { getStudentMotivationData, getClassroom, Classroom, getClassroomAnnouncements, createAnnouncement, deleteAnnouncement, Announcement, startAttendanceSession, closeAttendanceSession, getClassroomAttendanceHistory } from '../services/api';

interface Student {
    id: string;
    name: string;
    time: string;
    status: 'present' | 'late';
    avatar?: string;
    isFlagged?: boolean;
}

const ClassroomPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [announcementText, setAnnouncementText] = useState('');
    const [chatText, setChatText] = useState('');
    const [presentStudents, setPresentStudents] = useState<Student[]>([]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Attendance session state
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [totalSessions, setTotalSessions] = useState(0);

    // Announcements state
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isPostingAnnouncement, setIsPostingAnnouncement] = useState(false);
    const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null);
    const [isDeletingAnnouncement, setIsDeletingAnnouncement] = useState(false);

    // Motivation score state — fetched from backend per-classroom
    const [motivationScore, setMotivationScore] = useState(0);
    const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);

    const [classroomDetails, setClassroomDetails] = useState<Classroom | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch classroom details
    useEffect(() => {
        const fetchClassroomDetails = async () => {
            if (!id) return;
            try {
                const data = await getClassroom(id);
                setClassroomDetails(data);
            } catch (error) {
                console.error('Failed to fetch classroom:', error);
                setToastMessage('Failed to load classroom details');
                setShowToast(true);
            } finally {
                setIsLoading(false);
            }
        };
        fetchClassroomDetails();
    }, [id]);

    // Fetch announcements
    const fetchAnnouncements = async () => {
        if (!id) return;
        try {
            const data = await getClassroomAnnouncements(id);
            setAnnouncements(data);
        } catch (error) {
            console.error('Failed to fetch announcements:', error);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, [id]);

    // Fetch motivation data for student users
    useEffect(() => {
        const fetchMotivation = async () => {
            if (user?.role === 'student' && user?.id && id) {
                try {
                    const progress = await getStudentMotivationData(user.id);
                    const classroomData = progress[id] || { motivation_score: 0, unlocked_badges: [] };
                    setMotivationScore(classroomData.motivation_score);
                    setUnlockedBadges(classroomData.unlocked_badges);
                } catch (error) {
                    console.error('Failed to fetch motivation data:', error);
                    // Fallback to defaults
                    setMotivationScore(0);
                    setUnlockedBadges([]);
                }
            }
        };
        fetchMotivation();
    }, [user?.role, user?.id, id]);

    // Fetch attendance history from API
    const fetchAttendanceHistory = async () => {
        if (!id) return;
        setHistoryLoading(true);
        try {
            const data = await getClassroomAttendanceHistory(id);
            setTotalSessions(data.total);
            // Map backend sessions to AttendanceRecord format
            const records: AttendanceRecord[] = data.items.map((session: any) => ({
                id: session._id || session.id,
                date: session.session_date ? session.session_date.split('T')[0] : '',
                classroom_id: id,
                classroom_name: classroomDetails?.name || '',
                presentCount: session.present_student_ids?.length || 0,
                totalCount: classroomDetails?.student_count || 0,
            }));
            setAttendanceHistory(records);
        } catch (error) {
            console.error('Failed to fetch attendance history:', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    // Fetch history when classroom details are loaded or history is toggled
    useEffect(() => {
        if (classroomDetails && id) {
            fetchAttendanceHistory();
        }
    }, [classroomDetails, id]);

    // Filter history based on selected date
    const filteredHistory = selectedDate
        ? attendanceHistory.filter(record => record.date === selectedDate)
        : attendanceHistory;

    const handleFaceRecognized = (face: any) => {
        const student = face.student;

        setPresentStudents(prev => {
            // Check if student is already marked
            if (prev.some(s => s.id === student.id)) {
                return prev;
            }

            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Show toast
            setToastMessage(`${student.full_name} marked present!`);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);

            return [{
                id: student.id,
                name: student.full_name,
                time: timeString,
                status: 'present',
                avatar: undefined, // Backend might provide this later
                isFlagged: face.is_flagged || (face.confidence !== undefined && face.confidence < 0.6)
            }, ...prev];
        });
    };

    const handleLogout = () => {
        logout();
        navigate('/get-started');
    };

    const handleCapture = (file: File) => {
        console.log("Captured file:", file);
        setIsCameraOpen(false);
    };

    // Start an attendance session and open the camera
    const handleMarkAttendance = async () => {
        if (!id) return;
        try {
            const session = await startAttendanceSession(id);
            const sessionId = (session as any)._id || session.id;
            setActiveSessionId(sessionId);
            setPresentStudents([]);
            setIsCameraOpen(true);
        } catch (error) {
            console.error('Failed to start attendance session:', error);
            setToastMessage('Failed to start attendance session');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    // Close the session and stop the camera
    const handleStopAttendance = async () => {
        setIsCameraOpen(false);
        if (activeSessionId) {
            try {
                await closeAttendanceSession(activeSessionId);
                setToastMessage(`Session ended. ${presentStudents.length} student(s) marked present.`);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 4000);
                // Refresh history data
                fetchAttendanceHistory();
            } catch (error) {
                console.error('Failed to close attendance session:', error);
            } finally {
                setActiveSessionId(null);
            }
        }
    };

    const handlePostAnnouncement = async () => {
        if (!id || !announcementText.trim()) return;

        setIsPostingAnnouncement(true);
        try {
            await createAnnouncement(id, announcementText.trim());
            setAnnouncementText('');
            setToastMessage('Announcement posted!');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            fetchAnnouncements(); // Refresh the list
        } catch (error) {
            console.error('Failed to post announcement:', error);
            setToastMessage('Failed to post announcement');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } finally {
            setIsPostingAnnouncement(false);
        }
    };

    const confirmDeleteAnnouncement = async () => {
        if (!id || !announcementToDelete) return;

        setIsDeletingAnnouncement(true);
        try {
            await deleteAnnouncement(id, announcementToDelete);
            setToastMessage('Announcement deleted!');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            fetchAnnouncements(); // Refresh the list
        } catch (error) {
            console.error('Failed to delete announcement:', error);
            setToastMessage('Failed to delete announcement');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } finally {
            setIsDeletingAnnouncement(false);
            setAnnouncementToDelete(null);
        }
    };

    // Real Data Fallbacks
    const classroomName = classroomDetails?.name || "Loading Classroom...";
    const accessCode = classroomDetails?.access_code || "---";

    if (isLoading && !classroomDetails) {
        return <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] dark:bg-[#0f1117] text-gray-900 dark:text-white">Loading Classroom...</div>;
    }

    const chatMessages: { id: string; date?: string; color: string; initial: string; author: string; time: string; content: string }[] = [];

    return (
        <div className="flex min-h-screen bg-white dark:bg-[#0f1117] transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 lg:ml-64 p-4 md:p-9 relative overflow-hidden">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between mb-6 bg-white dark:bg-[#0f1117] p-4 -mx-4 -mt-4 border-b border-gray-100 dark:border-white/[0.06] sticky top-0 z-30 transition-colors duration-300">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <button
                            onClick={handleLogout}
                            className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Header */}
                <div className="flex justify-between items-center mb-7">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 transition-colors duration-200 text-sm font-medium"
                    >
                        <ArrowLeft size={16} />
                        <span className="">Dashboard</span>
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center gap-3">
                            <ThemeToggle />
                            <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1" />
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Classroom Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-[#1a1d2e] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-6 mb-8 shadow-sm transition-colors duration-300"
                >
                    <div className="h-1 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-80 rounded-full -mt-6 mx-[-24px] mb-5" style={{ width: 'calc(100% + 48px)', marginTop: '-32px', borderRadius: '16px 16px 16px 16px' }} />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{classroomName}</h1>
                            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                <span className="flex items-center gap-1.5">
                                    <Hash size={14} className="text-gray-400 dark:text-gray-500" />
                                    <span className="font-mono text-violet-600 dark:text-violet-400 font-medium">{accessCode}</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Users size={14} className="text-gray-400 dark:text-gray-500" />
                                    {classroomDetails?.student_count || 0} students
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock size={14} className="text-gray-400 dark:text-gray-500" />
                                    {totalSessions} session{totalSessions !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                        {user?.role === 'teacher' && (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                {/* Attendance History toggle — left of Mark Attendance */}
                                <button
                                    onClick={() => setShowHistory(prev => !prev)}
                                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm border ${showHistory
                                        ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-500/30'
                                        : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-violet-300 dark:hover:border-violet-500/30 hover:text-violet-600 dark:hover:text-violet-400'
                                        }`}
                                >
                                    <History size={15} />
                                    {showHistory ? 'Hide History' : 'Attendance History'}
                                </button>


                                {/* Mark Attendance */}
                                <button
                                    onClick={handleMarkAttendance}
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-violet-200 dark:shadow-violet-500/20 text-sm"
                                >
                                    Mark Attendance
                                </button>
                            </div>
                        )}
                        {user?.role === 'student' && (
                            <button
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-violet-200 dark:shadow-violet-500/20 text-sm"
                            >
                                View Attendance
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Attendance History Table — teacher only, collapsible */}
                <AnimatePresence>
                    {user?.role === 'teacher' && showHistory && (
                        <motion.div
                            key="history-table"
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.35, ease: 'easeInOut' }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <History size={15} className="text-gray-400 dark:text-gray-500" />
                                <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Attendance History</h2>
                            </div>

                            {/* Date Filter */}
                            <div className="mb-4 max-w-xs flex items-end gap-2">
                                <DatePicker
                                    className="flex-1"
                                    label="Filter by Date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    placeholder="Select date..."
                                />
                                {selectedDate && (
                                    <button
                                        onClick={() => setSelectedDate('')}
                                        className="p-2.5 mb-[1px] bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 rounded-lg transition-colors"
                                        title="Clear Filter"
                                    >
                                        <RefreshCw size={20} />
                                    </button>
                                )}
                            </div>

                            <AttendanceHistoryTable records={filteredHistory} isLoading={historyLoading} />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className={`grid grid-cols-1 ${user?.role === 'teacher' ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6 max-w-6xl mx-auto`}>
                    {/* Attendance List - New Column - Only for teachers */}
                    {user?.role === 'teacher' && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="lg:col-span-1"
                        >
                            <AttendanceList students={presentStudents} />
                        </motion.div>
                    )}

                    <div className={`${user?.role === 'teacher' ? 'lg:col-span-2' : 'lg:col-span-1'} space-y-6`}>
                        {/* Motivation Score Panel - Only for students */}
                        {user?.role === 'student' && (
                            <MotivationScoreDisplay
                                score={motivationScore}
                                unlockedBadges={unlockedBadges}
                            />
                        )}

                        {/* Announcements Section */}
                        <motion.section
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className="flex items-center gap-2.5 mb-4">
                                <Megaphone size={16} className="text-gray-400 dark:text-gray-500" />
                                <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">Announcements</h2>
                            </div>

                            <div className="bg-white dark:bg-[#1a1d2e] rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden flex flex-col shadow-sm transition-colors duration-300 mb-10 h-[260px]">
                                {/* List of announcements */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {announcements.length === 0 ? (
                                        <div className="h-full flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors duration-300">
                                                    <Megaphone size={28} className="text-gray-300 dark:text-gray-600" />
                                                </div>
                                                <p className="text-gray-400 dark:text-gray-500 text-sm font-medium transition-colors duration-300">No announcements yet</p>
                                            </div>
                                        </div>
                                    ) : (
                                        announcements.map((ann) => (
                                            <div key={ann.id} className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5 group relative">
                                                <div className="flex justify-between items-start mb-2 pr-8">
                                                    <span className="font-semibold text-sm text-gray-800 dark:text-white capitalize">{ann.teacher_name || 'Teacher'}</span>
                                                    <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap mt-0.5">
                                                        {new Date(ann.created_at + 'Z').toLocaleDateString()} - {new Date(ann.created_at + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{ann.content}</p>

                                                {/* Delete button (teacher only) */}
                                                {user?.role === 'teacher' && (
                                                    <button
                                                        onClick={() => setAnnouncementToDelete(ann.id)}
                                                        className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                                                        title="Delete announcement"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Input Area - Only for teachers */}
                                {user?.role === 'teacher' && (
                                    <div className="p-4 border-t border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-black/20 transition-colors duration-300">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={announcementText}
                                                onChange={(e) => setAnnouncementText(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handlePostAnnouncement();
                                                }}
                                                placeholder="Post an announcement..."
                                                disabled={isPostingAnnouncement}
                                                className="w-full pl-4 pr-11 py-3 bg-white dark:bg-white/[0.05] rounded-xl text-gray-800 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-600 border border-gray-200 dark:border-white/[0.1] focus:outline-none focus:border-violet-400 dark:focus:border-violet-500/40 focus:ring-2 focus:ring-violet-50 dark:focus:ring-violet-500/10 transition-all duration-200 disabled:opacity-50"
                                            />
                                            <button
                                                onClick={handlePostAnnouncement}
                                                disabled={!announcementText.trim() || isPostingAnnouncement}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-violet-50 dark:hover:bg-white/10 transition-colors text-gray-400 dark:text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 disabled:opacity-50"
                                            >
                                                <Send size={15} className={isPostingAnnouncement ? 'animate-pulse' : ''} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.section>

                        {/* Chat Section */}
                        <motion.section
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <div className="flex items-center gap-2.5 mb-4">
                                <MessageCircle size={16} className="text-gray-400 dark:text-gray-500" />
                                <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">Discussion</h2>
                            </div>

                            <div className="bg-white dark:bg-[#1a1d2e] rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden flex flex-col h-[460px] shadow-sm transition-colors duration-300">
                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                    <p className="text-center mt-40 text-gray-500 dark:text-gray-400">Coming Soon...</p>
                                    {chatMessages.map((msg) => (
                                        <div key={msg.id}>
                                            {msg.date && (
                                                <div className="text-center mb-5">
                                                    <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 px-3 py-1 bg-gray-50 dark:bg-white/5 rounded-full border border-gray-100 dark:border-white/5 uppercase tracking-wide transition-colors duration-300">
                                                        {msg.date}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-start gap-3 group">
                                                <div className={`w-8 h-8 rounded-lg ${msg.color} flex-shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                                                    {msg.initial}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-baseline gap-2 mb-0.5">
                                                        <span className="font-bold text-gray-800 dark:text-white text-sm transition-colors duration-300">{msg.author}</span>
                                                        <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium transition-colors duration-300">{msg.time}</span>
                                                    </div>
                                                    <div className="bg-gray-50 dark:bg-white/5 rounded-xl rounded-tl-sm px-3.5 py-2.5 border border-gray-100 dark:border-white/5 transition-colors duration-300">
                                                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed transition-colors duration-300">{msg.content}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Input Area */}
                                <div className="p-4 border-t border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-black/20 transition-colors duration-300">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={chatText}
                                            onChange={(e) => setChatText(e.target.value)}
                                            placeholder="Type a message..."
                                            className="w-full pl-4 pr-11 py-3 bg-white dark:bg-white/[0.05] rounded-xl text-gray-800 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-600 border border-gray-200 dark:border-white/[0.1] focus:outline-none focus:border-violet-400 dark:focus:border-violet-500/40 focus:ring-2 focus:ring-violet-50 dark:focus:ring-violet-500/10 transition-all duration-200"
                                        />
                                        <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-violet-50 dark:hover:bg-white/10 transition-colors text-gray-400 dark:text-gray-500 hover:text-violet-600 dark:hover:text-violet-400">
                                            <Send size={15} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.section>
                    </div>
                </div>
            </main>

            {isCameraOpen && (
                <CameraCapture
                    onCapture={handleCapture}
                    onClose={handleStopAttendance}
                    mode={user?.role === 'teacher' ? 'attendance' : 'single'}
                    classroomId={id}
                    sessionId={activeSessionId || undefined}
                    onFaceRecognized={handleFaceRecognized}
                />
            )}

            {/* Announcement Delete Confirmation Modal */}
            <AnimatePresence>
                {announcementToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-[#1a1d2e] rounded-2xl p-6 w-full max-w-sm shadow-xl border border-gray-100 dark:border-white/10"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Announcement?</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                                    Are you sure you want to delete this announcement? This action cannot be undone.
                                </p>
                                <div className="flex gap-3 w-full">
                                    <button
                                        onClick={() => setAnnouncementToDelete(null)}
                                        disabled={isDeletingAnnouncement}
                                        className="flex-1 py-2.5 px-4 rounded-xl font-medium text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDeleteAnnouncement}
                                        disabled={isDeletingAnnouncement}
                                        className="flex-1 py-2.5 px-4 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 flex justify-center items-center"
                                    >
                                        {isDeletingAnnouncement ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            'Delete'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast Notification */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 20, x: '-50%' }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-full shadow-lg flex items-center gap-3 z-50"
                    >
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white">
                            <CheckCircle size={12} strokeWidth={3} />
                        </div>
                        <span className="font-medium text-sm">{toastMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default ClassroomPage;
