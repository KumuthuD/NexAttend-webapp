import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import Footer from './components/Footer';

const App: React.FC = () => {
    return (
        <Router>
            <div className="bg-gray-900 text-white min-h-screen font-sans">
                <Header />
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                </Routes>
                <Footer />
            </div>
        </Router>
    );
};

export default App;
