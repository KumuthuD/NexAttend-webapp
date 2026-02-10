import React, { useState, useEffect } from "react";

import Input from "../components/common/Input";
import Button from "../components/common/Button";
import ImageUpload from "../components/common/ImageUpload";
import { useAuth } from "../contexts/AuthContext";

import { User, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import Alert from "../components/Alert";

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
    const [authError, setAuthError] = useState<string>("");
    const [authSuccess, setAuthSuccess] = useState<string>("");
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Reset states
        setImageError("");
        setAuthError("");
        setAuthSuccess("");
        setValidationErrors({});

        // Client-side validation
        const errors: Record<string, string> = {};

        if (activeTab === "signup") {
            if (formData.password !== formData.confirmPassword) {
                errors.confirmPassword = "Passwords do not match";
            }

            if (formData.role === "student" && profileImages.length < 3) {
                setImageError("Please upload at least 3 profile photos for face recognition setup.");
                return;
            }
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        try {
            if (activeTab === "signup") {
                await register({
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    password: formData.password,
                }, profileImages);
                setAuthSuccess("Account created successfully! Redirecting...");
            } else {
                await login(formData.email, formData.password);
                setAuthSuccess("Login successful! Redirecting...");
            }

            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (error: any) {
            console.error("Authentication failed", error);
            // Extract error message from API response
            const errorMessage = error.response?.data?.detail || error.message || "Authentication failed. Please check your credentials and try again.";
            setAuthError(errorMessage);
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
                    <div className="flex justify-center items-center">
                        {/* Auth Form - Centered */}
                        <div className="w-full max-w-md animate-fade-in-up">
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

                                {/* Feedback Messages */}
                                <div className="relative z-10 mb-6 space-y-3">
                                    {authError && (
                                        <Alert
                                            type="error"
                                            message={authError}
                                            dismissible
                                            onDismiss={() => setAuthError("")}
                                        />
                                    )}
                                    {authSuccess && (
                                        <Alert
                                            type="success"
                                            message={authSuccess}
                                        />
                                    )}
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
                                        error={validationErrors.email}
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
                                            error={validationErrors.confirmPassword}
                                            required
                                        />
                                    )}

                                    {activeTab === "login" && (
                                        <div className="flex items-center justify-between text-sm">
                                            <label className="flex items-center text-gray-300 cursor-pointer hover:text-white transition-colors">
                                                <input type="checkbox" className="mr-2 rounded bg-gray-700 border-gray-600 text-violet-600 focus:ring-violet-500" />
                                                Remember me
                                            </label>
                                            <Link
                                                to="/forgot-password"
                                                className="text-violet-400 hover:text-violet-300 transition-colors"
                                            >
                                                Forgot password?
                                            </Link>
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
