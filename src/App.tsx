import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import WebPage from './pages/WebPage';
import Footer from './components/Footer';

const Layout = () => {
    const location = useLocation();

    const showFooter = location.pathname !== '/webpage';

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <Header />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/webpage" element={<WebPage />} />
            </Routes>
            {showFooter && <Footer />}
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
