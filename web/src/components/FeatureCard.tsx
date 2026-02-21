import React, { useRef, useState, useEffect, useCallback } from 'react';

/* ─── Props ────────────────────────────────────────────────────────────────── */
interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    index?: number;
    tag?: string;
    stat?: string;
    statLabel?: string;
}

/* ─── Per-card accent palettes ─────────────────────────────────────────────── */
const THEMES = [
    { from: '#8b5cf6', mid: '#a78bfa', to: '#ec4899' },
    { from: '#06b6d4', mid: '#22d3ee', to: '#6366f1' },
    { from: '#f43f5e', mid: '#fb7185', to: '#f97316' },
    { from: '#10b981', mid: '#34d399', to: '#06b6d4' },
    { from: '#f97316', mid: '#fb923c', to: '#eab308' },
    { from: '#3b82f6', mid: '#60a5fa', to: '#8b5cf6' },
    { from: '#a855f7', mid: '#c084fc', to: '#ec4899' },
    { from: '#ec4899', mid: '#f472b6', to: '#f43f5e' },
];

/* ─── Deterministic particle layout per card ───────────────────────────────── */
function makeParticles(seed: number) {
    return Array.from({ length: 7 }, (_, i) => {
        const h = Math.imul(seed * 2654435761 + i * 40503, 1) >>> 0;
        return {
            left: (h % 78) + 11,
            top: ((h >> 8) % 70) + 10,
            size: 1.5 + (i % 3) * 0.6,
            delay: `${(i * 0.45).toFixed(2)}s`,
            dur: `${(2.4 + (i % 4) * 0.55).toFixed(1)}s`,
            useFrom: i % 2 === 0,
        };
    });
}

/* ─── Parse stat string for count-up ──────────────────────────────────────── */
function parseStat(s: string) {
    const m = s.match(/^([<≈~]?)(\d+(?:\.\d+)?)(.*)$/);
    if (!m) return null;
    return { prefix: m[1], num: parseFloat(m[2]), suffix: m[3] };
}

