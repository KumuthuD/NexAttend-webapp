import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import GetStartedPage from './pages/GetStartedPage';
import Footer from './components/Footer';
import TestComponentsPage from './pages/TestComponentsPage';
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <div className="bg-gray-900 text-white min-h-screen font-sans">
                    <Header />
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/get-started" element={<GetStartedPage />} />
                        <Route path="/test-components" element={<TestComponentsPage />} />
                    </Routes>
                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
};

export default App;
