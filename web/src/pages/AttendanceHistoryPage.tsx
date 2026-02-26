import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History, RefreshCw, Menu, LogOut } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AttendanceHistoryTable, { AttendanceRecord } from '../components/dashboard/AttendanceHistoryTable';
import { getAttendanceHistory } from '../services/api';

// ── Rich mock data (used as fallback when API is unavailable) ─────────────────
const MOCK_RECORDS: AttendanceRecord[] = [
    { id: '1', date: '2026-02-18', classroom_name: 'Algorithms', presentCount: 42, totalCount: 50 },
    { id: '2', date: '2026-02-18', classroom_name: 'Advance Client Side', presentCount: 38, totalCount: 45 },
    { id: '3', date: '2026-02-17', classroom_name: 'Database', presentCount: 48, totalCount: 55 },
    { id: '4', date: '2026-02-17', classroom_name: 'Algorithms', presentCount: 40, totalCount: 50 },
    { id: '5', date: '2026-02-14', classroom_name: 'Advance Client Side', presentCount: 41, totalCount: 45 },
    { id: '6', date: '2026-02-14', classroom_name: 'Database', presentCount: 52, totalCount: 55 },
    { id: '7', date: '2026-02-13', classroom_name: 'Algorithms', presentCount: 45, totalCount: 50 },
    { id: '8', date: '2026-02-12', classroom_name: 'Database', presentCount: 50, totalCount: 55 },
];

const AttendanceHistoryPage: React.FC = () => {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/get-started');
    };

    const fetchHistory = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getAttendanceHistory();
            setRecords(data);
        } catch {
            // Backend may not have this endpoint yet — fall back to mock data
            setRecords(MOCK_RECORDS);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

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
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-between items-center mb-8"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
                            <History className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                                Attendance History
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                View your past attendance records across all classrooms.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden lg:flex items-center gap-3 mr-4">
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

                        {/* Refresh button */}
                        <button
                            onClick={fetchHistory}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 rounded-xl bg-white dark:bg-white/5 transition-all duration-200 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </motion.div>

                {/* Divider */}
                <div className="w-full h-1 bg-violet-500 dark:bg-white/[0.1] rounded-full mb-8 transition-colors duration-300" />

                {/* Summary strip */}
                {!isLoading && records.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
                    >
                        {[
                            {
                                label: 'Total Sessions',
                                value: records.length,
                                color: 'text-violet-600 dark:text-violet-400',
                                bg: 'bg-violet-50 dark:bg-violet-500/10',
                            },
                            {
                                label: 'Present',
                                value: records.reduce((acc, r) => acc + r.presentCount, 0),
                                color: 'text-emerald-600 dark:text-emerald-400',
                                bg: 'bg-emerald-50 dark:bg-emerald-500/10',
                            },
                            {
                                label: 'Absent',
                                value: records.reduce((acc, r) => acc + (r.totalCount - r.presentCount), 0),
                                color: 'text-red-600 dark:text-red-400',
                                bg: 'bg-red-50 dark:bg-red-500/10',
                            },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="bg-white dark:bg-[#1a1d2e] rounded-2xl px-5 py-4 border border-gray-100 dark:border-white/[0.06] shadow-sm flex items-center gap-4"
                            >
                                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                    <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
                                </div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</span>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* Error banner */}
                {error && (
                    <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-700 dark:text-red-400">
                        {error}
                    </div>
                )}

                {/* History Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <AttendanceHistoryTable
                        records={records}
                        isLoading={isLoading}
                    />
                </motion.div>
            </main>
        </div>
    );
};

export default AttendanceHistoryPage;
