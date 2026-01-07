import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LogoIcon, Bars3Icon, XMarkIcon } from './icons';

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const isWebPage = location.pathname === '/webpage';

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `cursor-pointer text-gray-300 hover:text-violet-400 transition-colors ${isActive ? 'text-violet-400 font-semibold' : ''}`;

    const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
        `cursor-pointer text-lg py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors ${isActive ? 'text-violet-400 font-semibold bg-gray-800/50' : 'text-gray-300'}`;

    return (
        <header className={`${isWebPage ? 'fixed' : 'sticky'} top-0 left-0 right-0 p-4 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800`}>
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 cursor-pointer">
                    <LogoIcon className="w-10 h-10" />
                    <span className="text-xl font-bold text-white">NexAttend</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                    <NavLink to="/features" className={navLinkClass}>Features</NavLink>
                    <NavLink to="/about" className={navLinkClass}>About Us</NavLink>
                    <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-gray-300 hover:text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? (
                        <XMarkIcon className="w-8 h-8" />
                    ) : (
                        <Bars3Icon className="w-8 h-8" />
                    )}
                </button>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-gray-900 border-b border-gray-800 p-4 flex flex-col space-y-4 shadow-xl animate-fade-in-down">
                    <NavLink
                        to="/features"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={mobileNavLinkClass}
                    >
                        Features
                    </NavLink>
                    <NavLink
                        to="/about"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={mobileNavLinkClass}
                    >
                        About Us
                    </NavLink>
                    <NavLink
                        to="/contact"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={mobileNavLinkClass}
                    >
                        Contact
                    </NavLink>
                </div>
            )}
        </header>
    );
};

export default Header;