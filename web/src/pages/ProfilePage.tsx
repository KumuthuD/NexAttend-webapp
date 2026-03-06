import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Calendar,
    Award,
    Clock,
    BookOpen,
    Edit,
    Shield,
    Menu,
    LogOut,
    Hash
} from 'lucide-react';
import { motion } from 'framer-motion';

const ProfilePage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/get-started');
    };

    // Format joined date based on created_at or fallback
    const joinedDateStr = user?.created_at 
        ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : 'Unknown';

    return (
        <div className="flex min-h-screen bg-white dark:bg-[#0f1117] transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Mobile Top Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#0f1117] border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between px-4 z-30">
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

            <main className={`flex-1 lg:ml-64 p-4 md:p-7 relative transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'blur-sm lg:blur-none' : ''}`}>
                <div className="lg:hidden h-16" /> {/* Spacer for fixed mobile header */}

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-between items-center mb-3"
                >
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">
                            My Profile
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            View and manage your personal information
                        </p>
                    </div>

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
                </motion.div>

                {/* Divider */}
                <div className="w-full h-1 bg-violet-500 dark:bg-white/[0.1] rounded-full mb-8 transition-colors duration-300" />

                <div className="grid grid-cols-12 gap-8">
                    {/* Left Column: User Card & Stats */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="col-span-12 w-full max-w-3xl mx-auto space-y-8"
                    >
                        {/* Profile Card */}
                        <div className="bg-white dark:bg-[#1a1d2e] rounded-2xl p-8 border border-gray-100 dark:border-white/[0.06] shadow-xl shadow-gray-200/50 dark:shadow-none relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-10 dark:opacity-20 group-hover:scale-105 transition-transform duration-500"></div>

                            <div className="relative flex flex-col items-center text-center">
                                <div className="w-28 h-28 rounded-full p-1 bg-white dark:bg-[#1a1d2e] shadow-lg mb-4 mt-4">
                                    <img
                                        src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}&backgroundColor=e5e7eb&textColor=374151`}
                                        alt="Profile"
                                        className="w-full h-full rounded-full object-cover bg-gray-100 dark:bg-gray-800"
                                    />
                                </div>

                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                    {user?.name || 'User Name'}
                                </h2>
                                <p className="text-sm font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-3 py-1 rounded-full mb-3 capitalize">
                                    {user?.role || 'Student'}
                                </p>

                                {user?.student_id && (
                                    <div className="flex items-center gap-2 mb-6 px-4 py-2.5 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-500/10 dark:to-fuchsia-500/10 border border-violet-100 dark:border-violet-500/20 rounded-xl">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-sm">
                                            <Hash size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500">Student ID</span>
                                            <span className="text-base font-bold text-gray-900 dark:text-white tracking-wider font-mono">{user.student_id}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="w-full space-y-4 mb-8">
                                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400">
                                            <Mail size={16} />
                                        </div>
                                        <span className="flex-1 text-left truncate">{user?.email || 'user@example.com'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400">
                                            <Calendar size={16} />
                                        </div>
                                        <span className="flex-1 text-left">Joined {joinedDateStr}</span>
                                    </div>
                                    {user?.date_of_birth && (
                                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400">
                                                <Calendar size={16} />
                                            </div>
                                            <span className="flex-1 text-left truncate">Born {new Date(user.date_of_birth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                    )}
                                    {user?.gender && (
                                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400">
                                                <User size={16} />
                                            </div>
                                            <span className="flex-1 text-left truncate">{user.gender}</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => navigate('/settings')}
                                    className="w-full py-2.5 px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                >
                                    <Edit size={16} />
                                    Edit Profile
                                </button>
                            </div>
                        </div>

                        {/* Empty Space since Recent Activity is removed */}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
