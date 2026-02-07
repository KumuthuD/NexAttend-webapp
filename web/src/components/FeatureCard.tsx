import React from 'react';

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    index?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, index = 0 }) => {
    const divRef = React.useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;

        const div = divRef.current;
        const rect = div.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        div.style.setProperty('--mouse-x', `${x}px`);
        div.style.setProperty('--mouse-y', `${y}px`);
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            className={`group relative glass-card glass-card-hover rounded-2xl p-8 text-center transition-all duration-500 h-full animate-fade-in-up stagger-${(index % 8) + 1} overflow-hidden`}
        >
            {/* Spotlight Effect */}
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-50"
                style={{
                    background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(139, 92, 246, 0.15), transparent 40%)`,
                }}
            />

            {/* Gradient border overlay */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/20 via-pink-500/20 to-violet-500/20"></div>
            </div>

            {/* Animated glow behind icon */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-20 h-20 bg-gradient-to-r from-violet-500/30 to-pink-500/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Icon container with animation */}
            <div className="relative flex justify-center mb-6">
                <div className="relative w-20 h-20 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-violet-500/40 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                    {/* Inner glow */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
                    {/* Icon */}
                    <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                        {icon}
                    </div>
                </div>
            </div>

            {/* Title with gradient on hover */}
            <h3 className="relative text-xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-pink-400 transition-all duration-300">
                {title}
            </h3>

            {/* Description */}
            <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                {description}
            </p>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-violet-500 to-pink-500 group-hover:w-3/4 transition-all duration-500 rounded-full"></div>
        </div>
    );
};

export default FeatureCard;
