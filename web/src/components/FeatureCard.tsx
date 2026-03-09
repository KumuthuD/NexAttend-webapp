import React from "react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index?: number;
  tag?: string;
  tagColor?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  index = 0,
  tag,
  tagColor = "violet",
}) => {
  const tagColors: Record<string, string> = {
    violet: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    pink: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    blue: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    green: "bg-green-500/20 text-green-300 border-green-500/30",
    amber: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    cyan: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  };

  return (
    <div className="reveal h-full" style={{ transitionDelay: `${index * 0.08}s` }}>
      <div
        className={`group relative rounded-2xl p-7 text-center h-full overflow-hidden cursor-default
          bg-white/[0.04] backdrop-blur-xl border border-white/[0.08]
          hover:bg-white/[0.08] hover:border-violet-500/30
          hover:-translate-y-1.5 hover:scale-[1.02]
          transition-all duration-500 ease-out
          shadow-[0_8px_32px_rgba(0,0,0,0.12)]
          hover:shadow-[0_12px_48px_rgba(139,92,246,0.15)]`}
      >
        {/* Top border gradient — visible on hover */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-violet-400/50 transition-all duration-500" />

        {/* Soft background glow on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/0 to-pink-500/0 group-hover:from-violet-500/[0.06] group-hover:to-pink-500/[0.04] transition-all duration-700 pointer-events-none" />

        {/* Category tag */}
        {tag && (
          <div
            className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-sm ${tagColors[tagColor] ?? tagColors.violet}`}
          >
            {tag}
          </div>
        )}

        {/* Icon container */}
        <div className="relative flex justify-center mb-5">
          <div className="relative w-[64px] h-[64px] bg-gradient-to-br from-violet-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10 rounded-2xl flex items-center justify-center
            group-hover:from-violet-500/30 group-hover:to-pink-500/30 group-hover:border-violet-400/30 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-violet-500/20
            transition-all duration-500">
            <div className="relative z-10">{icon}</div>
          </div>
        </div>

        {/* Title */}
        <h3 className="relative text-lg font-bold mb-2.5 text-white group-hover:text-violet-200 transition-colors duration-300">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed text-sm">
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard;
