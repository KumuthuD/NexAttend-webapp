import React, { useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Bell,
    Shield,
    Palette,
    LogOut,
    Mail,
    Smartphone,
    Moon,
    Sun,
    Lock,
    Save,
    Menu,
    AlertCircle,
    CheckCircle,
    Eye,
    EyeOff
} from 'lucide-react';
import Input from '../components/common/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { updatePassword, uploadAvatar } from '../services/api';

const SettingsPage: React.FC = () => {
    const { logout, user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Profile Update State
    const [newName, setNewName] = useState(user?.name || '');
    const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '');
    const [dateOfBirth, setDateOfBirth] = useState(user?.date_of_birth || '');
    const [gender, setGender] = useState(user?.gender || '');
    const [isUpdating, setIsUpdating] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        showToast("Uploading photo...");
        try {
            const updatedUser = await uploadAvatar(file);
            setSelectedAvatar(updatedUser.avatar);

            // Sync with backend by making the context pull down the entire new `user` model through the token or update explicitly
            // But we already updated the backend user object so calling updateUser context handles React side:
            await updateUser({ avatar: updatedUser.avatar });

            showToast("Profile photo uploaded!");
        } catch (error) {
            console.error("Failed to upload avatar", error);
            showToast("Failed to upload profile photo", "error");
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Sync local state with user when user changes (e.g. after update or initial load)
    React.useEffect(() => {
        if (user) {
            setNewName(user.name);
            setSelectedAvatar(user.avatar || '');
            setDateOfBirth(user.date_of_birth || '');
            setGender(user.gender || '');
        }
    }, [user]);

    // Professional Avatars (DiceBear - Personas, Initials, Lorelei)
    const avatarOptions = [
        `https://api.dicebear.com/7.x/initials/svg?seed=${newName || 'User'}&backgroundColor=e5e7eb&textColor=374151`,
        "https://api.dicebear.com/7.x/personas/svg?seed=Felix",
        "https://api.dicebear.com/7.x/personas/svg?seed=Aneka",
        "https://api.dicebear.com/7.x/personas/svg?seed=Marco",
        "https://api.dicebear.com/7.x/personas/svg?seed=Paula",
        "https://api.dicebear.com/7.x/personas/svg?seed=Jocelyn",
        "https://api.dicebear.com/7.x/lorelei/svg?seed=Felix",
        "https://api.dicebear.com/7.x/lorelei/svg?seed=Aneka",
    ];

    const handleUpdateProfile = async () => {
        setIsUpdating(true);
        try {
            await updateUser({
                name: newName,
                avatar: selectedAvatar,
                date_of_birth: dateOfBirth,
                gender: gender
            });
            showToast("Profile updated successfully!");
        } catch (error) {
            console.error("Failed to update profile", error);
            showToast("Failed to update profile", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    // Mock states for form interactions
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        marketing: false,
        security: true
    });

    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/get-started');
    };

    const handleNotificationChange = (key: keyof typeof notifications) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSavePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
            showToast("Please fill in all password fields", "error");
            return;
        }

        if (passwordData.new !== passwordData.confirm) {
            showToast("New passwords do not match", "error");
            return;
        }

        setIsUpdatingPassword(true);
        try {
            await updatePassword({
                current_password: passwordData.current,
                new_password: passwordData.new
            });
            showToast("Password updated successfully!");
            setPasswordData({ current: '', new: '', confirm: '' });
        } catch (error: any) {
            console.error("Failed to update password", error);
            showToast(error.response?.data?.detail || "Failed to update password", "error");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: <User size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
        { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
        { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    ];

    return (
        <div className="flex min-h-screen bg-white dark:bg-[#0f1117] transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Mobile Top Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#0f1117] border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between px-4 z-30">
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

            <main className={`flex-1 lg:ml-64 p-4 md:p-7 relative transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'blur-sm lg:blur-none' : ''}`}>
                <div className="lg:hidden h-16" /> {/* Spacer for fixed mobile header */}

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-between items-center mb-4"
                >
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                            Settings
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            Manage your account preferences and settings
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
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

                <div className="grid grid-cols-12 gap-8">
                    {/* Settings Navigation */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="col-span-12 md:col-span-3"
                    >
                        <nav className="flex flex-col gap-2">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                                        ${activeTab === tab.id
                                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/20'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                                        }
                                    `}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </motion.div>

                    {/* Settings Content */}
                    <div className="col-span-12 md:col-span-9">
                        <div className="bg-white dark:bg-[#1a1d2e] rounded-2xl p-6 border border-gray-100 dark:border-white/[0.06] shadow-sm min-h-[500px]">
                            <AnimatePresence mode="wait">
                                {/* Profile Section */}
                                {activeTab === 'profile' && (
                                    <motion.div
                                        key="profile"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                                        transition={{ duration: 0.4 }}
                                        className="space-y-8"
                                    >
                                        <div className="flex flex-col mt-10 md:flex-row gap-8 items-start">
                                            {/* Avatar Selection */}
                                            <div className="w-full md:w-auto flex flex-col items-center gap-4">
                                                <div className="relative group">
                                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-[#1a1d2e] shadow-xl">
                                                        <img
                                                            src={selectedAvatar || user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}&backgroundColor=e5e7eb&textColor=374151`}
                                                            alt="Profile"
                                                            className="w-full h-full object-cover bg-violet-100 dark:bg-violet-900/20"
                                                        />
                                                    </div>
                                                    <div
                                                        className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        <span className="text-white text-xs font-medium">Upload Photo</span>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        ref={fileInputRef}
                                                        onChange={handleAvatarUpload}
                                                    />
                                                </div>

                                                <div className="text-center">
                                                    <h3 className="capitalize text-lg font-bold text-gray-900 dark:text-white">{user?.name}</h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                                                </div>
                                            </div>

                                            {/* Edit Form */}
                                            <div className="flex-1 w-full space-y-8">
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Select Avatar</h4>
                                                    <div className="flex gap-3 flex-wrap">
                                                        {avatarOptions.map((avatar, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => setSelectedAvatar(avatar)}
                                                                className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${selectedAvatar === avatar ? 'border-violet-600 scale-110' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}
                                                            >
                                                                <img src={avatar} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover bg-gray-100" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                                                        <input
                                                            type="text"
                                                            value={newName}
                                                            onChange={(e) => setNewName(e.target.value)}
                                                            className="w-full px-4 py-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-100"
                                                            placeholder="Enter your full name"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                                        <input
                                                            type="email"
                                                            value={user?.email || ''}
                                                            readOnly
                                                            className="w-full px-4 py-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-100 cursor-not-allowed"
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">Email address cannot be changed</p>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Birth</label>
                                                            <input
                                                                type="date"
                                                                value={dateOfBirth}
                                                                onChange={(e) => setDateOfBirth(e.target.value)}
                                                                className="w-full px-4 py-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
                                                            <select
                                                                value={gender}
                                                                onChange={(e) => setGender(e.target.value)}
                                                                className="w-full px-4 py-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-100"
                                                            >
                                                                <option value="" className="bg-white dark:bg-[#1a1d2e]">Select Gender</option>
                                                                <option value="Male" className="bg-white dark:bg-[#1a1d2e]">Male</option>
                                                                <option value="Female" className="bg-white dark:bg-[#1a1d2e]">Female</option>
                                                                <option value="Other" className="bg-white dark:bg-[#1a1d2e]">Other</option>
                                                                <option value="Prefer not to say" className="bg-white dark:bg-[#1a1d2e]">Prefer not to say</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-4 flex justify-center">
                                                    <button
                                                        onClick={handleUpdateProfile}
                                                        disabled={isUpdating || (newName === user?.name && selectedAvatar === user?.avatar && dateOfBirth === (user?.date_of_birth || '') && gender === (user?.gender || ''))}
                                                        className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-all duration-200 shadow-md shadow-violet-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {isUpdating ? 'Saving...' : (
                                                            <>
                                                                <Save size={18} />
                                                                Save Changes
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Notifications Section */}
                                {activeTab === 'notifications' && (
                                    <motion.div
                                        key="notifications"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                                        transition={{ duration: 0.4 }}
                                        className="space-y-6"
                                    >
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Notification Preferences</h3>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                                                        <Mail size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white">Email Notifications</h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates via email</p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={notifications.email}
                                                        onChange={() => handleNotificationChange('email')}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 dark:peer-focus:ring-violet-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-violet-600"></div>
                                                </label>
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
                                                        <Smartphone size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white">Push Notifications</h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates on your device</p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={notifications.push}
                                                        onChange={() => handleNotificationChange('push')}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 dark:peer-focus:ring-violet-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-violet-600"></div>
                                                </label>
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                                                        <Shield size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white">Security Alerts</h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about security events</p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={notifications.security}
                                                        onChange={() => handleNotificationChange('security')}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 dark:peer-focus:ring-violet-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-violet-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Appearance Section */}
                                {activeTab === 'appearance' && (
                                    <motion.div
                                        key="appearance"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                                        transition={{ duration: 0.4 }}
                                        className="space-y-6"
                                    >
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Appearance</h3>

                                        <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-xl">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white">Theme Preference</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Choose how NexAttend looks to you</p>
                                                </div>
                                                <ThemeToggle />
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                <p>Toggle between Light Mode and Dark Mode for better visibility or reduced eye strain.</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Security Section */}
                                {activeTab === 'security' && (
                                    <motion.div
                                        key="security"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                                        transition={{ duration: 0.4 }}
                                        className="space-y-6"
                                    >
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Update Password</h3>

                                        <div className="flex flex-col lg:flex-row gap-10">
                                            {/* Left Side: Form */}
                                            <div className="flex-1 mt-6">
                                                <form onSubmit={handleSavePassword} className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                                                        <div className="relative">
                                                            <Input
                                                                type={showCurrentPassword ? "text" : "password"}
                                                                name="current"
                                                                value={passwordData.current}
                                                                onChange={handlePasswordChange}
                                                                placeholder="Enter current password"
                                                                className="h-8 pl-10 bg-purple-50 dark:bg-white/5"
                                                                leftIcon={<Lock size={18} />}
                                                                rightIcon={
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                                        className="focus:outline-none"
                                                                    >
                                                                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                                    </button>
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                                                        <div className="relative">
                                                            <Input
                                                                type={showNewPassword ? "text" : "password"}
                                                                name="new"
                                                                value={passwordData.new}
                                                                onChange={handlePasswordChange}
                                                                placeholder="Enter new password"
                                                                className="h-8 pl-10 bg-purple-50 dark:bg-white/5"
                                                                leftIcon={<Lock size={18} />}
                                                                rightIcon={
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                                        className="focus:outline-none"
                                                                    >
                                                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                                    </button>
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                                                        <div className="relative">
                                                            <Input
                                                                type={showConfirmPassword ? "text" : "password"}
                                                                name="confirm"
                                                                value={passwordData.confirm}
                                                                onChange={handlePasswordChange}
                                                                placeholder="Confirm new password"
                                                                className="h-8 pl-10 bg-purple-50 dark:bg-white/5"
                                                                leftIcon={<Lock size={18} />}
                                                                rightIcon={
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                        className="focus:outline-none"
                                                                    >
                                                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                                    </button>
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="pt-6 mb-10 flex justify-center">
                                                        <button
                                                            type="submit"
                                                            disabled={isUpdatingPassword}
                                                            className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-all duration-200 shadow-md shadow-violet-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {isUpdatingPassword ? (
                                                                <>
                                                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                    Updating...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Save size={18} />
                                                                    Update Password
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>

                                            {/* Right Side: Illustration */}
                                            <div className="hidden lg:flex flex-1 items-center justify-center bg-violet-50 dark:bg-white/5 rounded-2xl p-8 border border-violet-100 dark:border-white/[0.06]">
                                                <div className="relative">
                                                    <div className="w-64 h-64 bg-violet-100 dark:bg-violet-900/20 rounded-full flex items-center justify-center animate-pulse">
                                                        <Shield size={120} className="text-violet-500 dark:text-violet-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 20, x: '-50%' }}
                        className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg flex items-center gap-3 z-50 text-sm font-medium
                            ${toast.type === 'success'
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border dark:border-white/10'
                                : 'bg-red-600 text-white'
                            }`}
                    >
                        {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SettingsPage;
