import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { Send, Camera, Megaphone, MessageCircle, ArrowLeft, Users, Clock, Hash } from 'lucide-react';
import CameraCapture from '../components/common/WebcamCapture';

const ClassroomPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [announcementText, setAnnouncementText] = useState('');
    const [chatText, setChatText] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/get-started');
    };

    const handleCapture = (file: File) => {
        console.log("Captured file:", file);
        setIsCameraOpen(false);
        alert("Attendance marked successfully!");
    };

    // Mock Data
    const classroomName = "Advance Client Side Development";
    const accessCode = "ACS-2025";

    const chatMessages = [
        {
            id: 1,
            author: "Thiviru",
            time: "9:54 AM",
            date: "November 20, 2025",
            content: "How does React's reconciliation algorithm work?",
            color: "bg-violet-500",
            initial: "T"
        },
        {
            id: 2,
            author: "Sudam",
            time: "9:39 AM",
            date: "November 27, 2025",
            content: "Can you explain the concept of fiber architecture?",
            color: "bg-amber-500",
            initial: "S"
        },
        {
            id: 3,
            author: "Sudam",
            time: "9:56 AM",
            date: "",
            content: "How does React handle reconciliation for list updates?",
            color: "bg-amber-500",
            initial: "S"
        },
        {
            id: 4,
            author: "Thiviru",
            time: "10:05 AM",
            date: "",
            content: "Ma'am can you explain it again please?",
            color: "bg-violet-500",
            initial: "T"
        }
    ];

    return (
        <div className="flex min-h-screen bg-[#f8f9fc] dark:bg-[#0f1117] transition-colors duration-300">
            <Sidebar />

            <main className="flex-1 ml-64 p-10 relative">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 transition-colors duration-200 text-sm font-medium"
                    >
                        <ArrowLeft size={16} />
                        <span className="">Dashboard</span>
                    </button>

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

                {/* Classroom Header Card */}
                <div className="bg-white dark:bg-[#1a1d2e] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-6 mb-8 shadow-sm transition-colors duration-300">
                    <div className="h-1 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-80 rounded-full -mt-6 mx-[-24px] mb-5" style={{ width: 'calc(100% + 48px)', marginTop: '-32px', borderRadius: '16px 16px 16px 16px' }} />
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">{classroomName}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                <span className="flex items-center gap-1.5">
                                    <Hash size={14} className="text-gray-400 dark:text-gray-500" />
                                    <span className="font-mono text-violet-600 dark:text-violet-400 font-medium">{accessCode}</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Users size={14} className="text-gray-400 dark:text-gray-500" />
                                    0 students
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock size={14} className="text-gray-400 dark:text-gray-500" />
                                    0 sessions
                                </span>
                            </div>
                        </div>
                        {user?.role === 'teacher' && (
                            <button
                                onClick={() => setIsCameraOpen(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-violet-200 dark:shadow-violet-500/20 text-sm"
                            >
                                Mark Attendance
                            </button>
                        )}
                        {user?.role === 'student' && (
                            <button
                                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-violet-200 dark:shadow-violet-500/20 text-sm"
                            >
                                View Attendance
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 max-w-6xl mx-auto">
                    {/* Announcements Section */}
                    <section>
                        <div className="flex items-center gap-2.5 mb-4">
                            <Megaphone size={16} className="text-gray-400 dark:text-gray-500" />
                            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">Announcements</h2>
                        </div>

                        <div className="bg-white dark:bg-[#1a1d2e] rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden h-[260px] flex flex-col  shadow-sm transition-colors duration-300 mb-10">
                            {/* Empty state */}
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors duration-300">
                                        <Megaphone size={28} className="text-gray-300 dark:text-gray-600" />
                                    </div>
                                    <p className="text-gray-400 dark:text-gray-500 text-sm font-medium transition-colors duration-300">No announcements yet</p>
                                </div>
                            </div>

                            {/* Input Area - Only for teachers */}
                            {user?.role === 'teacher' && (
                                <div className="p-4 border-t border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-black/20 transition-colors duration-300">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={announcementText}
                                            onChange={(e) => setAnnouncementText(e.target.value)}
                                            placeholder="Post an announcement..."
                                            className="w-full pl-4 pr-11 py-3 bg-white dark:bg-white/[0.05] rounded-xl text-gray-800 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-600 border border-gray-200 dark:border-white/[0.1] focus:outline-none focus:border-violet-400 dark:focus:border-violet-500/40 focus:ring-2 focus:ring-violet-50 dark:focus:ring-violet-500/10 transition-all duration-200"
                                        />
                                        <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-violet-50 dark:hover:bg-white/10 transition-colors text-gray-400 dark:text-gray-500 hover:text-violet-600 dark:hover:text-violet-400">
                                            <Send size={15} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Chat Section */}
                    <section>
                        <div className="flex items-center gap-2.5 mb-4">
                            <MessageCircle size={16} className="text-gray-400 dark:text-gray-500" />
                            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">Discussion</h2>
                        </div>

                        <div className="bg-white dark:bg-[#1a1d2e] rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden flex flex-col h-[460px] shadow-sm transition-colors duration-300">
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                {chatMessages.map((msg) => (
                                    <div key={msg.id}>
                                        {msg.date && (
                                            <div className="text-center mb-5">
                                                <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 px-3 py-1 bg-gray-50 dark:bg-white/5 rounded-full border border-gray-100 dark:border-white/5 uppercase tracking-wide transition-colors duration-300">
                                                    {msg.date}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-start gap-3 group">
                                            <div className={`w-8 h-8 rounded-lg ${msg.color} flex-shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                                                {msg.initial}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline gap-2 mb-0.5">
                                                    <span className="font-bold text-gray-800 dark:text-white text-sm transition-colors duration-300">{msg.author}</span>
                                                    <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium transition-colors duration-300">{msg.time}</span>
                                                </div>
                                                <div className="bg-gray-50 dark:bg-white/5 rounded-xl rounded-tl-sm px-3.5 py-2.5 border border-gray-100 dark:border-white/5 transition-colors duration-300">
                                                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed transition-colors duration-300">{msg.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 border-t border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-black/20 transition-colors duration-300">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={chatText}
                                        onChange={(e) => setChatText(e.target.value)}
                                        placeholder="Type a message..."
                                        className="w-full pl-4 pr-11 py-3 bg-white dark:bg-white/[0.05] rounded-xl text-gray-800 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-600 border border-gray-200 dark:border-white/[0.1] focus:outline-none focus:border-violet-400 dark:focus:border-violet-500/40 focus:ring-2 focus:ring-violet-50 dark:focus:ring-violet-500/10 transition-all duration-200"
                                    />
                                    <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-violet-50 dark:hover:bg-white/10 transition-colors text-gray-400 dark:text-gray-500 hover:text-violet-600 dark:hover:text-violet-400">
                                        <Send size={15} />
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
