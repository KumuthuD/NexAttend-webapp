import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Users, Clock, Calendar, ArrowLeft } from 'lucide-react';

const ClassroomPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Mock data - in a real app, fetch based on ID
    const classroom = {
        id: id,
        title: 'Algorithms',
        code: 'AML-2025',
        studentCount: 0,
        nextSession: 'Today, 2:00 PM',
        description: 'Advanced algorithms and data structures.',
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-[#4facfe] to-[#00f2fe]">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {/* Back Button & Header */}
                <div className="mb-8">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center text-white/80 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Back to Dashboard
                    </button>
                    
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">{classroom.title}</h1>
                            <p className="text-white/80 text-lg">Code: <span className="font-mono bg-white/20 px-2 py-1 rounded">{classroom.code}</span></p>
                        </div>
                        <button className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105">
                            Start Attendance Session
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Users className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Total Students</p>
                                <p className="text-2xl font-bold text-gray-800">{classroom.studentCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <Clock className="text-purple-600" size={24} />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Next Session</p>
                                <p className="text-lg font-bold text-gray-800">{classroom.nextSession}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <Calendar className="text-green-600" size={24} />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Total Sessions</p>
                                <p className="text-2xl font-bold text-gray-800">0</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-3xl p-8 shadow-xl min-h-[400px]">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h2>
                    
                    <div className="space-y-4">
                        {/* Mock Recent Sessions */}
                        <div className="text-center py-12 text-gray-400">
                            <p>No recent sessions found.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ClassroomPage;
