import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    getDashboardStats,
    DashboardStats,
    getClassrooms,
    createClassroom,
    deleteClassroom,
    leaveClassroom,
    joinClassroom,
    Classroom,
    ClassroomCreateData,
} from '../services/api';
import Sidebar from '../components/Sidebar';
import ClassroomCard from '../components/dashboard/ClassroomCard';
import AddClassroomCard from '../components/dashboard/AddClassroomCard';
import CreateClassroomModal from '../components/dashboard/CreateClassroomModal';
import DeleteClassroomModal from '../components/dashboard/DeleteClassroomModal';
import LeaveClassroomModal from '../components/dashboard/LeaveClassroomModal';
import StudentAttendanceOverview from '../components/dashboard/StudentAttendanceOverview';
import StatsCard from '../components/dashboard/StatsCard';
import ThemeToggle from '../components/ThemeToggle';
import {
    Smile, Database, Code, BookOpen, Cpu, Palette,
    Users, CheckCircle, Activity, Menu, LogOut, AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Icon options for classroom display (cycled by index)
const ICON_OPTIONS = [
    { icon: (color: string) => <Smile className={`${color} w-6 h-6`} />, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
    { icon: (color: string) => <Database className={`${color} w-6 h-6`} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { icon: (color: string) => <Code className={`${color} w-6 h-6`} />, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { icon: (color: string) => <BookOpen className={`${color} w-6 h-6`} />, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
    { icon: (color: string) => <Cpu className={`${color} w-6 h-6`} />, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-500/10' },
    { icon: (color: string) => <Palette className={`${color} w-6 h-6`} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
];

const getIconForIndex = (index: number) => {
    const option = ICON_OPTIONS[index % ICON_OPTIONS.length];
    return { icon: option.icon(option.color), iconBg: option.bg };
};

const DashboardPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [classroomToDelete, setClassroomToDelete] = useState<{ id: string; name: string } | null>(null);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [classroomToLeave, setClassroomToLeave] = useState<{ id: string; name: string } | null>(null);

    // Real classrooms from the API
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [classroomsLoading, setClassroomsLoading] = useState(true);
    const [classroomsError, setClassroomsError] = useState('');

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Toast notification
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const isTeacher = user?.role === 'teacher';

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    //   Load classrooms from API 
    const fetchClassrooms = useCallback(async () => {
        setClassroomsLoading(true);
        setClassroomsError('');
        try {
            const data = await getClassrooms();
            setClassrooms(data);
        } catch (err: any) {
            console.error('Failed to fetch classrooms', err);
            setClassroomsError('Failed to load classrooms. Please refresh.');
        } finally {
            setClassroomsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        // Fetch dashboard stats for teachers
        const fetchStats = async () => {
            if (user?.role === 'teacher') {
                try {
                    const data = await getDashboardStats();
                    setStats(data);
                } catch (error) {
                    console.error('Failed to fetch dashboard stats', error);
                }
            }
        };

        fetchClassrooms();
        fetchStats();
        return () => clearInterval(timer);
    }, [user?.role, fetchClassrooms]);

    const handleLogout = () => {
        logout();
        navigate('/get-started');
    };

    // ── Teacher: Create classroom ──────────────────────
    const handleCreateClassroom = async (data: ClassroomCreateData) => {
        const created = await createClassroom(data);
        // Prepend newly created classroom so it appears first
        setClassrooms(prev => [created, ...prev]);
        showToast(` "${created.name}" created! Access code: ${created.access_code}`);
    };

    // ── Student: Join classroom ──────────────────────
    const handleJoinClassroom = async (accessCode: string) => {
        const result = await joinClassroom(accessCode);
        // Re-fetch to get the full classroom data
        await fetchClassrooms();
        showToast(`  ${result.message}`);
    };

    // ── Student: Leave classroom ──────────────────────
    const handleLeaveClick = (classroomId: string, classroomName: string) => {
        setClassroomToLeave({ id: classroomId, name: classroomName });
        setIsLeaveModalOpen(true);
    };

    const handleConfirmLeave = async () => {
        if (!classroomToLeave) return;

        try {
            const result = await leaveClassroom(classroomToLeave.id);
            setClassrooms(prev => prev.filter(c => (c.id || (c as any)._id) !== classroomToLeave.id));
            showToast(result.message || `Successfully left "${classroomToLeave.name}".`);
        } catch (error: any) {
            console.error('Failed to leave classroom:', error);
            showToast(error?.response?.data?.detail || 'Failed to leave classroom.', 'error');
            throw error;
        }
    };

    // ── Teacher: Delete classroom ──────────────────────
    const handleDeleteClick = (classroomId: string, classroomName: string) => {
        setClassroomToDelete({ id: classroomId, name: classroomName });
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!classroomToDelete) return;

        try {
            await deleteClassroom(classroomToDelete.id);
            setClassrooms(prev => prev.filter(c => (c.id || (c as any)._id) !== classroomToDelete.id));
            showToast(`Classroom "${classroomToDelete.name}" deleted successfully.`);

            // Re-fetch stats as total classrooms/students might have changed
            if (user?.role === 'teacher') {
                const data = await getDashboardStats();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to delete classroom:', error);
            showToast('Failed to delete classroom.', 'error');
            throw error;
        }
    };

    // Format greeting based on time
    const hour = currentTime.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="flex min-h-screen bg-white dark:bg-[#0f1117] transition-colors duration-300">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 p-4 md:p-7 relative min-h-screen overflow-hidden">
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
                            {greeting}{user?.name ? `, ${user.name.split(' ')[0]}!` : '!'} 👋
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Here's what's happening with your classes today.
                        </p>
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
                <div className="w-full h-1 bg-violet-500 dark:bg-white/[0.1] rounded-full mb-8 transition-colors duration-300" />

                {/* Stats — Teachers only */}
                {isTeacher && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
                        <StatsCard
                            title="Total Students"
                            value={stats?.total_students || 0}
                            icon={<Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                            color="text-blue-600"
                            bg="bg-blue-50 dark:bg-blue-500/10"
                            delay={0.1}
                        />
                        <StatsCard
                            title="Total Classrooms"
                            value={classrooms.length}
                            icon={<BookOpen className="w-5 h-5 text-violet-600 dark:text-violet-400" />}
                            color="text-violet-600"
                            bg="bg-violet-50 dark:bg-violet-500/10"
                            delay={0.2}
                        />
                        <StatsCard
                            title="Today's Attendance"
                            value={stats?.todays_attendance_count || 0}
                            icon={<CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />}
                            color="text-green-600"
                            bg="bg-green-50 dark:bg-green-500/10"
                            delay={0.3}
                        />
                        <StatsCard
                            title="Attendance Rate"
                            value={`${stats?.attendance_percentage || 0}%`}
                            icon={<Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
                            color="text-orange-600"
                            bg="bg-orange-50 dark:bg-orange-500/10"
                            delay={0.4}
                        />
                    </div>
                )}

                {/* Student Attendance Overview */}
                {!isTeacher && (
                    <StudentAttendanceOverview
                        attendancePercentage={stats?.attendance_percentage || 0}
                        totalClasses={classrooms.length}
                        presentCount={stats?.todays_attendance_count || 0}
                        absentCount={0}
                    />
                )}

                {/* Section header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white transition-colors duration-300">
                        Your Classrooms
                    </h2>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-white/5 dark:text-gray-400 px-3 py-1 rounded-full transition-colors duration-300">
                        {classrooms.length} classrooms
                    </span>
                </div>

                {/* Error state */}
                {classroomsError && (
                    <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl px-4 py-3 mb-6 text-sm">
                        <AlertCircle size={16} />
                        {classroomsError}
                    </div>
                )}

                {/* Classroom Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-6xl"
                >
                    {classroomsLoading ? (
                        // Skeleton loaders
                        Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="bg-white dark:bg-[#1a1d2e] rounded-2xl border border-gray-100 dark:border-white/[0.06] h-[240px] animate-pulse"
                            />
                        ))
                    ) : (
                        <>
                            {classrooms.map((classroom, index) => {
                                const { icon, iconBg } = getIconForIndex(index);
                                const classroomId = classroom.id || (classroom as any)._id;
                                return (
                                    <ClassroomCard
                                        key={classroomId}
                                        title={classroom.name}
                                        studentCount={classroom.student_count}
                                        accessCode={classroom.access_code}
                                        icon={icon}
                                        iconBgClass={iconBg}
                                        actionButtonText="View Classroom"
                                        onAction={() => navigate(`/dashboard/classroom/${classroomId}`)}
                                        onDelete={isTeacher ? () => handleDeleteClick(classroomId, classroom.name) : undefined}
                                        onLeave={!isTeacher ? () => handleLeaveClick(classroomId, classroom.name) : undefined}
                                    />
                                );
                            })}

                            {/* Add / Join Card */}
                            <AddClassroomCard
                                type={isTeacher ? 'create' : 'join'}
                                onClick={() => setIsCreateModalOpen(true)}
                            />
                        </>
                    )}
                </motion.div>
            </main>

            {/* Create / Join Classroom Modal */}
            <CreateClassroomModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                mode={isTeacher ? 'create' : 'join'}
                onCreateSubmit={handleCreateClassroom}
                onJoinSubmit={handleJoinClassroom}
            />

            {/* Delete Classroom Modal */}
            <DeleteClassroomModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                classroomName={classroomToDelete?.name || ''}
            />

            {/* Leave Classroom Modal */}
            <LeaveClassroomModal
                isOpen={isLeaveModalOpen}
                onClose={() => setIsLeaveModalOpen(false)}
                onConfirm={handleConfirmLeave}
                classroomName={classroomToLeave?.name || ''}
            />

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 20, x: '-50%' }}
                        className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg flex items-center gap-3 z-50 text-sm font-medium
                            ${toast.type === 'success'
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                : 'bg-red-600 text-white'
                            }`}
                    >
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DashboardPage;
