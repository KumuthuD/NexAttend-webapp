import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    getDashboardAnalytics,
    getAnalyticsSummary,
    AnalyticsOverview,
    AnalyticsSummaryResponse,
} from '../services/api';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/dashboard/StatsCard';
import AttendanceBarChart from '../components/charts/AttendanceBarChart';
import AttendanceTrendChart from '../components/charts/AttendanceTrendChart';
import AnalyticsSummaryCard from '../components/analytics/AnalyticsSummaryCard';
import PresentAbsentPieChart from '../components/dashboard/PresentAbsentPieChart';
import StudentRankingList from '../components/analytics/StudentRankingList';
import ThemeToggle from '../components/ThemeToggle';
import {
    TrendingUp,
    TrendingDown,
    Activity,
    CalendarDays,
    Menu,
    LogOut,
} from 'lucide-react';

// Filter options
const DATE_FILTERS = ['Week', 'Month', 'Semester'] as const;
type DateFilter = (typeof DATE_FILTERS)[number];

const AnalyticsPage: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<DateFilter>('Week');
    const [analyticsData, setAnalyticsData] = useState<AnalyticsOverview | null>(null);
    const [summaryData, setSummaryData] = useState<AnalyticsSummaryResponse | null>(null);

    // Mock classroom options for the selector
    const classroomOptions = ['All Classrooms', 'Algorithms', 'Advance Client Side', 'Database'];
    const [selectedClassroom, setSelectedClassroom] = useState('All Classrooms');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [overview, summary] = await Promise.all([
                    getDashboardAnalytics(),
                    getAnalyticsSummary(
                        selectedClassroom !== 'All Classrooms'
                            ? { classroom_id: selectedClassroom }
                            : undefined
                    ),
                ]);
                setAnalyticsData(overview);
                setSummaryData(summary);
            } catch (error) {
                console.error('Failed to fetch analytics data', error);
            }
        };
        fetchData();
    }, [selectedClassroom]);

    // Transform weekly_trend into chart-friendly shapes
    const barChartData = (analyticsData?.weekly_trend || []).map((day) => {
        const d = new Date(day.date);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        return { name: dayName, attendance: Math.round(day.attendance_percentage) };
    });

    const trendChartData = (analyticsData?.weekly_trend || []).map((day) => {
        const d = new Date(day.date);
        const label = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
        return { label, attendance: Math.round(day.attendance_percentage) };
    });

    // Derive present/absent for pie chart from summary
    const totalStudents = summaryData?.total_students || 0;
    const attendanceRate = summaryData?.overall_attendance_rate || 0;
    const estimatedPresent = Math.round((attendanceRate / 100) * totalStudents);
    const estimatedAbsent = Math.max(0, totalStudents - estimatedPresent);

    const handleLogout = () => {
        logout();
        navigate('/get-started');
    };

    return (
        <div className="flex min-h-screen bg-white dark:bg-[#0f1117] transition-colors duration-300">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 p-4 md:p-7 relative min-h-screen overflow-hidden">
                {/* Mobile Header */}
                <div className="relative z-20 lg:hidden flex items-center justify-between mb-6 bg-white dark:bg-[#0f1117]/70 backdrop-blur-xl p-4 -mx-4 -mt-4 border-b border-gray-100 dark:border-white/[0.06] sticky top-0 transition-colors duration-300">
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
                    className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-3"
                >
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">
                            Analytics
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
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
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8 relative z-10"
                >
                    {/* Classroom selector */}
                    <div className="relative group">
                        <select
                            value={selectedClassroom}
                            onChange={(e) => setSelectedClassroom(e.target.value)}
                            className="text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl border border-white/20 dark:border-white/[0.05] shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-300 cursor-pointer appearance-none pr-10 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
                        >
                            {classroomOptions.map((opt) => (
                                <option key={opt} value={opt} className="bg-white dark:bg-[#1a1d2e] text-gray-900 dark:text-white font-medium">{opt}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-violet-500 transition-colors">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                    </div>

                    {/* Date range pills */}
                    <div className="flex items-center gap-1.5 bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl border border-white/20 dark:border-white/[0.05] shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-xl p-1 relative">
                        {DATE_FILTERS.map((filter) => (
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
                                        layoutId="activeFilterBgAnalytics"
                                        className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-lg -z-10 shadow-[0_2px_8px_rgba(139,92,246,0.3)]"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                {filter}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
                    <StatsCard
                        title="Overall Attendance Rate"
                        value={`${summaryData?.overall_attendance_rate ?? 0}%`}
                        icon={<Activity className="w-5 h-5" />}
                        trend={{ value: 3.2, label: `vs last ${activeFilter.toLowerCase()}` }}
                        color="text-violet-600 dark:text-violet-400"
                        bg="bg-violet-50 dark:bg-violet-500/10"
                        delay={0.15}
                    />
                    <StatsCard
                        title="Total Sessions"
                        value={summaryData?.total_sessions_completed ?? 0}
                        icon={<CalendarDays className="w-5 h-5" />}
                        trend={{ value: 8, label: `vs last ${activeFilter.toLowerCase()}` }}
                        color="text-blue-600 dark:text-blue-400"
                        bg="bg-blue-50 dark:bg-blue-500/10"
                        delay={0.2}
                    />
                    <StatsCard
                        title="Most Attended Class"
                        value={summaryData?.most_attended_class ?? '—'}
                        icon={<TrendingUp className="w-5 h-5" />}
                        color="text-emerald-600 dark:text-emerald-400"
                        bg="bg-emerald-50 dark:bg-emerald-500/10"
                        delay={0.25}
                    />
                    <StatsCard
                        title="Lowest Attendance"
                        value={summaryData?.lowest_attendance_class ?? '—'}
                        icon={<TrendingDown className="w-5 h-5" />}
                        color="text-orange-600 dark:text-orange-400"
                        bg="bg-orange-50 dark:bg-orange-500/10"
                        delay={0.3}
                    />
                </div>

                {/* Chart Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

                    {/* Attendance Bar Chart — controlled by page filter bar */}
                    <AnalyticsSummaryCard
                        title="Attendance Overview"
                        delay={0.35}
                    >
                        <AttendanceBarChart
                            period={activeFilter}
                            classroom={selectedClassroom}
                            data={barChartData.length > 0 ? barChartData : undefined}
                        />
                    </AnalyticsSummaryCard>

                    {/* Attendance Trend Line Chart — Daily / Weekly toggle */}
                    <AnalyticsSummaryCard
                        title="Attendance Over Time"
                        delay={0.4}
                    >
                        <AttendanceTrendChart
                            classroom={selectedClassroom}
                            data={trendChartData.length > 0 ? trendChartData : undefined}
                        />
                    </AnalyticsSummaryCard>

                    {/* Attendance Breakdown (Pie Chart) */}
                    <AnalyticsSummaryCard
                        title="Attendance Breakdown"
                        subtitle="Based on today's classes"
                        delay={0.45}
                        className="h-full"
                    >
                        <PresentAbsentPieChart
                            presentCount={totalStudents > 0 ? estimatedPresent : undefined}
                            absentCount={totalStudents > 0 ? estimatedAbsent : undefined}
                            className="h-full transition-colors duration-300"
                        />
                    </AnalyticsSummaryCard>

                    {/* Student Rankings */}
                    <div className="h-full">
                        <StudentRankingList className="h-full" />
                    </div>

                </div>
            </main>
        </div>
    );
};

export default AnalyticsPage;
