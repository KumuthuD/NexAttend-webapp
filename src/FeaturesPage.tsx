import React from 'react';
import FeatureCard from '../components/FeatureCard';
import {
    CameraIcon, UsersIcon, CodeBracketIcon, CheckCircleIcon, ClockIcon, EnvelopeIcon, SparklesIcon, ChatBubbleLeftRightIcon, ChartBarIcon, DocumentTextIcon
} from '../components/icons';

const FeaturesPage = () => {
    const features = [
        { icon: <CameraIcon className="w-8 h-8 text-white" />, title: 'Multi-Face Detection', description: 'Real-time, accurate face detection for seamless attendance marking in any classroom size.' },
        { icon: <UsersIcon className="w-8 h-8 text-white" />, title: 'Dual Dashboards', description: 'Separate, role-specific dashboards providing tailored tools and insights for teachers and students.' },
        { icon: <CodeBracketIcon className="w-8 h-8 text-white" />, title: 'Virtual Classrooms', description: 'Easily create and manage virtual classrooms with unique, automatically generated access codes.' },
        { icon: <CheckCircleIcon className="w-8 h-8 text-white" />, title: 'Automatic Marking', description: 'Attendance is captured and recorded automatically in the database, eliminating manual work.' },
        { icon: <ClockIcon className="w-8 h-8 text-white" />, title: 'Late Attendance Tracking', description: 'Flexibility to mark students as "late" instead of just present or absent, for more granular data.' },
        { icon: <EnvelopeIcon className="w-8 h-8 text-white" />, title: 'Email Notifications', description: 'Automated email alerts to students after each session, keeping them informed of their status.' },
        { icon: <SparklesIcon className="w-8 h-8 text-white" />, title: 'Attendance Motivation', description: 'Incentivize regular attendance by automatically awarding bonus points or marks to students.' },
        { icon: <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />, title: 'Communication Hub', description: 'A central place for teachers and students to communicate, fostering better engagement.' },
        { icon: <ChartBarIcon className="w-8 h-8 text-white" />, title: 'Automated Reports', description: 'Generate detailed analytics, charts, and reports on attendance trends and participation rates.' },
        { icon: <DocumentTextIcon className="w-8 h-8 text-white" />, title: 'Notes & Assignments', description: 'Teachers can easily share class notes, materials, and post assignments for students.' },
    ];

    return (
        <div className = "py-16 px-4 container mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-500">Our Features</h2>
                <p className="text-lg text-gray-400 mt-2">Everything you need for a smarter classroom.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map(feature => <FeatureCard key={feature.title} {...feature} />)}
            </div>
        </div>      
    );
};

export default FeaturesPage;
