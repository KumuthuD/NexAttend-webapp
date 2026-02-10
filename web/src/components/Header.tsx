import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogoIcon, Bars3Icon, XMarkIcon } from './icons';

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);

            // Only track sections on the home page
            if (location.pathname === '/') {
                const sections = ['home', 'features', 'pricing', 'about', 'contact'];
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
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [location.pathname]);

    const scrollToSection = (sectionId: string) => {
        setIsMobileMenuOpen(false);

        // If not on home page, navigate first then scroll
        if (location.pathname !== '/') {
            navigate('/');
            // Wait for navigation then scroll
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        } else {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    const goToGetStarted = () => {
        setIsMobileMenuOpen(false);
        navigate('/get-started');
    };

    const navLinks = [
        { id: 'home', label: 'Home' },
        { id: 'features', label: 'Features' },
        { id: 'pricing', label: 'Pricing' },
        { id: 'about', label: 'About' },
        { id: 'contact', label: 'Contact' },
    ];

    return (
        <>
            {/* Dynamic Island Navigation */}
            <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4">
                <nav
                    className={`
                        relative flex items-center gap-2 md:gap-6 
                        px-4 md:px-6 py-2.5 md:py-3
                        bg-gray-900/80 backdrop-blur-xl
                        border border-white/10
                        rounded-full
                        shadow-2xl shadow-black/20
                        transition-all duration-500 ease-out
                        ${isScrolled ? 'bg-gray-900/95 border-white/15 shadow-violet-500/10 px-8 md:px-12' : ''}
                        ${isHovered ? 'scale-[1.02] border-violet-500/30' : ''}
                    `}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Glow effect behind */}
                    <div className={`
                        absolute inset-0 rounded-full opacity-0 transition-opacity duration-500
                        bg-gradient-to-r from-violet-600/20 via-pink-600/20 to-violet-600/20 blur-xl
                        ${isHovered ? 'opacity-100' : ''}
                    `}></div>

                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <LogoIcon className="w-7 h-7 md:w-8 md:h-8 mr-0" />
                        <span className="hidden sm:block text-base font-bold text-white">
                            NexAttend
                        </span>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-px h-6 bg-white/10"></div>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <button
                                key={link.id}
                                onClick={() => scrollToSection(link.id)}
                                className={`
                                    relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300
                                    ${activeSection === link.id && location.pathname === '/'
                                        ? 'text-white bg-white/10'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }
                                `}
                            >
                                {link.label}
                                {activeSection === link.id && location.pathname === '/' && (
                                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-violet-400 rounded-full"></span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden relative z-10 p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <XMarkIcon className="w-6 h-6" />
                        ) : (
                            <Bars3Icon className="w-6 h-6" />
                        )}
                    </button>
                </nav>
            </header>

            {/* Mobile Menu Overlay */}
            <div className={`
                fixed inset-0 z-40 bg-gray-900/98 backdrop-blur-xl
                flex flex-col items-center justify-center
                transition-all duration-500
                ${isMobileMenuOpen
                    ? 'opacity-100 pointer-events-auto'
                    : 'opacity-0 pointer-events-none'
                }
            `}>
                {/* Close button */}
                <button
                    className="absolute top-6 right-6 p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <XMarkIcon className="w-7 h-7" />
                </button>

                {/* Mobile Nav Links */}
                <div className="flex flex-col items-center gap-4">
                    {navLinks.map((link, index) => (
                        <button
                            key={link.id}
                            onClick={() => scrollToSection(link.id)}
                            className={`
                                text-3xl font-bold transition-all duration-300
                                ${activeSection === link.id && location.pathname === '/'
                                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400'
                                    : 'text-gray-400 hover:text-white'
                                }
                            `}
                            style={{
                                transitionDelay: `${index * 50}ms`,
                                transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(20px)',
                                opacity: isMobileMenuOpen ? 1 : 0,
                            }}
                        >
                            {link.label}
                        </button>
                    ))}

                    {/* Mobile CTA */}
                    <button
                        onClick={goToGetStarted}
                        className="mt-8 px-10 py-4 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white text-lg font-bold rounded-full transition-all transform hover:scale-105 shadow-lg shadow-violet-500/30 flex items-center gap-3"
                        style={{
                            transitionDelay: '200ms',
                            transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(20px)',
                            opacity: isMobileMenuOpen ? 1 : 0,
                        }}
                    >
                        Get Started
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </button>
                </div>

                {/* Decorative orbs */}
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl"></div>
            </div>
        </>
    );
};

export default Header;