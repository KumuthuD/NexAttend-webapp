import React from 'react';
import { Link } from 'react-router-dom';
import FeatureCard from '../components/FeatureCard';
import demoVideo from '../components/nexattend-demo.mp4';
import { CheckCircleIcon, BrainIcon, ShieldCheckIcon, UsersIcon } from '../components/icons';

const LandingPage = () => {
    const homeFeatures = [
        { icon: <CheckCircleIcon className="w-8 h-8 text-white" />, title: "Automated Accuracy", description: "AI Face Recognition for foolproof, fast attendance." },
        { icon: <BrainIcon className="w-8 h-8 text-white" />, title: "Data-Driven Decisions", description: "Gain deep insights with detailed attendance analytics." },
        { icon: <ShieldCheckIcon className="w-8 h-8 text-white" />, title: "Secure & Compliant", description: "Data is protected with advanced safeguards." },
        { icon: <UsersIcon className="w-8 h-8 text-white" />, title: "Engaged Students", description: "Increase classroom interaction and focus." }
    ];

    return (
        <div className="relative min-h-screen flex flex-col">
            {/* Background Video Section */}
            <div className="relative w-full h-screen overflow-hidden">
                {/* Video Background */}
                <video
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    src={demoVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                />

                {/* Dark Overlay for Text Readability */}
                <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10"></div>

                {/* Hero Content */}
                <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
                    <h1
                        className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-500 drop-shadow-lg animate-fade-in-up"
                        style={{ animationDelay: '0.1s' }}
                    >
                        NexAttend: Effortless Attendance.
                    </h1>
                   
                </div>
            </div>

            {/* Features Section (Below the fold) */}
            <div className="bg-gray-900 py-24">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {homeFeatures.map((feature, index) => (
                            <div
                                key={feature.title}
                                className="opacity-0 animate-fade-in-up"
                                style={{ animationDelay: `${0.2 + index * 0.2}s` }}
                            >
                                <FeatureCard {...feature} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;

