import React from 'react';
import { LogoIcon, InstagramIcon, LinkedInIcon, YoutubeIcon } from './icons';

const Footer = () => {
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <footer className="relative bg-gray-900 border-t border-gray-800">
            {/* Gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"></div>

            <div className="container mx-auto py-16 px-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    {/* Brand Section */}
                    <div className="md:col-span-5 flex flex-col items-center">
                        <button
                            onClick={() => scrollToSection('home')}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <LogoIcon className="w-12 h-12 group-hover:scale-110 transition-transform" />
                            <h2 className="text-2xl font-bold text-white group-hover:text-violet-400 transition-colors">NexAttend</h2>
                            <p className="text-sm text-gray-500">AI-Powered Attendance System</p>
                        </button>
                        <p className="mt-6 text-gray-400 max-w-sm leading-relaxed text-center">
                            Transforming classroom management with AI-powered face recognition and intelligent analytics.
                        </p>
                        <div className="flex space-x-3 mt-6 justify-center">
                            <a
                                href="https://www.instagram.com/nexattend"
                                className="w-11 h-11 glass-card rounded-xl flex items-center justify-center text-gray-400 hover:text-pink-400 hover:border-pink-500/30 transition-all"
                            >
                                <InstagramIcon className="w-5 h-5" />
                            </a>
                            <a
                                href="https://www.linkedin.com/company/nexattend/"
                                className="w-11 h-11 glass-card rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-400 hover:border-blue-500/30 transition-all"
                            >
                                <LinkedInIcon className="w-5 h-5" />
                            </a>
                            <a
                                href="https://www.youtube.com/@Nexattend"
                                className="w-11 h-11 glass-card rounded-xl flex items-center justify-center text-gray-400 hover:text-red-400 hover:border-red-500/30 transition-all"
                            >
                                <YoutubeIcon className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links Section */}
                    <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="font-bold text-white mb-4">Quick Links</h3>
                            <ul className="space-y-3">
                                <li>
                                    <button onClick={() => scrollToSection('home')} className="text-gray-400 hover:text-violet-400 text-sm transition-colors">
                                        Home
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => scrollToSection('features')} className="text-gray-400 hover:text-violet-400 text-sm transition-colors">
                                        Features
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => scrollToSection('about')} className="text-gray-400 hover:text-violet-400 text-sm transition-colors">
                                        About Us
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => scrollToSection('contact')} className="text-gray-400 hover:text-violet-400 text-sm transition-colors">
                                        Contact
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-white mb-4">Features</h3>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-gray-400 hover:text-violet-400 text-sm transition-colors">Face Recognition</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-violet-400 text-sm transition-colors">Analytics</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-violet-400 text-sm transition-colors">LMS Integration</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-violet-400 text-sm transition-colors">Reports</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-white mb-4">Support</h3>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-gray-400 hover:text-violet-400 text-sm transition-colors">Help Center</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-violet-400 text-sm transition-colors">Documentation</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-violet-400 text-sm transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-violet-400 text-sm transition-colors">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col justify-center items-center gap-4">
                    <p className="text-gray-500 text-sm">
                        © 2026 NexAttend. All rights reserved.
                    </p>
                    <p className="text-gray-500 text-sm">
                        Made with <span className="text-pink-500">♥</span> by the NexAttend Team
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;