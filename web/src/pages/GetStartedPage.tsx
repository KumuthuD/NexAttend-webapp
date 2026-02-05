import React, { useState, useEffect } from "react";
import { SparklesIcon } from "../components/icons";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import ImageUpload from "../components/common/ImageUpload";
import { useAuth } from "../contexts/AuthContext";

import { User, Mail, Lock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GetStartedPage = () => {
    const navigate = useNavigate();

    const { login, register, isLoading } = useAuth();

    // Scroll to top when page loads
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [activeTab, setActiveTab] = useState<"signup" | "login">("signup");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "teacher" as "teacher" | "student",
    });

    const [profileImages, setProfileImages] = useState<File[]>([]);
    const [imageError, setImageError] = useState<string>("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Reset errors
        setImageError("");

        // Specific validation for student signup
        if (activeTab === "signup" && formData.role === "student") {
            if (profileImages.length < 3) {
                setImageError("Please upload at least 3 profile photos for face recognition setup.");
                return;
            }
        }

        try {
            if (activeTab === "signup") {
                await register({
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                }, profileImages);
            } else {
                await login({
                    name: "User", // This would typically come from the backend on login
                    email: formData.email,
                    role: "teacher", // Default or fetched from backend
                });
            }
            navigate('/dashboard');
        } catch (error) {
            console.error("Authentication failed", error);
        }
    };

    return (
        <div className="relative min-h-screen bg-gray-900 pt-20 md:pt-24 flex items-center justify-center overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-violet-900/20 to-gray-900"></div>

            {/* Floating Orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="orb orb-purple w-[500px] h-[500px] -top-40 -left-40 animate-float-slow"></div>
                <div className="orb orb-pink w-96 h-96 top-1/3 -right-32 animate-float"></div>
                <div className="orb orb-blue w-80 h-80 -bottom-20 left-1/4 animate-float-reverse"></div>
            </div>

            {/* Grid Overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
                    backgroundSize: "80px 80px",
                }}
            ></div>

            {/* Main Content */}
            <div className="relative z-10 container mx-auto px-4 py-12">
                <div className="max-w-5xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Side - Welcome Text */}
                        <div className="text-center lg:text-left animate-fade-in-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-sm font-medium backdrop-blur-sm mb-6">
                                <SparklesIcon className="w-4 h-4" />
                                Join NexAttend Today
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-violet-400">
                                    Transform Your
                                </span>
                                <br />
                                <span className="text-white">Classroom Experience</span>
                            </h1>

                            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                                Join thousands of educators using AI-powered attendance tracking.
                                Save time, gain insights, and focus on what matters most — teaching.
                            </p>

                            {/* Feature highlights */}
                            <div className="space-y-4">
                                {[
                                    { icon: "⚡", text: "Lightning-fast face recognition" },
                                    { icon: "📊", text: "Real-time analytics dashboard" },
                                    { icon: "🔒", text: "Enterprise-grade security" },
                                    { icon: "🎓", text: "Made for educators, by educators" },
                                ].map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 text-gray-300"
                                    >
                                        <span className="text-xl">{feature.icon}</span>
                                        <span>{feature.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Side - Auth Form */}
                        <div className="animate-fade-in-right">
                            <div className="glass-card rounded-3xl p-8 relative overflow-hidden bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 shadow-2xl">
                                {/* Gradient top border */}
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-500 via-pink-500 to-violet-500"></div>

                                {/* Background blurs */}
                                <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl"></div>
                                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl"></div>

                                {/* Tab Switcher */}
                                <div className="relative z-10 flex mb-8 bg-gray-900/60 rounded-xl p-1 border border-gray-700">
                                    <button
                                        onClick={() => setActiveTab("signup")}
                                        className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${activeTab === "signup"
                                            ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-lg"
                                            : "text-gray-400 hover:text-white"
                                            }`}
                                    >
                                        Sign Up
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("login")}
                                        className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${activeTab === "login"
                                            ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-lg"
                                            : "text-gray-400 hover:text-white"
                                            }`}
                                    >
                                        Log In
                                    </button>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
                                    {activeTab === "signup" && (
                                        <>
                                            <Input
                                                label="Full Name"
                                                name="name"
                                                placeholder="Enter your full name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                leftIcon={<User size={18} />}
                                                required
                                            />

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                                    I am a
                                                </label>
                                                <select
                                                    name="role"
                                                    value={formData.role}
                                                    onChange={handleChange}
                                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors sm:text-sm"
                                                >
                                                    <option value="teacher">Teacher / Lecturer</option>
                                                    <option value="student">Student</option>
                                                </select>
                                            </div>

                                            {/* Image Upload for Students */}
                                            {formData.role === "student" && (
                                                <div className="animate-fade-in-up">
                                                    <ImageUpload
                                                        files={profileImages}
                                                        onFilesChange={(files) => {
                                                            setProfileImages(files);
                                                            if (files.length >= 3) setImageError("");
                                                        }}
                                                        label="Photos"
                                                        error={imageError}
                                                        minFiles={3}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    )}

                                    <Input
                                        label="Email Address"
                                        type="email"
                                        name="email"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        leftIcon={<Mail size={18} />}
                                        required
                                    />

                                    <Input
                                        label="Password"
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        leftIcon={<Lock size={18} />}
                                        required
                                    />

                                    {activeTab === "signup" && (
                                        <Input
                                            label="Confirm Password"
                                            type="password"
                                            name="confirmPassword"
                                            placeholder="Confirm your password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            leftIcon={<Lock size={18} />}
                                            required
                                        />
                                    )}

                                    {activeTab === "login" && (
                                        <div className="flex items-center justify-between text-sm">
                                            <label className="flex items-center text-gray-300 cursor-pointer hover:text-white transition-colors">
                                                <input type="checkbox" className="mr-2 rounded bg-gray-700 border-gray-600 text-violet-600 focus:ring-violet-500" />
                                                Remember me
                                            </label>
                                            <a
                                                href="#"
                                                className="text-violet-400 hover:text-violet-300 transition-colors"
                                            >
                                                Forgot password?
                                            </a>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        isLoading={isLoading}
                                        rightIcon={<ArrowRight size={18} />}
                                        className="w-full py-3 text-lg bg-gradient-to-r from-violet-600 via-pink-600 to-violet-600 hover:from-violet-500 hover:via-pink-500 hover:to-violet-500 border-none shadow-lg shadow-violet-500/30"
                                    >
                                        {activeTab === "signup" ? "Create Account" : "Sign In"}
                                    </Button>

                                    {/* Divider */}
                                    <div className="relative my-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-700"></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-4 bg-gray-800 text-gray-400">
                                                or
                                            </span>
                                        </div>
                                    </div>

                                    {/* Social Login */}
                                    <div className="flex justify-center">
                                        <button
                                            type="button"
                                            className="flex items-center justify-center gap-3 py-3 px-8 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 rounded-xl transition-all w-full max-w-xs text-white"
                                        >
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path
                                                    fill="currentColor"
                                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                />
                                                <path
                                                    fill="currentColor"
                                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                />
                                                <path
                                                    fill="currentColor"
                                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                />
                                                <path
                                                    fill="currentColor"
                                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                />
                                            </svg>
                                            <span className="text-gray-300 font-medium">Continue with Google</span>
                                        </button>
                                    </div>

                                    <div className="text-center mt-6">
                                        <p className="text-sm text-gray-400">
                                            {activeTab === "signup" ? "Already have an account? " : "Don't have an account? "}
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab(activeTab === "signup" ? "login" : "signup")}
                                                className="text-violet-400 hover:text-violet-300 font-medium underline-offset-4 hover:underline"
                                            >
                                                {activeTab === "signup" ? "Sign In" : "Sign Up"}
                                            </button>
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GetStartedPage;
