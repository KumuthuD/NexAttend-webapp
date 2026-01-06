import React from 'react';

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
    <div className="bg-white/5 backdrop-blur-md p-6 rounded-lg border border-white/10 text-center transform hover:scale-105 transition-transform duration-300 h-full">
        <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center">
                {icon}
            </div>
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
);

export default FeatureCard;