/* ═══════════════════════════════════════════════════════════════════════════ */
const FeatureCard: React.FC<FeatureCardProps> = ({
    icon, title, description, index = 0, tag, stat, statLabel,
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [tilt, setTilt]             = useState({ x: 0, y: 0 });
    const [mouse, setMouse]           = useState({ nx: 0.5, ny: 0.5 }); // normalised 0-1
    const [isHovered, setIsHovered]   = useState(false);
    const [displayCount, setCount]    = useState(0);
    const [hasAnimated, setAnimated]  = useState(false);
    const [scanKey, setScanKey]       = useState(0); // re-mounts scan on each enter

    const theme     = THEMES[index % THEMES.length];
    const cardNum   = String(index + 1).padStart(2, '0');
    const particles = makeParticles(index + 1);
    const parsed    = stat ? parseStat(stat) : null;

    /* ── Mouse → tilt + holographic coords ─────────────────────────── */
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const r  = cardRef.current.getBoundingClientRect();
        const nx = (e.clientX - r.left)  / r.width;
        const ny = (e.clientY - r.top)   / r.height;
        setMouse({ nx, ny });
        setTilt({
            x: (ny - 0.5) * -24,  // ±12°
            y: (nx - 0.5) *  24,
        });
    }, []);

    const handleEnter = useCallback(() => {
        setIsHovered(true);
        setScanKey(k => k + 1); // restart scan line
    }, []);

    const handleLeave = useCallback(() => {
        setIsHovered(false);
        setTilt({ x: 0, y: 0 });
    }, []);

    /* ── Count-up on first hover ────────────────────────────────────── */
    useEffect(() => {
        if (!isHovered || hasAnimated || !parsed) return;
        setAnimated(true);
        const target = parsed.num;
        const start  = performance.now();
        const dur    = 900;
        const tick   = (now: number) => {
            const p = Math.min((now - start) / dur, 1);
            const e = 1 - Math.pow(1 - p, 3); // ease-out-cubic
            setCount(Math.round(e * target));
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [isHovered, hasAnimated, parsed]);

    /* ── Holographic maths ──────────────────────────────────────────── */
    const hue        = (mouse.nx * 320 + mouse.ny * 160) % 360;
    const shineAngle = Math.atan2(mouse.ny - 0.5, mouse.nx - 0.5) * (180 / Math.PI) + 90;

    /* ── Render ─────────────────────────────────────────────────────── */
    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            className={`relative group h-full animate-fade-in-up stagger-${(index % 8) + 1}`}
            style={{ perspective: '1100px', cursor: 'pointer' }}
        >
            {/* ══ 1. OUTER GLOW HALO ══════════════════════════════════════ */}
            <div
                className="absolute -inset-[3px] rounded-[24px] pointer-events-none transition-opacity duration-500"
                style={{
                    background: `linear-gradient(135deg, ${theme.from}, ${theme.mid}, ${theme.to})`,
                    opacity: isHovered ? 0.75 : 0,
                    filter: 'blur(16px)',
                }}
            />

            {/* ══ 2. CARD SHELL — 3-D tilt ════════════════════════════════ */}
            <div
                className="relative h-full rounded-2xl overflow-hidden flex flex-col"
                style={{
                    transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.025 : 1})`,
                    transition: isHovered
                        ? 'transform 0.12s ease-out, box-shadow 0.4s ease, border-color 0.3s ease'
                        : 'transform 0.6s ease, box-shadow 0.5s ease, border-color 0.5s ease',
                    background: `linear-gradient(160deg,
                        rgba(55, 35, 95, 0.52) 0%,
                        rgba(25, 18, 55, 0.62) 55%,
                        rgba(45, 28, 80, 0.52) 100%)`,
                    backdropFilter: 'blur(28px)',
                    WebkitBackdropFilter: 'blur(28px)',
                    border: `1px solid ${isHovered ? theme.from + '77' : 'rgba(255,255,255,0.09)'}`,
                    boxShadow: isHovered
                        ? `0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px ${theme.from}44, inset 0 1px 0 rgba(255,255,255,0.12)`
                        : '0 4px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
            >
                {/* ══ 3. HOLOGRAPHIC RAINBOW SHEEN (THE WOW LAYER) ════════ */}
                {/* Primary iridescent sweep */}
                <div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                        background: `linear-gradient(
                            ${shineAngle}deg,
                            transparent                                    0%,
                            hsla(${hue},         100%, 65%, 0.09)         20%,
                            hsla(${(hue+55)%360},100%, 72%, 0.16)         38%,
                            hsla(${(hue+110)%360},100%,66%, 0.18)         52%,
                            hsla(${(hue+165)%360},100%,72%, 0.14)         68%,
                            hsla(${(hue+220)%360},100%,65%, 0.07)         82%,
                            transparent                                    100%
                        )`,
                        mixBlendMode: 'overlay',
                        opacity: isHovered ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                    }}
                />
                {/* Radial glow from cursor */}
                <div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                        background: `radial-gradient(
                            ellipse 60% 50% at ${mouse.nx * 100}% ${mouse.ny * 100}%,
                            hsla(${(hue+40)%360}, 100%, 70%, 0.14) 0%,
                            transparent 65%
                        )`,
                        mixBlendMode: 'screen',
                        opacity: isHovered ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                    }}
                />

                {/* ══ 4. FLOATING PARTICLES ════════════════════════════════ */}
                {particles.map((p, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            left:   `${p.left}%`,
                            top:    `${p.top}%`,
                            width:  `${p.size}px`,
                            height: `${p.size}px`,
                            background: p.useFrom ? theme.from : theme.to,
                            boxShadow:  `0 0 ${p.size * 4}px ${p.useFrom ? theme.from : theme.to}`,
                            animation:  `particleFloat ${p.dur} ${p.delay} ease-in-out infinite`,
                            opacity: isHovered ? 1 : 0.25,
                            transition: 'opacity 0.6s ease',
                        }}
                    />
                ))}

                {/* ══ 5. SCAN LINE (fires on every mouse-enter) ═══════════ */}
                <div
                    key={scanKey}
                    className="absolute inset-y-0 pointer-events-none"
                    style={{
                        width: '35%',
                        background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.09), transparent)`,
                        animation: isHovered ? 'scanLine 0.75s ease-out forwards' : 'none',
                        zIndex: 8,
                    }}
                />

                {/* ══ 6. HERO SLAB (top section) ══════════════════════════ */}
                <div
                    className="relative overflow-hidden flex-shrink-0"
                    style={{ height: '128px' }}
                >
                    {/* Gradient sky */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(135deg, ${theme.from}66 0%, ${theme.to}40 100%)`,
                        }}
                    />
                    {/* Subtle grid lines */}
                    <div
                        className="absolute inset-0 opacity-[0.08]"
                        style={{
                            backgroundImage: `linear-gradient(${theme.from}88 1px, transparent 1px),
                                              linear-gradient(90deg, ${theme.from}88 1px, transparent 1px)`,
                            backgroundSize: '22px 22px',
                        }}
                    />
                    {/* Top-right orb */}
                    <div
                        className="absolute rounded-full animate-float-slow"
                        style={{
                            width: '180px', height: '180px',
                            background: `radial-gradient(circle, ${theme.from}88, ${theme.to}44, transparent 68%)`,
                            top: '-60px', right: '-50px',
                            transform: isHovered ? 'scale(1.25)' : 'scale(1)',
                            transition: 'transform 0.6s ease',
                        }}
                    />
                    {/* Bottom-left secondary orb */}
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: '90px', height: '90px',
                            background: `radial-gradient(circle, ${theme.to}77, transparent 65%)`,
                            bottom: '-30px', left: '-20px',
                            transform: isHovered ? 'scale(1.4)' : 'scale(1)',
                            transition: 'transform 0.7s ease',
                        }}
                    />

                    {/* Card number watermark */}
                    <span
                        className="absolute top-3 right-4 font-black text-6xl select-none pointer-events-none leading-none"
                        style={{
                            background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            opacity: isHovered ? 0.3 : 0.1,
                            transition: 'opacity 0.4s ease',
                        }}
                    >
                        {cardNum}
                    </span>

                    {/* Tag badge */}
                    {tag && (
                        <span
                            className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border:     '1px solid rgba(255,255,255,0.18)',
                                color:      'rgba(255,255,255,0.8)',
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <span
                                className="w-1.5 h-1.5 rounded-full animate-pulse"
                                style={{ background: theme.from }}
                            />
                            {tag}
                        </span>
                    )}

                    {/* ── Orbiting icon assembly ─────────────────────────── */}
                    <div
                        className="absolute"
                        style={{ bottom: '-30px', left: '50%', transform: 'translateX(-50%)' }}
                    >
                        {/* Orbit ring visual */}
                        <div
                            className="absolute rounded-full"
                            style={{
                                width: '72px', height: '72px',
                                top: 0, left: 0,
                                border: `1px solid ${theme.from}50`,
                                animation: 'spin-slow 10s linear infinite',
                                opacity: isHovered ? 1 : 0.4,
                                transition: 'opacity 0.4s ease',
                            }}
                        />
                        {/* Pulse ring (fires on hover) */}
                        <div
                            className="absolute rounded-full pointer-events-none"
                            style={{
                                width: '72px', height: '72px',
                                top: 0, left: 0,
                                border: `2px solid ${theme.from}`,
                                animation: isHovered ? 'ringPulse 1s ease-out infinite' : 'none',
                            }}
                        />

                        {/* Orbiting dot A */}
                        <div
                            className="absolute"
                            style={{
                                top: '36px', left: '36px',
                                width: '7px', height: '7px',
                                marginTop: '-3.5px', marginLeft: '-3.5px',
                                animation: `orbitA ${isHovered ? '2s' : '4s'} linear infinite`,
                                transition: 'animation-duration 0.4s',
                            }}
                        >
                            <div
                                className="w-full h-full rounded-full"
                                style={{
                                    background: theme.from,
                                    boxShadow: `0 0 8px 2px ${theme.from}`,
                                    opacity: isHovered ? 1 : 0.5,
                                    transition: 'opacity 0.3s',
                                }}
                            />
                        </div>
                        {/* Orbiting dot B */}
                        <div
                            className="absolute"
                            style={{
                                top: '36px', left: '36px',
                                width: '5px', height: '5px',
                                marginTop: '-2.5px', marginLeft: '-2.5px',
                                animation: `orbitB ${isHovered ? '2s' : '4s'} linear infinite`,
                                transition: 'animation-duration 0.4s',
                            }}
                        >
                            <div
                                className="w-full h-full rounded-full"
                                style={{
                                    background: theme.to,
                                    boxShadow: `0 0 6px 2px ${theme.to}`,
                                    opacity: isHovered ? 1 : 0.4,
                                    transition: 'opacity 0.3s',
                                }}
                            />
                        </div>
                        {/* Orbiting dot C */}
                        <div
                            className="absolute"
                            style={{
                                top: '36px', left: '36px',
                                width: '4px', height: '4px',
                                marginTop: '-2px', marginLeft: '-2px',
                                animation: `orbitC ${isHovered ? '2s' : '4s'} linear infinite`,
                                transition: 'animation-duration 0.4s',
                            }}
                        >
                            <div
                                className="w-full h-full rounded-full"
                                style={{
                                    background: theme.mid,
                                    boxShadow: `0 0 5px 2px ${theme.mid}`,
                                    opacity: isHovered ? 0.85 : 0.3,
                                    transition: 'opacity 0.3s',
                                }}
                            />
                        </div>

                        {/* Icon bubble */}
                        <div
                            className="relative w-[72px] h-[72px] rounded-2xl flex items-center justify-center"
                            style={{
                                background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
                                boxShadow: isHovered
                                    ? `0 0 40px ${theme.from}99, 0 0 80px ${theme.from}44, 0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.28)`
                                    : `0 4px 18px ${theme.from}66, 0 4px 12px rgba(0,0,0,0.3)`,
                                transform: isHovered ? 'scale(1.12) rotate(-5deg)' : 'scale(1) rotate(0deg)',
                                transition: 'transform 0.45s cubic-bezier(.03,.98,.52,.99), box-shadow 0.45s ease',
                            }}
                        >
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/25 to-transparent pointer-events-none" />
                            <div style={{ position: 'relative', zIndex: 1, filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.45))' }}>
                                {icon}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══ 7. CONTENT AREA ══════════════════════════════════════ */}
                <div className="flex flex-col flex-1 px-5 pt-11 pb-5 text-center">
                    {/* Title */}
                    <h3
                        className="text-[15px] font-extrabold mb-2 leading-snug transition-all duration-300"
                        style={{
                            background: isHovered
                                ? `linear-gradient(90deg, ${theme.from}, ${theme.mid}, ${theme.to})`
                                : 'linear-gradient(90deg, #ffffff, rgba(255,255,255,0.85))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        {title}
                    </h3>

                    {/* Description */}
                    <p
                        className="text-[12.5px] leading-relaxed flex-1 transition-colors duration-300"
                        style={{ color: isHovered ? 'rgba(210,210,235,0.95)' : 'rgba(148,148,180,0.85)' }}
                    >
                        {description}
                    </p>

                    {/* ── Stat row ──── */}
                    {parsed && statLabel && (
                        <div
                            className="mt-4 pt-4 flex flex-col items-center gap-0.5 transition-all duration-300"
                            style={{
                                borderTop: `1px solid ${isHovered ? theme.from + '60' : 'rgba(255,255,255,0.07)'}`,
                            }}
                        >
                            <span
                                className="text-[28px] font-black leading-none tracking-tight"
                                style={{
                                    background: `linear-gradient(90deg, ${theme.from}, ${theme.to})`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    filter: isHovered ? `drop-shadow(0 0 14px ${theme.from}bb)` : 'none',
                                    transition: 'filter 0.45s ease',
                                }}
                            >
                                {parsed.prefix}
                                {hasAnimated ? displayCount : parsed.num}
                                {parsed.suffix}
                            </span>
                            <span className="text-[10.5px] leading-tight" style={{ color: 'rgba(120,120,155,0.85)' }}>
                                {statLabel}
                            </span>
                        </div>
                    )}
                </div>

                {/* ══ 8. LEFT ACCENT BAR ══════════════════════════════════ */}
                <div
                    className="absolute left-0 bottom-0 w-[3px] rounded-r-full transition-all duration-500 ease-out"
                    style={{
                        background: `linear-gradient(to top, ${theme.from}, ${theme.to})`,
                        height: isHovered ? '70%' : '0%',
                        boxShadow: `2px 0 12px ${theme.from}88`,
                        opacity: 0.9,
                    }}
                />

                {/* ══ 9. BOTTOM SHIMMER LINE ══════════════════════════════ */}
                <div
                    className="absolute bottom-0 left-0 h-[2px] transition-all duration-700 ease-out rounded-full"
                    style={{
                        background: `linear-gradient(90deg, transparent, ${theme.from}, ${theme.mid}, ${theme.to}, transparent)`,
                        width: isHovered ? '100%' : '0%',
                    }}
                />
            </div>
        </div>
    );
};

export default FeatureCard;
