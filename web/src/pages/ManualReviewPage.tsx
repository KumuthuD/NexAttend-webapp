import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    getFlaggedRecords,
    updateFlaggedRecord,
    FlaggedRecord,
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
} from 'lucide-react';

// ── Mock data (fallback when backend is unavailable) ──────────────────────────
const MOCK_FLAGGED: FlaggedRecord[] = [
    {
        id: 'f1',
        student_name: 'Kavindu Perera',
        student_id: 's101',
        classroom_name: 'Algorithms',
        session_date: '2026-03-03',
        confidence: 42,
        status: 'pending',
        flagged_reason: 'Low confidence match — face partially obscured',
    },
    {
        id: 'f2',
        student_name: 'Nethmi Silva',
        student_id: 's102',
        classroom_name: 'Database Systems',
        session_date: '2026-03-03',
        confidence: 38,
        status: 'pending',
        flagged_reason: 'Poor lighting conditions during capture',
    },
    {
        id: 'f3',
        student_name: 'Dineth Jayawardena',
        student_id: 's103',
        classroom_name: 'Advance Client Side',
        session_date: '2026-03-02',
        confidence: 51,
        status: 'pending',
        flagged_reason: 'Multiple face matches — ambiguous identity',
    },
    {
        id: 'f4',
        student_name: 'Amaya Fernando',
        student_id: 's104',
        classroom_name: 'Algorithms',
        session_date: '2026-03-02',
        confidence: 29,
        status: 'approved',
        flagged_reason: 'Face angle too extreme for reliable match',
    },
    {
        id: 'f5',
        student_name: 'Tharindu Bandara',
        student_id: 's105',
        classroom_name: 'Database Systems',
        session_date: '2026-03-01',
        confidence: 45,
        status: 'rejected',
        flagged_reason: 'Blurred image — motion detected',
    },
    {
        id: 'f6',
        student_name: 'Isuru Wickramasinghe',
        student_id: 's106',
        classroom_name: 'Advance Client Side',
        session_date: '2026-03-01',
        confidence: 35,
        status: 'pending',
        flagged_reason: 'Wearing glasses — altered facial features',
    },
    {
        id: 'f7',
        student_name: 'Hiruni Dissanayake',
        student_id: 's107',
        classroom_name: 'Algorithms',
        session_date: '2026-02-28',
        confidence: 48,
        status: 'pending',
        flagged_reason: 'New face — no prior embeddings found',
    },
    {
        id: 'f8',
        student_name: 'Sasanka Gunasekara',
        student_id: 's108',
        classroom_name: 'Database Systems',
        session_date: '2026-02-28',
        confidence: 33,
        status: 'rejected',
        flagged_reason: 'Background interference — crowded frame',
    },
];

// ── Status filter options ─────────────────────────────────────────────────────
const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Rejected'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

// ── Helpers ───────────────────────────────────────────────────────────────────
const confidenceColor = (c: number) => {
    if (c >= 60) return 'text-emerald-600 dark:text-emerald-400';
    if (c >= 40) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
};

const confidenceBg = (c: number) => {
    if (c >= 60) return 'bg-emerald-50 dark:bg-emerald-500/10';
    if (c >= 40) return 'bg-amber-50 dark:bg-amber-500/10';
    return 'bg-red-50 dark:bg-red-500/10';
};

