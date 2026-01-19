import React, { useState } from 'react';
import { InstagramIcon, LinkedInIcon, XIcon } from '../components/icons';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log(formData);
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10">
                {/* Gradient base */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900"></div>

                {/* Floating Orbs */}
                <div className="orb orb-purple w-[600px] h-[600px] -top-60 -left-60 animate-float-slow opacity-40"></div>
                <div className="orb orb-pink w-[500px] h-[500px] top-1/2 -right-60 animate-float opacity-30"></div>
                <div className="orb orb-blue w-[400px] h-[400px] -bottom-40 left-1/3 animate-float-reverse opacity-30"></div>

                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
                        `,
                        backgroundSize: '60px 60px'
                    }}
                ></div>
            </div>

            <div className="container mx-auto px-4 py-20">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="animate-fade-in-down stagger-1 inline-block mb-6">
                        <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-violet-500/30 text-violet-300 text-sm font-medium backdrop-blur-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                            </span>
                            We're here to help
                        </span>
                    </div>

                    <h1 className="animate-fade-in-up stagger-2 text-5xl md:text-6xl lg:text-7xl font-black mb-6">
                        <span className="text-white">Let's </span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-violet-400 animate-pulse-scale inline-block">Connect</span>
                    </h1>

                    <p className="animate-fade-in-up stagger-3 text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Have questions about NexAttend? Want a demo?
                        <span className="text-white font-medium"> We'd love to hear from you.</span>
                    </p>
                </div>

                {/* Main Content */}
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-5 gap-8">

                        {/* Left Side - Contact Info Cards */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Quick Stats */}
                            <div className="animate-fade-in-left stagger-4 glass-card rounded-3xl p-8 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-pink-500 to-violet-500"></div>
                                <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-all duration-700"></div>

                                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    Quick Response
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group/item cursor-pointer">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">Response Time</p>
                                            <p className="text-white font-bold text-lg">Under 24 hours</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group/item cursor-pointer">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">Support Available</p>
                                            <p className="text-white font-bold text-lg">24/7 Chat Support</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Methods */}
                            <div className="animate-fade-in-left stagger-5 glass-card rounded-3xl p-8 relative overflow-hidden group">
                                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl group-hover:bg-pink-500/20 transition-all duration-700"></div>

                                <h3 className="text-xl font-bold text-white mb-6">Reach Us Directly</h3>

                                <div className="space-y-4">
                                    <a href="mailto:hello@nexattend.com" className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-violet-500/10 hover:to-pink-500/10 transition-all group/item border border-transparent hover:border-violet-500/30">
                                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover/item:scale-110 group-hover/item:rotate-6 transition-all">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">Email Us</p>
                                            <p className="text-white font-semibold group-hover/item:text-violet-300 transition-colors">hello@nexattend.com</p>
                                        </div>
                                    </a>

                                    <a href="tel:+94771234567" className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-violet-500/10 hover:to-pink-500/10 transition-all group/item border border-transparent hover:border-violet-500/30">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 group-hover/item:scale-110 group-hover/item:-rotate-6 transition-all">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">Call Us</p>
                                            <p className="text-white font-semibold group-hover/item:text-green-300 transition-colors">+94 77 123 4567</p>
                                        </div>
                                    </a>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="animate-fade-in-left stagger-6 glass-card rounded-3xl p-8">
                                <h3 className="text-xl font-bold text-white mb-6">Follow Our Journey</h3>

                                <div className="flex gap-4">
                                    <a href="#" className="group flex-1 p-4 rounded-2xl bg-white/5 hover:bg-gradient-to-br hover:from-pink-500/20 hover:to-purple-500/20 transition-all duration-300 border border-transparent hover:border-pink-500/30 flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
                                            <InstagramIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="text-gray-400 text-sm group-hover:text-pink-300 transition-colors">Instagram</span>
                                    </a>

                                    <a href="#" className="group flex-1 p-4 rounded-2xl bg-white/5 hover:bg-gradient-to-br hover:from-blue-500/20 hover:to-cyan-500/20 transition-all duration-300 border border-transparent hover:border-blue-500/30 flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:-rotate-6 transition-all shadow-lg">
                                            <LinkedInIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="text-gray-400 text-sm group-hover:text-blue-300 transition-colors">LinkedIn</span>
                                    </a>

                                    <a href="#" className="group flex-1 p-4 rounded-2xl bg-white/5 hover:bg-gradient-to-br hover:from-gray-500/20 hover:to-gray-400/20 transition-all duration-300 border border-transparent hover:border-gray-500/30 flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-500 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
                                            <XIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">Twitter</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Contact Form */}
                        <div className="lg:col-span-3 animate-fade-in-right stagger-4">
                            <div className="glass-card rounded-3xl p-8 md:p-10 relative overflow-hidden">
                                {/* Decorative elements */}
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-500 via-pink-500 to-violet-500"></div>
                                <div className="absolute -top-32 -right-32 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl"></div>
                                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl md:text-3xl font-bold text-white">Send us a message</h2>
                                            <p className="text-gray-400">We'll get back to you within 24 hours</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {/* Name Input */}
                                            <div className="group">
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-violet-400 transition-colors">
                                                    Your Name <span className="text-pink-400">*</span>
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <svg className="w-5 h-5 text-gray-500 group-focus-within:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        id="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        placeholder="John Doe"
                                                        className="w-full bg-white/5 border-2 border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:bg-white/10 transition-all duration-300"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Email Input */}
                                            <div className="group">
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-violet-400 transition-colors">
                                                    Email Address <span className="text-pink-400">*</span>
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <svg className="w-5 h-5 text-gray-500 group-focus-within:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        id="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        placeholder="john@example.com"
                                                        className="w-full bg-white/5 border-2 border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:bg-white/10 transition-all duration-300"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Subject Select */}
                                        <div className="group">
                                            <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-violet-400 transition-colors">
                                                What's this about?
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg className="w-5 h-5 text-gray-500 group-focus-within:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                    </svg>
                                                </div>
                                                <select
                                                    name="subject"
                                                    id="subject"
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    className="w-full bg-white/5 border-2 border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-violet-500 focus:bg-white/10 transition-all duration-300 appearance-none cursor-pointer"
                                                >
                                                    <option value="" className="bg-gray-900">Select a topic...</option>
                                                    <option value="demo" className="bg-gray-900">Request a Demo</option>
                                                    <option value="pricing" className="bg-gray-900">Pricing Inquiry</option>
                                                    <option value="support" className="bg-gray-900">Technical Support</option>
                                                    <option value="partnership" className="bg-gray-900">Partnership Opportunity</option>
                                                    <option value="other" className="bg-gray-900">Other</option>
                                                </select>
                                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Message Textarea */}
                                        <div className="group">
                                            <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-violet-400 transition-colors">
                                                Your Message <span className="text-pink-400">*</span>
                                            </label>
                                            <div className="relative">
                                                <textarea
                                                    name="message"
                                                    id="message"
                                                    rows={5}
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    placeholder="Tell us how we can help you..."
                                                    className="w-full bg-white/5 border-2 border-white/10 rounded-xl py-4 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:bg-white/10 transition-all duration-300 resize-none"
                                                    required
                                                ></textarea>
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            className="group w-full bg-gradient-to-r from-violet-600 via-pink-600 to-violet-600 hover:from-violet-500 hover:via-pink-500 hover:to-violet-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 text-lg relative overflow-hidden"
                                        >
                                            {/* Shimmer effect */}
                                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                                            <span className="relative z-10">Send Message</span>
                                            <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Decorative Section */}
                <div className="mt-20 text-center animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-sm">Your information is secure and encrypted</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
