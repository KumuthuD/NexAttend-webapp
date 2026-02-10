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
import ClassroomPage from './pages/ClassroomPage';

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
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public / Marketing Routes */}
                    <Route element={<MarketingLayout />}>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/get-started" element={<GetStartedPage />} />
                        <Route path="/test-components" element={<TestComponentsPage />} />
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

                    {/* Classroom Route */}
                    <Route
                        path="/dashboard/classroom/:id"
                        element={
                            <ProtectedRoute>
                                <ClassroomPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