const statusBadge = (status: FlaggedRecord['status']) => {
    switch (status) {
        case 'approved':
            return (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                    <CheckCircle className="w-3 h-3" /> Approved
                </span>
            );
        case 'rejected':
            return (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                    <XCircle className="w-3 h-3" /> Rejected
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                    <Clock className="w-3 h-3" /> Pending
                </span>
            );
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════════
const ManualReviewPage: React.FC = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const [records, setRecords] = useState<FlaggedRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<StatusFilter>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Teacher-only guard — redirect students to dashboard
    useEffect(() => {
        if (user && user.role !== 'teacher') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

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

    // ── Handle approve / reject ───────────────────────────────────────────────
    const handleAction = async (recordId: string, action: 'approve' | 'reject') => {
        setActionLoading(recordId);
        try {
            await updateFlaggedRecord(recordId, action);
            setRecords((prev) =>
                prev.map((r) =>
                    r.id === recordId
                        ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' }
                        : r
                )
            );
            showToast(
                `Record ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
                'success'
            );
        } catch {
            // Offline fallback — update locally anyway
            setRecords((prev) =>
                prev.map((r) =>
                    r.id === recordId
                        ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' }
                        : r
                )
            );
            showToast(
                `Record ${action === 'approve' ? 'approved' : 'rejected'} (offline)`,
                'success'
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/get-started');
    };

    // ── Filtering ─────────────────────────────────────────────────────────────
    const filteredRecords = records.filter((r) => {
        const matchesFilter =
            activeFilter === 'All' || r.status === activeFilter.toLowerCase();
        const matchesSearch =
            searchQuery === '' ||
            r.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.classroom_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.flagged_reason.toLowerCase().includes(searchQuery.toLowerCase());
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
                className={`flex-1 lg:ml-64 p-4 md:p-10 relative transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'blur-sm lg:blur-none' : ''}`}
            >
                {/* Ambient backgrounds */}
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-500/20 dark:via-orange-500/10 dark:to-transparent pointer-events-none rounded-t-3xl blur-3xl opacity-70 z-0" />
                <div className="absolute top-40 right-0 w-96 h-96 bg-gradient-to-bl from-red-500/10 via-rose-500/5 to-transparent dark:from-red-500/20 dark:via-rose-500/5 dark:to-transparent pointer-events-none blur-3xl opacity-60 z-0" />

                <div className="lg:hidden h-16" />

                {/* ── Page Header ──────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 flex justify-between items-center mb-3"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                            <FlagIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                                Manual Review
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                Review and resolve flagged attendance records.
                            </p>
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
                </motion.div>

                {/* Divider */}
                <div className="w-full h-1 bg-amber-500 dark:bg-white/[0.1] rounded-full mb-8 transition-colors duration-300" />

                {/* ── Summary Strip ────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 relative z-10"
                >
                    {[
                        {
                            label: 'Total Flagged',
                            value: totalFlagged,
                            icon: <ShieldAlert className="w-5 h-5" />,
                            color: 'text-amber-600 dark:text-amber-400',
                            bg: 'bg-amber-50 dark:bg-amber-500/10',
                        },
                        {
                            label: 'Pending Review',
                            value: pendingCount,
                            icon: <Clock className="w-5 h-5" />,
                            color: 'text-orange-600 dark:text-orange-400',
                            bg: 'bg-orange-50 dark:bg-orange-500/10',
                        },
                        {
                            label: 'Reviewed',
                            value: reviewedCount,
                            icon: <UserCheck className="w-5 h-5" />,
                            color: 'text-emerald-600 dark:text-emerald-400',
                            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
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
                                        className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg -z-10 shadow-[0_2px_8px_rgba(245,158,11,0.3)]"
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
                            placeholder="Search by name, class, reason…"
                            className="w-full pl-9 pr-4 py-2 text-sm bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl border border-white/20 dark:border-white/[0.05] rounded-xl text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all duration-300"
                        />
                    </div>

                    {/* Refresh */}
                    <button
                        onClick={fetchRecords}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 rounded-xl bg-white dark:bg-white/5 transition-all duration-200 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
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
                                    ? 'No Flagged Records'
                                    : 'No Matching Records'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                {activeFilter === 'All' && searchQuery === ''
                                    ? 'All attendance records have been verified by the AI system. Great job!'
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
                                                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(record.student_name)}&backgroundColor=f59e0b&textColor=ffffff`}
                                                    alt={record.student_name}
                                                    className="w-10 h-10 rounded-full border-2 border-amber-200 dark:border-amber-500/30 flex-shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                        {record.student_name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {record.classroom_name} · {new Date(record.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Confidence */}
                                            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${confidenceBg(record.confidence)}`}>
                                                    <AlertTriangle className={`w-3.5 h-3.5 ${confidenceColor(record.confidence)}`} />
                                                    <span className={`text-sm font-bold ${confidenceColor(record.confidence)}`}>
                                                        {record.confidence}%
                                                    </span>
                                                </div>

                                                {/* Status badge */}
                                                {statusBadge(record.status)}

                                                {/* Action buttons (only for pending) */}
                                                {record.status === 'pending' && (
                                                    <div className="flex items-center gap-2 ml-auto sm:ml-0">
                                                        <button
                                                            onClick={() => handleAction(record.id, 'approve')}
                                                            disabled={actionLoading === record.id}
                                                            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20 rounded-xl transition-all duration-200 disabled:opacity-50"
                                                        >
                                                            <CheckCircle className="w-3.5 h-3.5" />
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(record.id, 'reject')}
                                                            disabled={actionLoading === record.id}
                                                            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 rounded-xl transition-all duration-200 disabled:opacity-50"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" />
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Reason row */}
                                        <div className="mt-3 flex items-start gap-2 pl-[52px]">
                                            <Filter className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                                {record.flagged_reason}
                                            </p>
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
