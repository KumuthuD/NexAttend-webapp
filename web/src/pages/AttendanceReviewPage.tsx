import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    getFlaggedRecords,
    updateFlaggedRecord,
    FlaggedRecord,
    getClassroom,
} from '../services/api';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { FlagIcon } from '../components/icons';
import {
    Menu,
    LogOut,
    Search,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    RefreshCw,
    ShieldAlert,
    UserCheck,
    Filter,
    ArrowLeft,
} from 'lucide-react';

// ── Mock data (fallback when backend is unavailable) ──────────────────────────
const MOCK_FLAGGED: FlaggedRecord[] = [
    {
        id: 'f1',
        student_name: 'Kavindu Perera',
        student_id: 's101',
        classroom_name: 'This Classroom',
        session_date: '2026-03-03',
        confidence: 42,
        status: 'pending',
        flagged_reason: 'Low confidence match — face partially obscured',
    },
    {
        id: 'f2',
        student_name: 'Nethmi Silva',
        student_id: 's102',
        classroom_name: 'This Classroom',
        session_date: '2026-03-03',
        confidence: 85,
        status: 'approved',
        flagged_reason: 'Clear match',
    },
    {
        id: 'f3',
        student_name: 'Dineth Jayawardena',
        student_id: 's103',
        classroom_name: 'This Classroom',
        session_date: '2026-03-02',
        confidence: 0,
        status: 'rejected',
        flagged_reason: 'Student joined classroom but no face detected in session',
    },
    {
        id: 'f4',
        student_name: 'Amaya Fernando',
        student_id: 's104',
        classroom_name: 'This Classroom',
        session_date: '2026-03-02',
        confidence: 29,
        status: 'approved',
        flagged_reason: 'Face angle too extreme for reliable match',
    },
    {
        id: 'f5',
        student_name: 'Tharindu Bandara',
        student_id: 's105',
        classroom_name: 'This Classroom',
        session_date: '2026-03-01',
        confidence: 92,
        status: 'approved',
        flagged_reason: 'Clear match',
    },
    {
        id: 'f6',
        student_name: 'Isuru Wickramasinghe',
        student_id: 's106',
        classroom_name: 'This Classroom',
        session_date: '2026-03-01',
        confidence: 0,
        status: 'rejected',
        flagged_reason: 'Student joined classroom but no face detected in session',
    },
    {
        id: 'f7',
        student_name: 'Hiruni Dissanayake',
        student_id: 's107',
        classroom_name: 'This Classroom',
        session_date: '2026-02-28',
        confidence: 48,
        status: 'pending',
        flagged_reason: 'New face — no prior embeddings found',
    },
];

