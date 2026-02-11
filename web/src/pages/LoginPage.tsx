import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get the return URL from location state or default to dashboard
    const from = (location.state as any)?.from?.pathname || '/dashboard';

    const handleLogin = async (role: 'teacher' | 'student') => {
        // In a real app, you would have a form for email/password
        // For this dev/demo page, we're just calling login with hardcoded credentials
        // or just the email if the backend mock supports it.
        // Based on AuthContext, it expects email AND password.
        try {
            await login(`${role}@example.com`, 'password');
            navigate(from, { replace: true });
        } catch (error) {
            console.error("Login failed:", error);
            alert("Login failed. Check console/backend.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8">
            <h1 className="text-3xl font-bold text-white">Login (Dev Mode)</h1>
            <div className="flex space-x-4">
                <button
                    onClick={() => handleLogin('teacher')}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
                >
                    Login as Teacher
                </button>
                <button
                    onClick={() => handleLogin('student')}
                    className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-colors"
                >
                    Login as Student
                </button>
            </div>
            <p className="text-gray-400">Select a role to test the Dashboard.</p>
        </div>
    );
};

export default LoginPage;
