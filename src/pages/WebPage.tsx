import React from 'react';
import { Link } from 'react-router-dom';
import demoVideo from '../assets/videos/signup-page.mp4';

const WebPage = () => {
    return (
        <div className="relative h-screen flex flex-col overflow-hidden">
            {/* Background Video Section */}
            <div className="relative w-full h-full overflow-hidden">
                {/* Video Background */}
                <video
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    src={demoVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                />

                {/* Multi-layer Overlay */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900/80 via-gray-900/70 to-purple-900/50 z-10"></div>

                {/* Floating Gradient Orbs */}
                <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                    <div className="orb orb-purple w-[500px] h-[500px] -top-40 -left-40 animate-float-slow"></div>
                    <div className="orb orb-pink w-[400px] h-[400px] top-1/3 -right-32 animate-float"></div>
                    <div className="orb orb-blue w-80 h-80 bottom-0 left-1/3 animate-float-reverse"></div>
                </div>

                {/* Animated Grid Background Overlay */}
                <div
                    className="absolute inset-0 z-10 pointer-events-none"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, rgba(139, 92, 246, 0.08) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(139, 92, 246, 0.08) 1px, transparent 1px)
                        `,
                        backgroundSize: '80px 80px'
                    }}
                ></div>

                {/* Floating Decorative Shapes */}
                <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                    {/* Rotating ring */}
                    <div className="absolute top-20 right-20 w-32 h-32 border border-violet-500/20 rounded-full animate-spin-slow"></div>
                    <div className="absolute top-24 right-24 w-24 h-24 border border-pink-500/20 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>

                    {/* Floating squares */}
                    <div className="absolute bottom-32 left-20 w-16 h-16 border border-violet-400/20 rotate-45 animate-float"></div>
                    <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-gradient-to-br from-violet-500/10 to-pink-500/10 rotate-12 animate-float-reverse rounded-lg"></div>
                </div>

                {/* Hero Content */}
                <div className="relative z-20 container mx-auto px-6 md:px-12 h-full flex flex-col justify-center items-start text-left">
                    {/* Decorative badge */}
                    <div className="animate-fade-in-left stagger-1 mb-4">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-medium backdrop-blur-sm">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            Live Demo Available
                        </span>
                    </div>

                    <h1
                        className="animate-fade-in-up stagger-2 text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-indigo-400 drop-shadow-lg"
                    >
                        NexAttend
                    </h1>
                    <h2
                        className="animate-fade-in-up stagger-3 text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-8 text-indigo-200 drop-shadow-md"
                    >
                        Intelligent Insights - <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">Smarter Classrooms.</span>
                    </h2>
                    <p
                        className="animate-fade-in-up stagger-4 max-w-2xl text-lg md:text-xl text-gray-300 mb-10 drop-shadow leading-relaxed"
                    >
                        Automate attendance with AI Multi-Face Detection and transform the teaching experience with real-time insights.
                    </p>
                    <div
                        className="animate-fade-in-up stagger-5 flex flex-col sm:flex-row gap-4"
                    >
                        <Link
                            to="#"
                            className="group btn-glow bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white font-bold py-4 px-10 rounded-2xl transition-all transform hover:scale-105 shadow-xl shadow-violet-500/30 text-lg flex items-center gap-3"
                        >
                            Sign up for free
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                        <Link
                            to="/features"
                            className="group bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/20 hover:border-violet-400/50 text-white font-bold py-4 px-8 rounded-2xl transition-all transform hover:scale-105 text-lg flex items-center gap-2"
                        >
                            Learn More
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>

                    {/* Stats or trust indicators */}
                    <div className="animate-fade-in-up stagger-6 mt-16 flex flex-wrap gap-8 md:gap-12">
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">99%</div>
                            <div className="text-sm text-gray-400 mt-1">Accuracy Rate</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">50+</div>
                            <div className="text-sm text-gray-400 mt-1">Schools Trust Us</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">10k+</div>
                            <div className="text-sm text-gray-400 mt-1">Students Managed</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WebPage;
