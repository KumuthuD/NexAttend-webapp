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
    MapPin,
    Link as LinkIcon,
    Shield,
    Menu,
    LogOut
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

    // Mock Data
    const stats = [
        { label: 'Classes Joined', value: '12', icon: <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />, bg: 'bg-blue-100 dark:bg-blue-500/20' },
        { label: 'Attendance Rate', value: '95%', icon: <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />, bg: 'bg-green-100 dark:bg-green-500/20' },
        { label: 'Assignments', value: '4', icon: <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />, bg: 'bg-purple-100 dark:bg-purple-500/20' },
    ];

    const activities = [
        { id: 1, title: 'Joined "Advanced Algorithms"', time: '2 hours ago', icon: <BookOpen size={16} />, color: 'bg-blue-500' },
        { id: 2, title: 'Marked attendance in "Database Systems"', time: 'Yesterday', icon: <Clock size={16} />, color: 'bg-green-500' },
        { id: 3, title: 'Updated profile picture', time: '2 days ago', icon: <User size={16} />, color: 'bg-purple-500' },
        { id: 4, title: 'Password changed', time: '1 week ago', icon: <Shield size={16} />, color: 'bg-red-500' },
    ];

    return (
        <div className="flex min-h-screen bg-[#f8f9fc] dark:bg-[#0f1117] transition-colors duration-300">
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

            <main className={`flex-1 lg:ml-64 p-4 md:p-10 relative transition-all duration-300 ${isSidebarOpen ? 'blur-sm lg:blur-none' : ''}`}>
                <div className="lg:hidden h-16" /> {/* Spacer for fixed mobile header */}

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-between items-center mb-8"
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
                    </div>
                </motion.div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Left Column: User Card & Stats */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="col-span-12 lg:col-span-4 space-y-8"
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
                                <p className="text-sm font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-3 py-1 rounded-full mb-6 capitalize">
                                    {user?.role || 'Student'}
                                </p>

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
                                        <span className="flex-1 text-left">Joined Sept 2023</span>
                                    </div>
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

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 gap-4">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-white dark:bg-[#1a1d2e] p-5 rounded-2xl border border-gray-100 dark:border-white/[0.06] flex items-center gap-4 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-none transition-shadow duration-300">
                                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Column: Detailed Info & Activity */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="col-span-12 lg:col-span-8 space-y-8"
                    >


                        {/* Recent Activity */}
                        <div className="bg-white dark:bg-[#1a1d2e] rounded-2xl p-8 border border-gray-100 dark:border-white/[0.06]">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Clock size={20} className="text-violet-500" />
                                Recent Activity
                            </h3>

                            <div className="relative h-[600px] pl-4 space-y-8 before:absolute before:left-[27px] before:top-2 before:bottom-4 before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800">
                                {activities.map((activity) => (
                                    <div key={activity.id} className="relative flex items-start gap-4 group">
                                        <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full ${activity.color} flex items-center justify-center text-white shadow-lg ring-4 ring-white dark:ring-[#1a1d2e]`}>
                                            {activity.icon}
                                        </div>
                                        <div className="flex-1 pt-1.5">
                                            <h4 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-violet-500 transition-colors">
                                                {activity.title}
                                            </h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full mt-8 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition-colors">
                                View Full History
                            </button>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
