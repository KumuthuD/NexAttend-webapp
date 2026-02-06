import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import ClassroomCard from '../components/dashboard/ClassroomCard';
import AddClassroomCard from '../components/dashboard/AddClassroomCard';
import { Smile, Database, Code } from 'lucide-react'; // Using lucide-react for icons as placeholders
import { useNavigate } from 'react-router-dom';

// Mock data for classrooms
const MOCK_CLASSROOMS = [
    {
        id: 1,
        title: 'Algorithms',
        studentCount: 120,
        accessCode: 'AML-2025',
        icon: <Smile className="text-orange-400 w-8 h-8" />,
        iconBg: 'bg-orange-100',
    },
    {
        id: 2,
        title: 'Advance Client Side',
        studentCount: 100,
        accessCode: 'DSA-2025',
        icon: <Smile className="text-green-500 w-8 h-8" />, // Placeholder icon
        iconBg: 'bg-green-100',
    },
    {
        id: 3,
        title: 'Database',
        studentCount: 110,
        accessCode: 'IQC-2025',
        icon: <Smile className="text-blue-400 w-8 h-8" />,
        iconBg: 'bg-blue-100',
    }
];

const DashboardPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
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
                <div className="flex justify-between items-center mb-8">
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
                <div className="w-full h-px bg-white/30 mb-8" />

                {/* Content Container - Centered */}
                <div className="flex flex-col items-center w-full">
                    {/* Dashboard Title */}
                    <h1 className="text-3xl font-bold text-pink-500 mb-8 text-center">
                        Your Classrooms
                    </h1>

                    {/* Classroom Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8 max-w-5xl w-full">
                        {MOCK_CLASSROOMS.map((classroom) => (
                            <ClassroomCard
                                key={classroom.id}
                                title={classroom.title}
                                studentCount={classroom.studentCount}
                                accessCode={classroom.accessCode}
                                icon={classroom.icon}
                                iconBgClass={classroom.iconBg}
                                actionButtonText={isTeacher ? "Start Attendance" : "View Classroom"}
                                onAction={() => console.log(`Action for ${classroom.title}`)}
                            />
                        ))}

                        {/* Add/Join Card */}
                        <AddClassroomCard
                            type={isTeacher ? 'create' : 'join'}
                            onClick={() => console.log(isTeacher ? 'Create classroom' : 'Join classroom')}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
