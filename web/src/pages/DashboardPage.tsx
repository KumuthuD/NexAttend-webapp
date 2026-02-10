import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import ClassroomCard from '../components/dashboard/ClassroomCard';
import AddClassroomCard from '../components/dashboard/AddClassroomCard';
import CreateClassroomModal from '../components/dashboard/CreateClassroomModal';
import { Smile, Database, Code, BookOpen, Cpu, Palette } from 'lucide-react'; // Using lucide-react for icons as placeholders
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
    { icon: (color: string) => <Smile className={`${color} w-8 h-8`} />, color: 'text-orange-400', bg: 'bg-orange-100' },
    { icon: (color: string) => <Database className={`${color} w-8 h-8`} />, color: 'text-green-500', bg: 'bg-green-100' },
    { icon: (color: string) => <Code className={`${color} w-8 h-8`} />, color: 'text-blue-400', bg: 'bg-blue-100' },
    { icon: (color: string) => <BookOpen className={`${color} w-8 h-8`} />, color: 'text-purple-400', bg: 'bg-purple-100' },
    { icon: (color: string) => <Cpu className={`${color} w-8 h-8`} />, color: 'text-pink-400', bg: 'bg-pink-100' },
    { icon: (color: string) => <Palette className={`${color} w-8 h-8`} />, color: 'text-indigo-400', bg: 'bg-indigo-100' },
];

// Initial mock data for classrooms
const INITIAL_CLASSROOMS: Classroom[] = [
    {
        id: 1,
        title: 'Algorithms',
        studentCount: 0,
        accessCode: 'AML-2025',
        icon: <Smile className="text-orange-400 w-8 h-8" />,
        iconBg: 'bg-orange-100',
    },
    {
        id: 2,
        title: 'Advance Client Side',
        studentCount: 0,
        accessCode: 'DSA-2025',
        icon: <Smile className="text-green-500 w-8 h-8" />,
        iconBg: 'bg-green-100',
    },
    {
        id: 3,
        title: 'Database',
        studentCount: 0,
        accessCode: 'IQC-2025',
        icon: <Smile className="text-blue-400 w-8 h-8" />,
        iconBg: 'bg-blue-100',
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
    const [nextId, setNextId] = useState(4); // Start from 4 since we have 3 initial classrooms

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleLogout = () => {
        navigate('/get-started');
    };

    const handleCreateClassroom = (classroomName: string) => {
        // Generate random icon and color
        const randomIconOption = ICON_OPTIONS[Math.floor(Math.random() * ICON_OPTIONS.length)];

        // Create new classroom object
        const newClassroom: Classroom = {
            id: nextId,
            title: classroomName,
            studentCount: 0, // Start with 0 students
            accessCode: generateAccessCode(classroomName),
            icon: randomIconOption.icon(randomIconOption.color),
            iconBg: randomIconOption.bg,
        };

        // Add to classrooms list
        setClassrooms([...classrooms, newClassroom]);
        setNextId(nextId + 1);

        // Close the modal
        setIsCreateModalOpen(false);
    };

    // Determine role (default to student if null for safety, though protection should handle it)
    const isTeacher = user?.role === 'teacher';

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-[#4facfe] to-[#00f2fe]">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-5">
                    <div>
                        {/* Header space if needed, currently empty in design or just title */}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-2 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 transition-colors font-semibold"
                    >
                        Logout
                    </button>
                </div>

                {/* Divider */}
                <div className="w-full h-1 bg-white/30 mb-8 border-0 rounded-full" />

                {/* Content Container - Centered */}
                <div className="flex flex-col items-center w-full">
                    {/* Dashboard Title */}
                    <h1 className="text-3xl font-bold text-pink-500 mb-8 text-center">
                        Your Classrooms
                    </h1>

                    {/* Classroom Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8 max-w-5xl w-full">
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
