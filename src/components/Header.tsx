import React, { useState, useEffect } from 'react';
import { LogoIcon, Bars3Icon, XMarkIcon } from './icons';

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('home');

    // Handle scroll effects
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);

            // Update active section based on scroll position
            const sections = ['home', 'features', 'about', 'contact'];
            for (const section of sections.reverse()) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 100) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setIsMobileMenuOpen(false);
    };

    const navLinks = [
        { id: 'home', label: 'Home' },
        { id: 'features', label: 'Features' },
        { id: 'about', label: 'About Us' },
        { id: 'contact', label: 'Contact' },
    ];

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'py-3 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800 shadow-lg'
                : 'py-4 bg-transparent'
            }`}>
            <div className="container mx-auto px-4 flex justify-between items-center">
                {/* Logo */}
                <button
                    onClick={() => scrollToSection('home')}
                    className="flex items-center gap-2 cursor-pointer group"
                >
                    <LogoIcon className="w-10 h-10 group-hover:scale-110 transition-transform" />
                    <span className="text-xl font-bold text-white group-hover:text-violet-400 transition-colors">
                        NexAttend
                    </span>
                </button>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-1">
                    {navLinks.map((link) => (
                        <button
                            key={link.id}
                            onClick={() => scrollToSection(link.id)}
                            className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg ${activeSection === link.id
                                    ? 'text-violet-400'
                                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {link.label}
                            {activeSection === link.id && (
                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-violet-400 rounded-full"></span>
                            )}
                        </button>
                    ))}

                    {/* CTA Button */}
                    <button
                        onClick={() => scrollToSection('contact')}
                        className="ml-4 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white text-sm font-bold rounded-full transition-all transform hover:scale-105 shadow-lg shadow-violet-500/25"
                    >
                        Get Started
                    </button>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-gray-300 hover:text-white p-2"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? (
                        <XMarkIcon className="w-7 h-7" />
                    ) : (
                        <Bars3Icon className="w-7 h-7" />
                    )}
                </button>
            </div>

            {/* Mobile Navigation Menu */}
            <div className={`md:hidden absolute top-full left-0 right-0 bg-gray-900/98 backdrop-blur-lg border-b border-gray-800 transition-all duration-300 ${isMobileMenuOpen
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 -translate-y-4 pointer-events-none'
                }`}>
                <div className="container mx-auto px-4 py-4 flex flex-col space-y-2">
                    {navLinks.map((link) => (
                        <button
                            key={link.id}
                            onClick={() => scrollToSection(link.id)}
                            className={`text-left text-lg py-3 px-4 rounded-xl transition-all ${activeSection === link.id
                                    ? 'text-violet-400 bg-violet-500/10 font-semibold'
                                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {link.label}
                        </button>
                    ))}

                    <button
                        onClick={() => scrollToSection('contact')}
                        className="mt-4 w-full py-4 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all text-lg"
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;