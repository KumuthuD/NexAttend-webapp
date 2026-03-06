import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import GetStartedPage from './pages/GetStartedPage';
import Footer from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import CalendarPage from './pages/CalendarPage';
import ClassroomPage from './pages/ClassroomPage';
import NotificationPage from './pages/NotificationPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import SupportPage from './pages/SupportPage';
import AttendanceHistoryPage from './pages/AttendanceHistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ManualReviewPage from './pages/AttendanceReviewPage';
import { ThemeProvider } from './contexts/ThemeContext';
import SplashScreen from './components/common/SplashScreen';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Layout for marketing/public pages
const MarketingLayout = () => {
    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <Header />
            <Outlet />
            <Footer />
        </div>
    );
};



const App: React.FC = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800); // Splash screen duration

        return () => clearTimeout(timer);
    }, []);

    return (
        <ThemeProvider>
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
                <AuthProvider>
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <SplashScreen key="splash" />
                        ) : (
                            <Router key="router">
                                <Routes>
                                    {/* Public / Marketing Routes */}
                                    <Route element={<MarketingLayout />}>
                                        <Route path="/" element={<LandingPage />} />
                                        <Route path="/get-started" element={<GetStartedPage />} />
                                    </Route>

                                    {/* Dashboard Route - Standalone Layout */}
                                    <Route
                                        path="/dashboard"
                                        element={
                                            <ProtectedRoute>
                                                <DashboardPage />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Calendar Route */}
                                    <Route
                                        path="/calendar"
                                        element={
                                            <ProtectedRoute>
                                                <CalendarPage />
                                            </ProtectedRoute>
                                        }
                                    />


                                    {/* Classroom Route */}
                                    <Route
                                        path="/dashboard/classroom/:id"
                                        element={
                                            <ProtectedRoute>
                                                <ClassroomPage />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Notification Route */}
                                    <Route
                                        path="/notifications"
                                        element={
                                            <ProtectedRoute>
                                                <NotificationPage />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Support Route */}
                                    <Route
                                        path="/support"
                                        element={
                                            <ProtectedRoute>
                                                <SupportPage />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Settings Route */}
                                    <Route
                                        path="/settings"
                                        element={
                                            <ProtectedRoute>
                                                <SettingsPage />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Attendance History Route */}
                                    <Route
                                        path="/attendance-history"
                                        element={
                                            <ProtectedRoute>
                                                <AttendanceHistoryPage />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Analytics Route */}
                                    <Route
                                        path="/analytics"
                                        element={
                                            <ProtectedRoute>
                                                <AnalyticsPage />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Manual Review Route (per-classroom, per-session) */}
                                    <Route
                                        path="/manual-review/:classroomId/:sessionId"
                                        element={
                                            <ProtectedRoute>
                                                <ManualReviewPage />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Profile Route */}
                                    <Route
                                        path="/profile"
                                        element={
                                            <ProtectedRoute>
                                                <ProfilePage />
                                            </ProtectedRoute>
                                        }
                                    />
                                </Routes>
                            </Router>
                        )}
                    </AnimatePresence>
                </AuthProvider>
            </GoogleOAuthProvider>
        </ThemeProvider>
    );
};

export default App;
