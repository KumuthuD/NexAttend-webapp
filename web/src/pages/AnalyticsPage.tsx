import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardStats, DashboardStats } from '../services/api';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/dashboard/StatsCard';
import AttendanceBarChart from '../components/charts/AttendanceBarChart';
import AnalyticsSummaryCard from '../components/analytics/AnalyticsSummaryCard';
import ThemeToggle from '../components/ThemeToggle';
import {
    Users,
    BookOpen,
    TrendingUp,
    TrendingDown,
    Activity,
    CalendarDays,
    BarChart2,
    Menu,
    LogOut,
} from 'lucide-react';

// Filter options
const DATE_FILTERS = ['Week', 'Month', 'Semester'] as const;
type DateFilter = (typeof DATE_FILTERS)[number];

const AnalyticsPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<DateFilter>('Week');
    const [stats, setStats] = useState<DashboardStats | null>(null);

    // Mock classroom options for the selector
    const classroomOptions = ['All Classrooms', 'Algorithms', 'Advance Client Side', 'Database'];
    const [selectedClassroom, setSelectedClassroom] = useState('All Classrooms');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch analytics stats', error);
            }
        };
        fetchStats();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/get-started');
    };

    return (
        <div className="flex min-h-screen bg-[#f8f9fc] dark:bg-[#0f1117] transition-colors duration-300">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 p-4 md:p-7 relative min-h-screen">

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

                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-3"
                >
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">
                            Analytics 
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Track attendance trends and class performance.
                        </p>
                    </div>

                    {/* Desktop controls */}
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

                {/* Violet divider */}
                <div className="w-full h-1 bg-violet-500 dark:bg-white/[0.1] rounded-full mb-8 transition-colors duration-300" />

                {/* Filter Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8"
                >
                    {/* Classroom selector */}
                    <select
                        value={selectedClassroom}
                        onChange={(e) => setSelectedClassroom(e.target.value)}
                        className="text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-[#1a1d2e] border border-gray-200 dark:border-white/[0.08] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors duration-200 cursor-pointer"
                    >
                        {classroomOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>

                    {/* Date range pills */}
                    <div className="flex items-center gap-1.5 bg-white dark:bg-[#1a1d2e] border border-gray-100 dark:border-white/[0.06] rounded-xl p-1">
                        {DATE_FILTERS.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`text-sm font-medium px-4 py-1.5 rounded-lg transition-all duration-200 ${
                                    activeFilter === filter
                                        ? 'bg-violet-600 text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
                    <StatsCard
                        title="Overall Attendance Rate"
                        value={`${stats?.attendance_percentage ?? 87}%`}
                        icon={<Activity className="w-5 h-5" />}
                        trend={{ value: 3.2, label: `vs last ${activeFilter.toLowerCase()}` }}
                        color="text-violet-600 dark:text-violet-400"
                        bg="bg-violet-50 dark:bg-violet-500/10"
                        delay={0.15}
                    />
                    <StatsCard
                        title="Total Sessions"
                        value={stats?.total_sessions ?? 24}
                        icon={<CalendarDays className="w-5 h-5" />}
                        trend={{ value: 8, label: `vs last ${activeFilter.toLowerCase()}` }}
                        color="text-blue-600 dark:text-blue-400"
                        bg="bg-blue-50 dark:bg-blue-500/10"
                        delay={0.2}
                    />
                    <StatsCard
                        title="Most Attended Class"
                        value="Algorithms"
                        icon={<TrendingUp className="w-5 h-5" />}
                        color="text-emerald-600 dark:text-emerald-400"
                        bg="bg-emerald-50 dark:bg-emerald-500/10"
                        delay={0.25}
                    />
                    <StatsCard
                        title="Lowest Attendance"
                        value="Database"
                        icon={<TrendingDown className="w-5 h-5" />}
                        color="text-orange-600 dark:text-orange-400"
                        bg="bg-orange-50 dark:bg-orange-500/10"
                        delay={0.3}
                    />
                </div>

                {/* Chart Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

                    {/* Weekly Attendance Bar Chart */}
                    <AnalyticsSummaryCard
                        title="Weekly Attendance Overview"
                        subtitle={`${selectedClassroom} · This ${activeFilter}`}
                        delay={0.35}
                    >
                        <AttendanceBarChart />
                    </AnalyticsSummaryCard>

                    {/* Placeholder — Trend Line Chart (Day 23) */}
                    <AnalyticsSummaryCard
                        title="Attendance Over Time"
                        subtitle="Line chart — coming in Day 23"
                        delay={0.4}
                    >
                        <div className="flex flex-col items-center justify-center h-[220px] gap-3">
                            <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-500/10">
                                <BarChart2 className="w-8 h-8 text-violet-500 dark:text-violet-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    More charts coming soon
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    Trend, pie &amp; ranking charts arrive in Day 22–23
                                </p>
                            </div>
                        </div>
                    </AnalyticsSummaryCard>

                    {/* Placeholder — Classroom Comparison (Day 22) */}
                    <AnalyticsSummaryCard
                        title="Classroom Comparison"
                        subtitle="Pie chart — coming in Day 22"
                        delay={0.45}
                    >
                        <div className="flex flex-col items-center justify-center h-[220px] gap-3">
                            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10">
                                <BookOpen className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    Present vs Absent
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    Pie chart will render here (Day 22)
                                </p>
                            </div>
                        </div>
                    </AnalyticsSummaryCard>

                    {/* Placeholder — Student Rankings (Day 23) */}
                    <AnalyticsSummaryCard
                        title="Student Rankings"
                        subtitle="Top performers — coming in Day 23"
                        delay={0.5}
                    >
                        <div className="flex flex-col items-center justify-center h-[220px] gap-3">
                            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                                <Users className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    Student Attendance Rankings
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    Ranking list will render here (Day 23)
                                </p>
                            </div>
                        </div>
                    </AnalyticsSummaryCard>

                </div>
            </main>
        </div>
    );
};

export default AnalyticsPage;
