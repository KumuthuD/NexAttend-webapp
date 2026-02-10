import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import ClassroomCard from '../components/dashboard/ClassroomCard';
import AddClassroomCard from '../components/dashboard/AddClassroomCard';
import CreateClassroomModal from '../components/dashboard/CreateClassroomModal';
import ThemeToggle from '../components/ThemeToggle';
import { Smile, Database, Code, BookOpen, Cpu, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
        accessCode: 'AML-2025',
        icon: <BookOpen className="text-violet-600 dark:text-violet-400 w-6 h-6" />,
        iconBg: 'bg-violet-50 dark:bg-violet-500/10',
    },
    {
        id: 2,
        title: 'Advance Client Side',
        studentCount: 0,
        accessCode: 'DSA-2025',
        icon: <Code className="text-blue-600 dark:text-blue-400 w-6 h-6" />,
        iconBg: 'bg-blue-50 dark:bg-blue-500/10',
    },
    {
        id: 3,
        title: 'Database',
        studentCount: 0,
        accessCode: 'IQC-2025',
        icon: <Database className="text-emerald-600 dark:text-emerald-400 w-6 h-6" />,
        iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    }
];

// Function to generate random access code
const generateAccessCode = (title: string): string => {
    const prefix = title.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    return `${prefix}-${randomNum}`;
};

const DashboardPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [classrooms, setClassrooms] = useState<Classroom[]>(INITIAL_CLASSROOMS);
    const [nextId, setNextId] = useState(4);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleLogout = () => {
        navigate('/get-started');
    };

    const handleCreateClassroom = (classroomName: string) => {
        const randomIconOption = ICON_OPTIONS[Math.floor(Math.random() * ICON_OPTIONS.length)];

        const newClassroom: Classroom = {
            id: nextId,
            title: classroomName,
            studentCount: 0,
            accessCode: generateAccessCode(classroomName),
            icon: randomIconOption.icon(randomIconOption.color),
            iconBg: randomIconOption.bg,
        };

        setClassrooms([...classrooms, newClassroom]);
        setNextId(nextId + 1);
        setIsCreateModalOpen(false);
    };

    const isTeacher = user?.role === 'teacher';

    // Format greeting based on time of day
    const hour = currentTime.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="flex min-h-screen bg-[#f8f9fc] dark:bg-[#0f1117] transition-colors duration-300">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 ml-64 p-10 relative">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">
                            {greeting}{user?.name ? `, ${user.name}` : ''} 👋
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            Manage your classrooms and track attendance
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <button
                            onClick={handleLogout}
                            className="px-5 py-2 text-sm text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-900 rounded-xl transition-all duration-200 font-medium bg-white dark:bg-white/5 dark:text-gray-400 dark:border-white/10 dark:hover:text-white dark:hover:border-white/20"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-gray-200 dark:bg-white/[0.06] mb-8 transition-colors duration-300" />

                {/* Section header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white transition-colors duration-300">Your Classrooms</h2>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-white/5 dark:text-gray-400 px-3 py-1 rounded-full transition-colors duration-300">{classrooms.length} classrooms</span>
                </div>

                {/* Classroom Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-6xl">
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
                </div>
            </main>

            {/* Create Classroom Modal */}
            <CreateClassroomModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateClassroom}
            />
        </div>
    );
};

export default DashboardPage;
