import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { Send } from 'lucide-react';

const ClassroomPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/get-started');
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
                        <h2 className="text-xl font-bold text-pink-600 mb-4">Important Announcements</h2>

                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                            {/* Announcements List */}
                            <div className="divide-y divide-gray-100">
                                <div className="p-6 hover:bg-white/40 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center text-xl font-bold text-gray-700 shadow-sm">
                                            A
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="font-bold text-gray-900">{announcement.author}</span>
                                                <span className="text-xs font-semibold text-red-500 bg-red-100 px-2.5 py-0.5 rounded-full border border-red-200">{announcement.role}</span>
                                                <span className="text-xs text-gray-500 ml-auto">{announcement.time}</span>
                                            </div>
                                            <p className="text-gray-700 leading-relaxed text-sm">
                                                {announcement.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

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
                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {chatMessages.map((msg, index) => (
                                    <div key={msg.id}>
                                        {msg.date && (
                                            <div className="text-center text-xs text-gray-500 font-semibold mb-4">
                                                {msg.date}
                                            </div>
                                        )}
                                        <div className="flex gap-3 items-start">
                                            {/* Avatar */}
                                            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold overflow-hidden ${msg.avatarBg}`}>
                                                {msg.initial ? msg.initial : (
                                                    // Placeholder for image avatar (Sudam)
                                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.author}`} alt={msg.author} className="w-full h-full object-cover" />
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <span className="font-bold text-gray-900">{msg.author}</span>
                                                    <span className="text-xs text-gray-500">{msg.time}</span>
                                                </div>
                                                <p className="text-gray-800">
                                                    {msg.content}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Input Area */}
                            <div className="p-6 border-t border-gray-100 bg-white/50">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        className="w-full pl-6 pr-12 py-4 bg-white rounded-full text-gray-700 placeholder-gray-500 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all shadow-sm"
                                    />
                                    <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors text-blue-500">
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default ClassroomPage;
