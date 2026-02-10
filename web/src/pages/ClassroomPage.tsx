import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Users, Clock, Calendar, ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { Send, Camera } from 'lucide-react';
import CameraCapture from '../components/common/WebcamCapture';

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
    const { logout } = useAuth();
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/get-started');
    };

    const handleCapture = (file: File) => {
        console.log("Captured file:", file);
        // Here you would typically upload the file to your backend
        // For now, we'll just close the camera
        setIsCameraOpen(false);
        alert("Attendance marked successfully!");
    };

    // Mock Data based on screenshot
    const classroomName = "Advance Client Side Development";

    const announcement = {
        author: "Asini Silva",
        role: "Admin",
        time: "4.48PM - 11.11.25",
        content: "Please note that the following lecture and tutorials conducted by Ms. Asini, Ms. Theja, Mr. Ammar, and Mr. Sachindu have been rescheduled as detailed below:"
    };

    const chatMessages = [
        {
            id: 1,
            author: "Thiviru",
            time: "9:54 AM",
            date: "November 20, 2025",
            content: "How does React’s reconciliation algorithm work?",
            avatarBg: "bg-blue-600",
            initial: "D" // Assuming D for now as per screenshot icon
        },
        {
            id: 2,
            author: "Sudam",
            time: "9:39 AM",
            date: "November 27, 2025",
            content: "Can you explain the concept of fiber architecture?",
            avatarBg: "bg-orange-300",
            initial: null,
            avatarImg: true // Placeholder logic for image
        },
        {
            id: 3,
            author: "Sudam",
            time: "9:56 AM",
            date: "", // Same day
            content: "How does React handle reconciliation for list updates?",
            avatarBg: "bg-orange-300",
            initial: null,
            avatarImg: true
        },
        {
            id: 4,
            author: "Thiviru",
            time: "10:05 AM",
            date: "",
            content: "Ma’am can you explain it again please?",
            avatarBg: "bg-blue-600",
            initial: "D"
        }
    ];

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-[#4facfe] to-[#00f2fe]">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex-1 text-center">
                        <h1 className="text-3xl font-bold text-pink-600 drop-shadow-sm">
                            {classroomName}
                        </h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-2 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 transition-colors font-semibold shadow-sm"
                    >
                        Logout
                    </button>
                </div>

                {/* Divider */}
                <div className="w-full h-0.5 bg-white/30 mb-8" />

                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Announcements Section */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-pink-600">Important Announcements</h2>
                            <button
                                onClick={() => setIsCameraOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-semibold transition-colors shadow-md"
                            >
                                <Camera size={18} />
                                Mark Attendance
                            </button>
                        </div>

                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">

                            {/* Input Area */}
                            <div className="p-6 border-t border-gray-100 bg-white/50">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Post an announcement..."
                                        className="w-full pl-6 pr-12 py-4 bg-white rounded-full text-gray-700 placeholder-gray-500 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all shadow-sm"
                                    />
                                    <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors text-blue-500">
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Chat Section */}
                    <section>
                        <h2 className="text-xl font-bold text-pink-600 mb-4">Chat</h2>
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden flex flex-col h-[600px]">
                            
                            {/* Input Area */}
                            <div className="p-6 border-t border-gray-100 bg-white/50">
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        className="w-full pl-6 pr-12 py-4 bg-white rounded-full text-gray-700 placeholder-gray-500 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all shadow-sm"
                                    />
                                    <button className="absolute right-9 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors text-blue-500">
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* Camera Modal */}
            {isCameraOpen && (
                <CameraCapture
                    onCapture={handleCapture}
                    onClose={() => setIsCameraOpen(false)}
                />
            )}
        </div>
    );
};

export default ClassroomPage;
