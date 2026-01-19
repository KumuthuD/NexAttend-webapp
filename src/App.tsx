import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import Footer from './components/Footer';

const Layout = () => {
    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <Header />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
            </Routes>
            <Footer />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <Router>
            <Layout />
        </Router>
    );
};

export default App;
