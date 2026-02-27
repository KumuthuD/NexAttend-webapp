import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { Send, Megaphone, MessageCircle, ArrowLeft, Users, Clock, Hash, CheckCircle, History, RefreshCw, Smile, Activity, Menu, LogOut } from 'lucide-react';
import CameraCapture from '../components/common/WebcamCapture';
import AttendanceList from '../components/classroom/AttendanceList';
import AttendanceHistoryTable, { AttendanceRecord } from '../components/dashboard/AttendanceHistoryTable';
import { AnimatePresence, motion } from 'framer-motion';
import DatePicker from '../components/common/DatePicker';
import MotivationScoreDisplay from '../components/dashboard/MotivationScoreDisplay';
import { getStudentMotivationData } from '../services/api';

// Mock history records for this classroom (replace with API call when ready)
const MOCK_HISTORY: AttendanceRecord[] = [
    { id: '1', date: '2026-02-18', classroom_name: 'Advance Client Side Development', presentCount: 42, totalCount: 45 },
    { id: '2', date: '2026-02-17', classroom_name: 'Advance Client Side Development', presentCount: 38, totalCount: 45 },
    { id: '3', date: '2026-02-14', classroom_name: 'Advance Client Side Development', presentCount: 40, totalCount: 45 },
    { id: '4', date: '2026-02-13', classroom_name: 'Advance Client Side Development', presentCount: 41, totalCount: 45 },
    { id: '5', date: '2026-02-12', classroom_name: 'Advance Client Side Development', presentCount: 44, totalCount: 45 },
];

interface Student {
    id: string;
    name: string;
    time: string;
    status: 'present' | 'late';
    avatar?: string;
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

    // Motivation score state — fetched from backend per-classroom
    const [motivationScore, setMotivationScore] = useState(0);
    const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);

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

    // Filter history based on selected date
    const filteredHistory = selectedDate
        ? MOCK_HISTORY.filter(record => record.date === selectedDate)
        : MOCK_HISTORY;

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
                avatar: undefined // Backend might provide this later
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
        alert("Attendance marked successfully!");
    };

    // Mock Data
    const classroomName = "Advance Client Side Development";
    const accessCode = "ACS-2025";

    const chatMessages = [];

    return (
        <div className="flex min-h-screen bg-[#f8f9fc] dark:bg-[#0f1117] transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 lg:ml-64 p-4 md:p-9 relative">
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
                                    0 students
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock size={14} className="text-gray-400 dark:text-gray-500" />
                                    0 sessions
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
                                    onClick={() => setIsCameraOpen(true)}
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

                            <AttendanceHistoryTable records={filteredHistory} />
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

                            <div className="bg-white dark:bg-[#1a1d2e] rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden h-[260px] flex flex-col  shadow-sm transition-colors duration-300 mb-10">
                                {/* Empty state */}
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors duration-300">
                                            <Megaphone size={28} className="text-gray-300 dark:text-gray-600" />
                                        </div>
                                        <p className="text-gray-400 dark:text-gray-500 text-sm font-medium transition-colors duration-300">No announcements yet</p>
                                    </div>
                                </div>

                                {/* Input Area - Only for teachers */}
                                {user?.role === 'teacher' && (
                                    <div className="p-4 border-t border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-black/20 transition-colors duration-300">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={announcementText}
                                                onChange={(e) => setAnnouncementText(e.target.value)}
                                                placeholder="Post an announcement..."
                                                className="w-full pl-4 pr-11 py-3 bg-white dark:bg-white/[0.05] rounded-xl text-gray-800 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-600 border border-gray-200 dark:border-white/[0.1] focus:outline-none focus:border-violet-400 dark:focus:border-violet-500/40 focus:ring-2 focus:ring-violet-50 dark:focus:ring-violet-500/10 transition-all duration-200"
                                            />
                                            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-violet-50 dark:hover:bg-white/10 transition-colors text-gray-400 dark:text-gray-500 hover:text-violet-600 dark:hover:text-violet-400">
                                                <Send size={15} />
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
                    onClose={() => setIsCameraOpen(false)}
                    mode={user?.role === 'teacher' ? 'attendance' : 'single'}
                    classroomId={id}
                    onFaceRecognized={handleFaceRecognized}
                />
            )}

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
