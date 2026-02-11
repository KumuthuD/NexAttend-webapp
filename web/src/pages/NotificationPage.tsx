import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Info, AlertTriangle, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';

// Types for notifications
type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: NotificationType;
    timestamp: string;
    read: boolean;
}

const NotificationPage: React.FC = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/get-started');
    };

    // Mock data
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: 1,
            title: "Assignment Due Soon",
            message: "Your 'Database Systems' project is due tomorrow at 11:59 PM.",
            type: "warning",
            timestamp: "2 hours ago",
            read: false
        },
        {
            id: 2,
            title: "Class Canceled",
            message: "Tomorrow's 'Advanced Client Side' class has been canceled by the instructor.",
            type: "error",
            timestamp: "5 hours ago",
            read: false
        },
        {
            id: 3,
            title: "Attendance Recorded",
            message: "Your attendance for 'Algorithms' has been successfully recorded.",
            type: "success",
            timestamp: "1 day ago",
            read: true
        },
        {
            id: 4,
            title: "New Resource Available",
            message: "Lecture notes for Week 5 have been uploaded to 'Software Engineering'.",
            type: "info",
            timestamp: "2 days ago",
            read: true
        },
        {
            id: 5,
            title: "System Maintenance",
            message: "NexAttend will undergo scheduled maintenance on Saturday from 2 AM to 4 AM.",
            type: "info",
            timestamp: "3 days ago",
            read: true
        }
    ]);

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'success':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'info':
            default:
                return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getBgColor = (type: NotificationType, read: boolean) => {
        if (read) return 'bg-white dark:bg-[#1a1d2e]';

        switch (type) {
            case 'success':
                return 'bg-green-50 dark:bg-green-900/10';
            case 'warning':
                return 'bg-amber-50 dark:bg-amber-900/10';
            case 'error':
                return 'bg-red-50 dark:bg-red-900/10';
            case 'info':
            default:
                return 'bg-blue-50 dark:bg-blue-900/10';
        }
    };

    const markAsRead = (id: number) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: number) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    // Format greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="flex min-h-screen bg-[#f8f9fc] dark:bg-[#0f1117] transition-colors duration-300">
            <Sidebar />

            <main className="flex-1 ml-64 p-10 relative">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">
                            Notifications
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            Stay updated with your classes and activities
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

                {/* Controls */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-white/5 px-3 py-1 rounded-full border border-gray-200 dark:border-white/10">
                            {notifications.filter(n => !n.read).length} Unread
                        </span>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-white/5 px-3 py-1 rounded-full border border-gray-200 dark:border-white/10">
                            {notifications.length} Total
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                        >
                            <Check size={16} />
                            Mark all as read
                        </button>
                        <button
                            onClick={clearAll}
                            className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                            <Trash2 size={16} />
                            Clear all
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="max-w-4xl space-y-4">
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`
                                    relative flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200
                                    ${getBgColor(notification.type, notification.read)}
                                    ${notification.read
                                        ? 'border-gray-100 dark:border-white/[0.06]'
                                        : 'border-transparent shadow-sm'
                                    }
                                    hover:shadow-md hover:scale-[1.01]
                                `}
                            >
                                <div className={`mt-0.5 p-2 rounded-full bg-white dark:bg-white/5 shadow-sm border border-gray-100 dark:border-white/5`}>
                                    {getIcon(notification.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`text-base font-semibold ${notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                                            {notification.title}
                                        </h3>
                                        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap ml-4">
                                            {notification.timestamp}
                                        </span>
                                    </div>
                                    <p className={`text-sm ${notification.read ? 'text-gray-500 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'}`}>
                                        {notification.message}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!notification.read && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            className="p-1.5 text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-lg transition-colors"
                                            title="Mark as read"
                                        >
                                            <Check size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(notification.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-[#1a1d2e] rounded-2xl border border-gray-100 dark:border-white/[0.06]">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No notifications</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                                You're all caught up! Check back later for updates on your classes and assignments.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default NotificationPage;
