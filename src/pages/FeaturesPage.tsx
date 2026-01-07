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
        <div className="bg-gray-900 min-h-screen py-16">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-500 mb-6">
                        Powerful Features for Modern Education
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Discover how NexAttend transforms attendance management with cutting-edge technology.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeaturesPage;
