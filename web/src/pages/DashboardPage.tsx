import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardStats, DashboardStats } from '../services/api';
import Sidebar from '../components/Sidebar';
import ClassroomCard from '../components/dashboard/ClassroomCard';
import AddClassroomCard from '../components/dashboard/AddClassroomCard';
import CreateClassroomModal from '../components/dashboard/CreateClassroomModal';
import StudentAttendanceOverview from '../components/dashboard/StudentAttendanceOverview';
import StatsCard from '../components/dashboard/StatsCard';
import ThemeToggle from '../components/ThemeToggle';
import { Smile, Database, Code, BookOpen, Cpu, Palette, Users, CheckCircle, Activity, Menu, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Interface for classroom data
interface Classroom {
    id: number;
    title: string;
    studentCount: number;
    accessCode: string;
    icon: React.ReactNode;
    iconBg: string;
}

// Icon and color options for new classrooms
const ICON_OPTIONS = [
    { icon: (color: string) => <Smile className={`${color} w-6 h-6`} />, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
    { icon: (color: string) => <Database className={`${color} w-6 h-6`} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { icon: (color: string) => <Code className={`${color} w-6 h-6`} />, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { icon: (color: string) => <BookOpen className={`${color} w-6 h-6`} />, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
    { icon: (color: string) => <Cpu className={`${color} w-6 h-6`} />, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-500/10' },
    { icon: (color: string) => <Palette className={`${color} w-6 h-6`} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
];

// Initial mock data for classrooms
const INITIAL_CLASSROOMS: Classroom[] = [
    {
        id: 1,
        title: 'Algorithms',
        studentCount: 0,
        accessCode: '234458',
        icon: <BookOpen className="text-violet-600 dark:text-violet-400 w-6 h-6" />,
        iconBg: 'bg-violet-50 dark:bg-violet-500/10',
    },
    {
        id: 2,
        title: 'Advance Client Side',
        studentCount: 0,
        accessCode: '283292',
        icon: <Code className="text-blue-600 dark:text-blue-400 w-6 h-6" />,
        iconBg: 'bg-blue-50 dark:bg-blue-500/10',
    },
    {
        id: 3,
        title: 'Database',
        studentCount: 0,
        accessCode: '314758',
        icon: <Database className="text-emerald-600 dark:text-emerald-400 w-6 h-6" />,
        iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    }
];

// Function to generate random access code
const generateAccessCode = () => {
    const array = new Uint8Array(6);
    crypto.getRandomValues(array);

    return Array.from(array, num => num % 10).join('');
};

const DashboardPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [classrooms, setClassrooms] = useState<Classroom[]>(INITIAL_CLASSROOMS);
    const [nextId, setNextId] = useState(4);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const isTeacher = user?.role === 'teacher';

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        // Fetch stats if teacher
        const fetchStats = async () => {
            if (user?.role === 'teacher') {
                try {
                    const data = await getDashboardStats();
                    setStats(data);
                } catch (error) {
                    console.error("Failed to fetch dashboard stats", error);
                }
            }
        };

        fetchStats();

        return () => clearInterval(timer);
    }, [user?.role]);

    const handleLogout = () => {
        logout(); // Assuming logout function exists in context, otherwise navigate to login
        navigate('/get-started');
    };

    const handleCreateClassroom = (inputValue: string) => {
        if (isTeacher) {
            // Create Logic
            const randomIconOption = ICON_OPTIONS[Math.floor(Math.random() * ICON_OPTIONS.length)];

            const newClassroom: Classroom = {
                id: nextId,
                title: inputValue,
                studentCount: 0,
                accessCode: generateAccessCode(),
                icon: randomIconOption.icon(randomIconOption.color),
                iconBg: randomIconOption.bg,
            };

            setClassrooms([...classrooms, newClassroom]);
            setNextId(nextId + 1);
        } else {
            // Join Logic (Mock)
            console.log("Joining classroom with code:", inputValue);
            // In a real app, this would verify the code and add the student to the class
            alert(`Joined classroom with code: ${inputValue}`);
        }
        setIsCreateModalOpen(false);
    };

    // Format greeting based on time of day
    const hour = currentTime.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

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

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-3"
                >
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">
                            {greeting}{user?.name ? `, ${user.name.split(' ')[0] + '!'}` : ''}👋
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Here's what's happening with your classes today.</p>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4">
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

                {/* Stats Cards Section - Only for Teachers */}
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
                            value={stats?.total_classrooms || 0}
                            icon={<BookOpen className="w-5 h-5 text-violet-600 dark:text-violet-400" />}
                            color="text-violet-600"
                            bg="bg-violet-50 dark:bg-violet-500/10"
                            delay={0.2}
                        />
                        <StatsCard
                            title="Today's Attendance"
                            value={stats?.todays_attendance_count || 0}
                            icon={<CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />}
                            trend={{ value: 12, label: "vs yesterday" }}
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
                        totalClasses={stats?.total_classrooms || 0}
                        presentCount={stats?.todays_attendance_count || 0}
                        absentCount={0}
                    />
                )}

                {/* Section header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white transition-colors duration-300">Your Classrooms</h2>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-white/5 dark:text-gray-400 px-3 py-1 rounded-full transition-colors duration-300">{classrooms.length} classrooms</span>
                </div>

                {/* Classroom Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-6xl"
                >
                    {classrooms.map((classroom) => (
                        <ClassroomCard
                            key={classroom.id}
                            title={classroom.title}
                            studentCount={classroom.studentCount}
                            accessCode={classroom.accessCode}
                            icon={classroom.icon}
                            iconBgClass={classroom.iconBg}
                            actionButtonText="View Classroom"
                            onAction={() => navigate(`/dashboard/classroom/${classroom.id}`)}
                        />
                    ))}

                    {/* Add/Join Card */}
                    <AddClassroomCard
                        type={isTeacher ? 'create' : 'join'}
                        onClick={() => setIsCreateModalOpen(true)}
                    />
                </motion.div>
            </main>

            {/* Create Classroom Modal */}
            <CreateClassroomModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateClassroom}
                mode={isTeacher ? 'create' : 'join'}
            />
        </div>
    );
};

export default DashboardPage;
