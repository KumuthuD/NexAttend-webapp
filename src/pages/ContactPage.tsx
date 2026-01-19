import React from 'react';
import ContactImg from '../assets/images/Contact.png';
import { InstagramIcon, LinkedInIcon, XIcon } from '../components/icons';

const ContactPage = () => (
    <div className="relative py-20 px-4 container mx-auto overflow-hidden">
        {/* Floating Gradient Orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
            <div className="orb orb-purple w-96 h-96 -top-40 -left-40 animate-float-slow"></div>
            <div className="orb orb-pink w-80 h-80 bottom-0 -right-40 animate-float"></div>
            <div className="orb orb-blue w-64 h-64 top-1/2 right-1/4 animate-float-reverse"></div>
        </div>

        {/* Section Header */}
        <div className="text-center mb-16">
            <div className="animate-fade-in-down stagger-1">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-sm font-medium mb-6">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Us
                </span>
            </div>
            <h2 className="animate-fade-in-up stagger-2 text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-violet-400 to-pink-400 mb-4">
                Get In Touch
            </h2>
            <p className="animate-fade-in-up stagger-3 text-xl text-gray-400 max-w-2xl mx-auto">
                We'd love to hear from you. Reach out with questions or for a demo.
            </p>
            {/* Animated underline */}
            <div className="animate-fade-in stagger-4 mt-6 flex justify-center">
                <div className="w-32 h-1 bg-gradient-to-r from-pink-500 via-violet-500 to-pink-500 rounded-full"></div>
            </div>
        </div>

        {/* Contact Card */}
        <div className="animate-fade-in-up stagger-5 max-w-6xl mx-auto glass-card rounded-3xl overflow-hidden flex flex-col lg:flex-row">
            {/* Left Side - Image */}
            <div className="lg:w-5/12 relative h-64 lg:h-auto">
                <img
                    src={ContactImg}
                    alt="AI Technology"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-gray-900 via-gray-900/50 to-transparent"></div>

                {/* Overlay content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 lg:hidden">
                    <h3 className="text-2xl font-bold text-white mb-2">Let's Connect</h3>
                    <p className="text-gray-300 text-sm">We're here to help transform your classroom.</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="lg:w-7/12 p-8 md:p-12 relative">
                {/* Decorative element */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-pink-500 to-violet-500"></div>

                <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">CONTACT US</h3>
                <p className="text-gray-400 mb-8">Fill out the form and we'll get back to you within 24 hours.</p>

                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                    <div className="group">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-violet-400 transition-colors">
                            Full Name
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="name"
                                id="name"
                                placeholder="Enter your name"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white/10 transition-all duration-300"
                            />
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500/0 via-violet-500/0 to-pink-500/0 group-focus-within:from-violet-500/5 group-focus-within:to-pink-500/5 -z-10 transition-all duration-300"></div>
                        </div>
                    </div>

                    <div className="group">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-violet-400 transition-colors">
                            Email Address
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                id="email"
                                placeholder="Enter your email"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white/10 transition-all duration-300"
                            />
                        </div>
                    </div>

                    <div className="group">
                        <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-violet-400 transition-colors">
                            Your Message
                        </label>
                        <textarea
                            name="message"
                            id="message"
                            rows={5}
                            placeholder="Tell us how we can help..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white/10 transition-all duration-300 resize-none"
                        ></textarea>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="group btn-glow w-full bg-gradient-to-r from-violet-600 via-pink-600 to-violet-600 hover:from-violet-500 hover:via-pink-500 hover:to-violet-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-violet-500/30 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-lg flex items-center justify-center gap-2"
                        >
                            Send Message
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>

        {/* Social Links Section */}
        <div className="animate-fade-in-up stagger-6 mt-16 text-center">
            <p className="text-gray-400 text-lg mb-8">
                Or connect with us on social media
            </p>
            <div className="flex justify-center gap-4">
                <a
                    href="#"
                    className="group w-14 h-14 glass-card glass-card-hover rounded-2xl flex items-center justify-center text-gray-400 hover:text-pink-400 transition-all duration-300"
                >
                    <InstagramIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </a>
                <a
                    href="#"
                    className="group w-14 h-14 glass-card glass-card-hover rounded-2xl flex items-center justify-center text-gray-400 hover:text-blue-400 transition-all duration-300"
                >
                    <LinkedInIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </a>
                <a
                    href="#"
                    className="group w-14 h-14 glass-card glass-card-hover rounded-2xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
                >
                    <XIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </a>
                <a
                    href="mailto:contact@nexattend.com"
                    className="group w-14 h-14 glass-card glass-card-hover rounded-2xl flex items-center justify-center text-gray-400 hover:text-violet-400 transition-all duration-300"
                >
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </a>
            </div>
        </div>
    </div>
);

export default ContactPage;
