import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import GetStartedPage from './pages/GetStartedPage';
import Footer from './components/Footer';
import TestComponentsPage from './pages/TestComponentsPage';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import StudentRegistrationPage from './pages/StudentRegistrationPage';
import LoginPage from './pages/LoginPage';
import CalendarPage from './pages/CalendarPage';
import ClassroomPage from './pages/ClassroomPage';
import ValidationDemo from './pages/ValidationDemo';
import NotificationPage from './pages/NotificationPage';
import { ThemeProvider } from './contexts/ThemeContext';

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
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <Routes>
                        {/* Public / Marketing Routes */}
                        <Route element={<MarketingLayout />}>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/get-started" element={<GetStartedPage />} />
                            <Route path="/test-components" element={<TestComponentsPage />} />
                            <Route path="/validation-demo" element={<ValidationDemo />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route
                                path="/student-register"
                                element={
                                    <ProtectedRoute>
                                        <StudentRegistrationPage />
                                    </ProtectedRoute>
                                }
                            />
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
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
