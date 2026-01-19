import React from 'react';
import FeatureCard from '../components/FeatureCard';
import {
    CameraIcon,
    BrainIcon,
    ShieldCheckIcon,
    UsersIcon,
    CodeBracketIcon,
    ChartBarIcon,
    ClockIcon,
    SparklesIcon
} from '../components/icons';

const FeaturesPage = () => {
    const features = [
        {
            icon: <CameraIcon className="w-8 h-8 text-white" />,
            title: "Multi-Face Recognition",
            description: "Advanced AI cameras detect and mark attendance for the entire class in seconds, eliminating manual roll calls."
        },
        {
            icon: <ChartBarIcon className="w-8 h-8 text-white" />,
            title: "Real-Time Analytics",
            description: "Visualize attendance trends, identify absenteeism early, and generate comprehensive reports instantly."
        },
        {
            icon: <ShieldCheckIcon className="w-8 h-8 text-white" />,
            title: "Secure & Private",
            description: "Built with privacy-first architecture. Face data is encrypted and stored securely, complying with education standards."
        },
        {
            icon: <CodeBracketIcon className="w-8 h-8 text-white" />,
            title: "Seamless Integration",
            description: "Easily syncs with popular Learning Management Systems (LMS) like Canvas, Blackboard, and Moodle."
        },
        {
            icon: <ClockIcon className="w-8 h-8 text-white" />,
            title: "Time-Saving Automation",
            description: "Save up to 10 minutes per class. Teachers can focus on teaching while NexAttend handles the admin."
        },
        {
            icon: <BrainIcon className="w-8 h-8 text-white" />,
            title: "Smart Insights",
            description: "AI-driven insights help institutions understand engagement levels and optimize scheduling."
        },
        {
            icon: <UsersIcon className="w-8 h-8 text-white" />,
            title: "Student Engagement",
            description: "Promote a culture of attendance and punctuality with gamified stats and reliable tracking."
        },
        {
            icon: <SparklesIcon className="w-8 h-8 text-white" />,
            title: "Easy to Use",
            description: "Intuitive dashboard for teachers, students, and administrators. No steep learning curve."
        }
    ];

    return (
        <div className="relative bg-gray-900 min-h-screen py-20 overflow-hidden">
            {/* Floating Gradient Orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="orb orb-purple w-96 h-96 -top-40 -right-40 animate-float-slow"></div>
                <div className="orb orb-pink w-80 h-80 top-1/2 -left-40 animate-float"></div>
                <div className="orb orb-blue w-64 h-64 bottom-20 right-1/4 animate-float-reverse"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="animate-fade-in-down stagger-1">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-sm font-medium mb-6">
                            <SparklesIcon className="w-4 h-4" />
                            Powerful Features
                        </span>
                    </div>
                    <h1 className="animate-fade-in-up stagger-2 text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-violet-400 mb-6">
                        Powerful Features for Modern Education
                    </h1>
                    <p className="animate-fade-in-up stagger-3 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                        Discover how NexAttend transforms attendance management with cutting-edge technology.
                    </p>
                    {/* Animated underline */}
                    <div className="animate-fade-in stagger-4 mt-8 flex justify-center">
                        <div className="w-32 h-1 bg-gradient-to-r from-violet-500 via-pink-500 to-violet-500 rounded-full"></div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} index={index} />
                    ))}
                </div>

                {/* Bottom CTA Section */}
                <div className="animate-fade-in-up mt-24 text-center">
                    <div className="glass-card rounded-3xl p-10 md:p-14 max-w-4xl mx-auto relative overflow-hidden">
                        {/* Decorative gradient */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-pink-500 to-violet-500"></div>

                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
                            Ready to Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">Classroom?</span>
                        </h3>
                        <p className="text-gray-400 mb-8 max-w-xl mx-auto text-lg">
                            Join thousands of educators who have already made the switch to smart attendance management.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="#"
                                className="btn-glow inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-lg shadow-violet-500/30 text-lg"
                            >
                                Get Started Free
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </a>
                            <a
                                href="#"
                                className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-violet-400/50 text-white font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 text-lg"
                            >
                                Watch Demo
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeaturesPage;