// ── Status filter options ─────────────────────────────────────────────────────
const STATUS_FILTERS = ['All', 'Pending', 'Absent'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

// ── Helpers ───────────────────────────────────────────────────────────────────
const getStatusBadge = (confidence: number) => {
    if (confidence >= 60) {
        return {
            label: 'Present',
            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
            text: 'text-emerald-700 dark:text-emerald-400',
            icon: <CheckCircle className="w-3.5 h-3.5" />
        };
    } else if (confidence > 0) {
        return {
            label: 'Pending',
            bg: 'bg-amber-50 dark:bg-amber-500/10',
            text: 'text-amber-700 dark:text-amber-400',
            icon: <Clock className="w-3.5 h-3.5" />
        };
    } else {
        return {
            label: 'Absent',
            bg: 'bg-red-50 dark:bg-red-500/10',
            text: 'text-red-700 dark:text-red-400',
            icon: <XCircle className="w-3.5 h-3.5" />
        };
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════════
const ManualReviewPage: React.FC = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const { classroomId } = useParams<{ classroomId: string }>();

    const [records, setRecords] = useState<FlaggedRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<StatusFilter>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [classroomName, setClassroomName] = useState('');

    // Teacher-only guard — redirect students to dashboard
    useEffect(() => {
        if (user && user.role !== 'teacher') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    // Fetch classroom name
    useEffect(() => {
        const fetchClassroomName = async () => {
            if (!classroomId) return;
            try {
                const cls = await getClassroom(classroomId);
                setClassroomName(cls.name);
            } catch {
                setClassroomName('Classroom');
            }
        };
        fetchClassroomName();
    }, [classroomId]);

    // Toast state
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    // ── Fetch records ─────────────────────────────────────────────────────────
    const fetchRecords = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getFlaggedRecords();
            setRecords(data);
        } catch {
            // Backend not ready — use mock data
            setRecords(MOCK_FLAGGED);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    const handleLogout = () => {
        logout();
        navigate('/get-started');
    };

    const handleApprove = async (recordId: string) => {
        try {
            // Update the local state for immediate feedback
            setRecords((prev) =>
                prev.map((r) =>
                    r.id === recordId ? { ...r, confidence: 100 } : r
                )
            );
            showToast('Student marked as present', 'success');
            // If backend becomes available, uncomment the call below
            // await updateFlaggedRecord(recordId, 'approve'); 
        } catch (error) {
            showToast('Failed to approve record', 'error');
        }
    };

    // ── Filtering ─────────────────────────────────────────────────────────────
    const filteredRecords = records.filter((r) => {
        let recordStatus = 'Pending';
        if (r.confidence >= 60) recordStatus = 'Present';
        else if (r.confidence === 0) recordStatus = 'Absent';

        const matchesFilter =
            activeFilter === 'All' ||
            (activeFilter === 'Pending' && recordStatus === 'Pending') ||
            (activeFilter === 'Absent' && recordStatus === 'Absent');

        const matchesSearch =
            searchQuery === '' ||
            r.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.classroom_name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // ── Stats ─────────────────────────────────────────────────────────────────
    const totalFlagged = records.length;
    const pendingCount = records.filter((r) => r.status === 'pending').length;
    const reviewedCount = records.filter((r) => r.status !== 'pending').length;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="flex min-h-screen bg-[#f8f9fc] dark:bg-[#0f1117] transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Mobile top bar */}
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

            <main
                className={`flex-1 lg:ml-64 p-4 mt-5 relative transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'blur-sm lg:blur-none' : ''}`}
            >

                {/* ── Top Header ─────────────────────────────────────────────── */}
                <div className="flex justify-between items-center mb-4 relative z-10 w-full">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(`/dashboard/classroom/${classroomId}`)}
                            className="flex items-center justify-center p-2.5 -ml-2 text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 transition-colors duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-white/5"
                        >
                            <ArrowLeft size={22} />
                        </button>

                        <div className="flex flex-col">
                            <motion.h1
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                                className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300"
                            >
                                Attendance Review
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300"
                            >
                                {classroomName ? `` : 'Review and resolve flagged attendance records.'}
                            </motion.p>
                        </div>
                    </div>

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

                {/* Divider */}
                <div className="w-full h-1 bg-violet-500 dark:bg-white/[0.1] rounded-full mb-8 transition-colors duration-300" />

                {/* ── Summary Strip ────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10"
                >
                    {[
                        {
                            label: 'Total Students',
                            value: totalFlagged,
                            icon: <UserCheck className="w-5 h-5" />,
                            color: 'text-violet-600 dark:text-violet-400',
                            bg: 'bg-violet-50 dark:bg-violet-500/10',
                        },
                        {
                            label: 'Present',
                            value: records.filter((r) => r.confidence >= 60).length,
                            icon: <CheckCircle className="w-5 h-5" />,
                            color: 'text-emerald-600 dark:text-emerald-400',
                            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
                        },
                        {
                            label: 'Pending Review',
                            value: records.filter((r) => r.confidence > 0 && r.confidence < 60).length,
                            icon: <Clock className="w-5 h-5" />,
                            color: 'text-amber-600 dark:text-amber-400',
                            bg: 'bg-amber-50 dark:bg-amber-500/10',
                        },
                        {
                            label: 'Absent',
                            value: records.filter((r) => r.confidence === 0).length,
                            icon: <XCircle className="w-5 h-5" />,
                            color: 'text-red-600 dark:text-red-400',
                            bg: 'bg-red-50 dark:bg-red-500/10',
                        },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-white dark:bg-[#1a1d2e] rounded-2xl px-5 py-4 border border-gray-100 dark:border-white/[0.06] shadow-sm flex items-center gap-4 transition-colors duration-300"
                        >
                            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                <span className={stat.color}>{stat.icon}</span>
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* ── Filter Bar ───────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 relative z-10"
                >
                    {/* Status pills */}
                    <div className="flex items-center gap-1.5 bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl border border-white/20 dark:border-white/[0.05] shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-xl p-1">
                        {STATUS_FILTERS.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`text-sm font-bold px-4 py-1.5 rounded-lg transition-all duration-300 relative z-10 ${activeFilter === filter
                                    ? 'text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                                    }`}
                            >
                                {activeFilter === filter && (
                                    <motion.div
                                        layoutId="activeReviewFilter"
                                        className="absolute inset-0 bg-violet-500 rounded-lg -z-10"
                                        initial={false}
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                                {filter}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search"
                            className="w-full pl-9 pr-4 py-2 text-sm bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl border border-white/20 dark:border-white/[0.05] rounded-xl text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-300"
                        />
                    </div>

                    {/* Refresh */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={fetchRecords}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 rounded-xl bg-white dark:bg-white/5 transition-all duration-200 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </motion.button>
                </motion.div>

                {/* ── Records ──────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="relative z-10"
                >
                    {isLoading ? (
                        /* Skeleton loader */
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-white dark:bg-[#1a1d2e] rounded-2xl p-5 border border-gray-100 dark:border-white/[0.06] animate-pulse"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                                            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                                        </div>
                                        <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-lg w-20" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        /* Empty state */
                        <div className="text-center py-20">
                            <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-amber-500 dark:text-amber-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                {activeFilter === 'All' && searchQuery === ''
                                    ? 'No Records Detected'
                                    : 'No Matching Records'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                {activeFilter === 'All' && searchQuery === ''
                                    ? 'There are currently no detected attendance records.'
                                    : 'Try adjusting your filters or search query.'}
                            </p>
                        </div>
                    ) : (
                        /* Records list */
                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {filteredRecords.map((record, index) => (
                                    <motion.div
                                        key={record.id}
                                        layout
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3, delay: index * 0.03 }}
                                        className="bg-white dark:bg-[#1a1d2e] rounded-2xl p-5 border border-gray-100 dark:border-white/[0.06] shadow-sm hover:shadow-md transition-all duration-300 group"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                            {/* Avatar + Student info */}
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <img
                                                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(record.student_name)}&backgroundColor=8b5cf6&textColor=ffffff`}
                                                    alt={record.student_name}
                                                    className="w-10 h-10 rounded-full border-2 border-violet-200 dark:border-violet-500/30 flex-shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                        {record.student_name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        Marked at: {new Date(record.session_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Confidence */}
                                            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                                                {(() => {
                                                    const badge = getStatusBadge(record.confidence);
                                                    return (
                                                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${badge.bg}`}>
                                                            <span className={badge.text}>{badge.icon}</span>
                                                            <span className={`text-sm font-bold ${badge.text}`}>
                                                                {badge.label}
                                                            </span>
                                                        </div>
                                                    );
                                                })()}

                                                {/* Approve Button */}
                                                {record.confidence < 60 && (
                                                    <button
                                                        onClick={() => handleApprove(record.id)}
                                                        className="px-3 py-1.5 text-sm font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30 rounded-xl transition-colors border border-emerald-200 dark:border-emerald-500/20 shadow-sm"
                                                    >
                                                        Mark present
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>

                {/* ── Toast Notification ────────────────────────────────────── */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, x: '-50%' }}
                            exit={{ opacity: 0, y: 20, x: '-50%' }}
                            className={`fixed bottom-6 left-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium border backdrop-blur-xl ${toast.type === 'success'
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                                : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                {toast.type === 'success' ? (
                                    <CheckCircle className="w-4 h-4" />
                                ) : (
                                    <XCircle className="w-4 h-4" />
                                )}
                                {toast.message}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default ManualReviewPage;
