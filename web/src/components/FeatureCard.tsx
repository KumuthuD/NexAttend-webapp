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
  const divRef = React.useRef<HTMLDivElement>(null);
  const frameRef = React.useRef<number>(0);

  const tagColors: Record<string, string> = {
    violet: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    pink: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    blue: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    green: "bg-green-500/20 text-green-300 border-green-500/30",
    amber: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    cyan: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      if (!div) return;
      div.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
      div.style.setProperty("--mouse-x", `${x}px`);
      div.style.setProperty("--mouse-y", `${y}px`);
    });
  };

  const handleMouseLeave = () => {
    if (!divRef.current) return;
    cancelAnimationFrame(frameRef.current);
    divRef.current.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
    divRef.current.style.transition =
      "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease";
  };

  const handleMouseEnter = () => {
    if (!divRef.current) return;
    divRef.current.style.transition =
      "transform 0.1s ease-out, box-shadow 0.3s ease";
  };

  return (
    <div className="reveal h-full" style={{ transitionDelay: `${index * 0.08}s` }}>
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className={`group relative glass-card rounded-2xl p-7 text-center h-full overflow-hidden card-3d`}
    >

      {/* Spotlight Effect */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-60"
        style={{
          background: `radial-gradient(500px circle at var(--mouse-x) var(--mouse-y), rgba(139, 92, 246, 0.18), transparent 40%)`,
        }}
      />

      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Category tag */}
      {tag && (
        <div
          className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${tagColors[tagColor] ?? tagColors.violet}`}
        >
          {tag}
        </div>
      )}

      {/* Animated glow behind icon */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-r from-violet-500/30 to-pink-500/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-150" />

      {/* Icon container */}
      <div className="relative flex justify-center mb-5 icon-bounce">
        <div className="bounce-target relative w-18 h-18 w-[72px] h-[72px] bg-gradient-to-br from-violet-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-violet-500/50 transition-all duration-500">
          {/* Inner shine */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/25 to-transparent" />
          {/* Spinning border ring */}
          <div
            className="absolute -inset-[2px] rounded-[18px] bg-gradient-to-r from-violet-400 via-pink-400 to-violet-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 arc-spin"
            style={{ backgroundSize: "200% 200%" }}
          />
          <div className="relative z-10">{icon}</div>
        </div>
      </div>

      {/* Floating micro-particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-violet-400/60 particle-star"
            style={
              {
                left: `${15 + i * 18}%`,
                top: `${20 + (i % 3) * 20}%`,
                "--dur": `${2 + i * 0.4}s`,
                "--delay": `${i * 0.3}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Title */}
      <h3 className="relative text-lg font-bold mb-2.5 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-300 group-hover:to-pink-300 transition-all duration-300">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed text-sm">
        {description}
      </p>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-violet-500 to-pink-500 group-hover:w-4/5 transition-all duration-700 rounded-full" />
    </div>
    </div>
  );
};

export default FeatureCard;
