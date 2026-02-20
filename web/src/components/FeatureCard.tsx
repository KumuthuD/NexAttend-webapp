import React, { useRef, useState } from 'react';

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    index?: number;
    tag?: string;
    stat?: string;
    statLabel?: string;
}

// Accent color palettes per card index
const ACCENTS = [
    { from: '#8b5cf6', to: '#ec4899', glow: 'rgba(139,92,246,0.55)', badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
    { from: '#06b6d4', to: '#8b5cf6', glow: 'rgba(6,182,212,0.5)',   badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    { from: '#ec4899', to: '#f97316', glow: 'rgba(236,72,153,0.5)',  badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
    { from: '#10b981', to: '#06b6d4', glow: 'rgba(16,185,129,0.5)',  badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    { from: '#f97316', to: '#ec4899', glow: 'rgba(249,115,22,0.5)',  badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
    { from: '#3b82f6', to: '#8b5cf6', glow: 'rgba(59,130,246,0.5)', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    { from: '#a855f7', to: '#06b6d4', glow: 'rgba(168,85,247,0.5)', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    { from: '#ec4899', to: '#8b5cf6', glow: 'rgba(236,72,153,0.5)', badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
];

const FeatureCard: React.FC<FeatureCardProps> = ({
    icon,
    title,
    description,
    index = 0,
    tag,
    stat,
    statLabel,
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const accent = ACCENTS[index % ACCENTS.length];
    const cardNumber = String(index + 1).padStart(2, '0');

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;

        // Tilt: max ±12 degrees
        const tiltX = ((y - cy) / cy) * -10;
        const tiltY = ((x - cx) / cx) * 10;

        setTilt({ x: tiltX, y: tiltY });
        setMousePos({ x, y });
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
        setIsHovered(false);
        setTilt({ x: 0, y: 0 });
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative group h-full animate-fade-in-up stagger-${(index % 8) + 1}`}
            style={{ perspective: '1000px' }}
        >
            {/* Outer glow halo — scales on hover */}
            <div
                className="absolute -inset-[2px] rounded-2xl blur-lg transition-all duration-500 pointer-events-none"
                style={{
                    background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
                    opacity: isHovered ? 0.6 : 0,
                }}
            />

            {/* Card body with 3-D tilt */}
            <div
                className="relative h-full rounded-2xl overflow-hidden flex flex-col"
                style={{
                    transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.03 : 1})`,
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.25s cubic-bezier(.03,.98,.52,.99)',
                    background: 'rgba(15,15,25,0.85)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: `1px solid ${isHovered ? accent.from + '55' : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: isHovered
                        ? `0 20px 60px -10px ${accent.glow}, 0 0 0 1px ${accent.from}33`
                        : '0 8px 32px rgba(0,0,0,0.4)',
                }}
            >
                {/* --- Animated gradient top bar --- */}
                <div
                    className="h-[3px] w-full"
                    style={{
                        background: `linear-gradient(90deg, ${accent.from}, ${accent.to}, ${accent.from})`,
                        backgroundSize: '200% 100%',
                        animation: isHovered ? 'featureBarSlide 2s linear infinite' : 'none',
                        opacity: isHovered ? 1 : 0.4,
                        transition: 'opacity 0.3s ease',
                    }}
                />

                {/* --- Spotlight cursor follower --- */}
                <div
                    className="pointer-events-none absolute inset-0 transition-opacity duration-300 rounded-2xl"
                    style={{
                        background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, ${accent.from}18, transparent 65%)`,
                        opacity: isHovered ? 1 : 0,
                    }}
                />

                {/* --- Floating mini particles --- */}
                {isHovered && (
                    <>
                        <span className="absolute top-6 right-8 w-1.5 h-1.5 rounded-full opacity-70 animate-ping" style={{ background: accent.from }} />
                        <span className="absolute bottom-10 left-6 w-1 h-1 rounded-full opacity-60 animate-ping" style={{ background: accent.to, animationDelay: '0.4s' }} />
                        <span className="absolute top-1/2 right-5 w-1 h-1 rounded-full opacity-50 animate-ping" style={{ background: accent.from, animationDelay: '0.8s' }} />
                    </>
                )}

                {/* --- Card number watermark --- */}
                <span
                    className="absolute top-4 right-5 font-black text-4xl select-none pointer-events-none transition-all duration-500"
                    style={{
                        background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        opacity: isHovered ? 0.18 : 0.08,
                        transform: `scale(${isHovered ? 1.2 : 1})`,
                    }}
                >
                    {cardNumber}
                </span>

                {/* --- Main content --- */}
                <div className="relative z-10 flex flex-col flex-1 p-6">
                    {/* Tag badge */}
                    {tag && (
                        <span className={`inline-flex self-start items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border mb-4 ${accent.badge}`}>
                            <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: accent.from }}
                            />
                            {tag}
                        </span>
                    )}

                    {/* Icon bubble */}
                    <div className="relative mb-5 self-start">
                        {/* Outer ring glow */}
                        <div
                            className="absolute -inset-2 rounded-2xl blur-md transition-all duration-500"
                            style={{
                                background: `linear-gradient(135deg, ${accent.from}50, ${accent.to}50)`,
                                opacity: isHovered ? 1 : 0,
                            }}
                        />
                        <div
                            className="relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg"
                            style={{
                                background: `linear-gradient(135deg, ${accent.from}33, ${accent.to}33)`,
                                border: `1px solid ${accent.from}55`,
                                transform: isHovered ? 'rotate(-6deg) scale(1.12)' : 'rotate(0deg) scale(1)',
                            }}
                        >
                            {/* Inner gradient overlay */}
                            <div
                                className="absolute inset-0 rounded-2xl opacity-30"
                                style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` }}
                            />
                            <div className="relative z-10" style={{ filter: `drop-shadow(0 0 6px ${accent.from})` }}>
                                {icon}
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <h3
                        className="text-lg font-extrabold mb-2 transition-all duration-300"
                        style={{
                            background: isHovered
                                ? `linear-gradient(90deg, ${accent.from}, ${accent.to})`
                                : 'linear-gradient(90deg, #fff, rgba(255,255,255,0.85))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        {title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-400 group-hover:text-gray-300 leading-relaxed transition-colors duration-300 flex-1">
                        {description}
                    </p>

                    {/* Stat row */}
                    {stat && statLabel && (
                        <div
                            className="mt-4 pt-4 flex items-end gap-2 border-t transition-all duration-300"
                            style={{ borderColor: isHovered ? `${accent.from}33` : 'rgba(255,255,255,0.06)' }}
                        >
                            <span
                                className="text-2xl font-black"
                                style={{
                                    background: `linear-gradient(90deg, ${accent.from}, ${accent.to})`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                {stat}
                            </span>
                            <span className="text-xs text-gray-500 mb-1 leading-tight">{statLabel}</span>
                        </div>
                    )}
                </div>

                {/* --- Bottom CTA strip --- */}
                <div
                    className="relative mx-6 mb-6 flex items-center gap-2 group/cta cursor-default select-none"
                    style={{ marginTop: !stat ? 'auto' : undefined }}
                >
                    <div
                        className="h-[1px] flex-1 transition-all duration-500"
                        style={{
                            background: `linear-gradient(90deg, transparent, ${accent.from}88, transparent)`,
                            opacity: isHovered ? 1 : 0.3,
                        }}
                    />
                    <span
                        className="text-[11px] font-bold uppercase tracking-widest transition-all duration-300"
                        style={{
                            background: `linear-gradient(90deg, ${accent.from}, ${accent.to})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: isHovered ? 'transparent' : undefined,
                            color: isHovered ? 'transparent' : 'rgba(255,255,255,0.2)',
                        }}
                    >
                        Learn more →
                    </span>
                    <div
                        className="h-[1px] flex-1 transition-all duration-500"
                        style={{
                            background: `linear-gradient(90deg, transparent, ${accent.to}88, transparent)`,
                            opacity: isHovered ? 1 : 0.3,
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default FeatureCard;
