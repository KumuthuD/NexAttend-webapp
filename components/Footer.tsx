import React from 'react';
import { Link } from 'react-router-dom';
import { LogoIcon, InstagramIcon, LinkedInIcon, XIcon } from './icons';

const Footer = () => (
    <footer className="bg-violet-900/40 border-t border-violet-900/50">
        <div className="container mx-auto py-12 px-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-4">
                    <div className="flex items-center gap-2">
                        <LogoIcon className="w-10 h-10" />
                        <h2 className="text-2xl font-bold text-white">NexAttend</h2>
                    </div>
                    <div className="flex space-x-4 mt-4">
                        <a href="https://www.instagram.com/nexattend" className="text-gray-400 hover:text-white transition-colors"><InstagramIcon className="w-6 h-6" /></a>
                        <a href="https://www.linkedin.com/company/nexattend/" className="text-gray-400 hover:text-white transition-colors"><LinkedInIcon className="w-6 h-6" /></a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors"><XIcon className="w-6 h-6" /></a>
                    </div>
                </div>
                <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="font-semibold text-white">Features</h3>
                        <ul className="mt-4 space-y-2">
                            <li><Link to="/features" className="cursor-pointer text-gray-400 hover:text-white text-sm transition-colors">Core features</Link></li>
                            <li><Link to="/features" className="cursor-pointer text-gray-400 hover:text-white text-sm transition-colors">Pro experience</Link></li>
                            <li><Link to="/features" className="cursor-pointer text-gray-400 hover:text-white text-sm transition-colors">Integrations</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Learn more</h3>
                        <ul className="mt-4 space-y-2">
                            <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Blog</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Case studies</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Customer stories</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Best practices</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Support</h3>
                        <ul className="mt-4 space-y-2">
                            <li><Link to="/contact" className="cursor-pointer text-gray-400 hover:text-white text-sm transition-colors">Contact</Link></li>
                            <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Support</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Legal</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;
