import React, { useRef, useState, useEffect, useCallback } from 'react';
import { LinkedInIcon, InstagramIcon } from './icons';

/* ─── Types ─────────────────────────────────────────────────── */
interface TeamMember {
    name: string;
    role: string;
    description: string;
    image: string;
    linkedin?: string;
    instagram?: string;
    color: string; // raw "r, g, b" string for CSS
}

interface TeamCarouselProps {
    members: TeamMember[];
}

/* ─── Component ─────────────────────────────────────────────── */
const TeamCarousel: React.FC<TeamCarouselProps> = ({ members }) => {
    const quantity = members.length;
    const W = 200;
    const H = 300;
    const RADIUS = W + H + 80; // translateZ distance

    /* ── Rotation state -------------------------------------------------------- */
    const rotationY = useRef(0);          // current displayed angle (degrees)
    const velocity = useRef(0);           // degrees/ms for inertia
    const rafId = useRef<number | null>(null);

    // Mouse/touch drag tracking
    const isDragging = useRef(false);
    const lastX = useRef(0);
    const lastTime = useRef(0);
    const lastDelta = useRef(0);

    // Force a re-render to apply the rotation to the DOM element
    const innerRef = useRef<HTMLDivElement>(null);
    const [cursor, setCursor] = useState<'grab' | 'grabbing'>('grab');

    /* ── Apply rotation directly to DOM (avoids React re-render on every frame) */
    const applyRotation = useCallback((angle: number) => {
        if (!innerRef.current) return;
        innerRef.current.style.transform =
            `perspective(1100px) rotateX(-12deg) rotateY(${angle}deg)`;
    }, []);

    /* ── Inertia loop ---------------------------------------------------------- */
    const startInertia = useCallback(() => {
        if (rafId.current) cancelAnimationFrame(rafId.current);

        const FRICTION = 0.93; // how quickly it slows down (0–1)
        const MIN_VEL = 0.05;  // stop threshold (deg/ms)

        let lastTimestamp: number | null = null;

        const tick = (ts: number) => {
            if (lastTimestamp === null) {
                lastTimestamp = ts;
                rafId.current = requestAnimationFrame(tick);
                return;
            }
            const dt = ts - lastTimestamp;
            lastTimestamp = ts;

            velocity.current *= FRICTION;
            if (Math.abs(velocity.current) < MIN_VEL) {
                velocity.current = 0;
                return; // stop loop
            }

            rotationY.current += velocity.current * dt;
            applyRotation(rotationY.current);
            rafId.current = requestAnimationFrame(tick);
        };

        rafId.current = requestAnimationFrame(tick);
    }, [applyRotation]);

    /* ── Pointer/touch helpers ------------------------------------------------- */
    const onDragStart = useCallback((clientX: number) => {
        if (rafId.current) cancelAnimationFrame(rafId.current);
        isDragging.current = true;
        lastX.current = clientX;
        lastTime.current = performance.now();
        lastDelta.current = 0;
        setCursor('grabbing');
    }, []);

    const onDragMove = useCallback((clientX: number) => {
        if (!isDragging.current) return;
        const now = performance.now();
        const dt = now - lastTime.current || 1;
        const dx = clientX - lastX.current;

        // 0.35 deg per pixel — adjust for feel
        const deltaAngle = dx * 0.35;
        rotationY.current += deltaAngle;
        applyRotation(rotationY.current);

        // Track velocity (degrees per ms) for inertia
        velocity.current = deltaAngle / dt;
        lastDelta.current = deltaAngle;
        lastX.current = clientX;
        lastTime.current = now;
    }, [applyRotation]);

    const onDragEnd = useCallback(() => {
        if (!isDragging.current) return;
        isDragging.current = false;
        setCursor('grab');
        // Hand off to inertia if there's meaningful speed
        if (Math.abs(velocity.current) > 0.05) {
            startInertia();
        }
    }, [startInertia]);

    /* ── Mouse events ---------------------------------------------------------- */
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        onDragStart(e.clientX);
    };

    // Global move/up so drag works even if cursor leaves the element
    useEffect(() => {
        const onMove = (e: MouseEvent) => onDragMove(e.clientX);
        const onUp = () => onDragEnd();
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [onDragMove, onDragEnd]);

    /* ── Touch events ---------------------------------------------------------- */
    const handleTouchStart = (e: React.TouchEvent) => {
        onDragStart(e.touches[0].clientX);
    };
    const handleTouchMove = (e: React.TouchEvent) => {
        e.preventDefault();
        onDragMove(e.touches[0].clientX);
    };
    const handleTouchEnd = () => onDragEnd();

    /* ── Cleanup RAF on unmount ------------------------------------------------ */
    useEffect(() => {
        // Set initial transform
        applyRotation(0);
        return () => {
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, [applyRotation]);

    /* ── Render ---------------------------------------------------------------- */
    return (
        <>
            <style>{`
                .team-card-body {
                    transition: transform 0.3s cubic-bezier(.03,.98,.52,.99);
                }
                .team-card-body:hover {
                    transform: translateY(-6px) scale(1.04);
                }
            `}</style>

            {/* Hint row */}
            <div style={{
                textAlign: 'center',
                marginBottom: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
            }}>
                <div style={{ height: '1px', width: '60px', background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5))' }} />
                <span style={{ fontSize: '12px', color: 'rgba(180,180,210,0.5)', letterSpacing: '0.1em' }}>
                    ← drag to explore →
                </span>
                <div style={{ height: '1px', width: '60px', background: 'linear-gradient(90deg, rgba(139,92,246,0.5), transparent)' }} />
            </div>

            {/* Scene wrapper */}
            <div
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                    width: '100%',
                    height: `${RADIUS * 2 + H}px`,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'visible',
                    cursor,
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                }}
            >
                {/* 3D ring — transform driven directly via ref */}
                <div
                    ref={innerRef}
                    style={{
                        position: 'absolute',
                        width: `${W}px`,
                        height: `${H}px`,
                        top: '50%',
                        left: '50%',
                        marginTop: `-${H / 2}px`,
                        marginLeft: `-${W / 2}px`,
                        transformStyle: 'preserve-3d',
                        // Initial transform applied via applyRotation in useEffect
                        transform: `perspective(1100px) rotateX(-12deg) rotateY(0deg)`,
                    }}
                >
                    {members.map((member, i) => {
                        const angleDeg = (360 / quantity) * i;
                        return (
                            <div
                                key={member.name}
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    transform: `rotateY(${angleDeg}deg) translateZ(${RADIUS}px)`,
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    border: `1.5px solid rgba(${member.color}, 0.45)`,
                                    boxShadow: `0 0 28px 2px rgba(${member.color}, 0.18), 0 8px 32px rgba(0,0,0,0.5)`,
                                }}
                            >
                                <div
                                    className="team-card-body"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        // Opaque gradient — no backdropFilter so photos stay crisp
                                        // (backdrop-filter breaks under preserve-3d, blurring child content)
                                        background: `linear-gradient(
                                            160deg,
                                            rgba(${member.color}, 0.12) 0%,
                                            rgb(10, 10, 20) 40%,
                                            rgba(${member.color}, 0.10) 100%
                                        )`,
                                        cursor: 'inherit',
                                    }}
                                >
                                    {/* Photo area — no overlays so image renders at full quality */}
                                    <div style={{ position: 'relative', height: '145px', flexShrink: 0, overflow: 'hidden' }}>
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            draggable={false}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                objectPosition: 'top',
                                                display: 'block',
                                                pointerEvents: 'none',
                                            }}
                                        />
                                        <div
                                            style={{
                                                position: 'absolute',
                                                bottom: 0, left: 0, right: 0,
                                                height: '55px',
                                                background: 'linear-gradient(to top, rgba(10,10,20,0.95), transparent)',
                                                zIndex: 2,
                                            }}
                                        />
                                    </div>

                                    {/* Text body */}
                                    <div style={{ padding: '10px 14px 0', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                                        <h3
                                            style={{
                                                margin: 0,
                                                fontSize: '13px',
                                                fontWeight: 800,
                                                lineHeight: 1.2,
                                                background: `linear-gradient(90deg, rgba(${member.color},1), #fff)`,
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                            }}
                                        >
                                            {member.name}
                                        </h3>
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                marginTop: '5px',
                                                padding: '2px 8px',
                                                borderRadius: '20px',
                                                fontSize: '9px',
                                                fontWeight: 700,
                                                letterSpacing: '0.06em',
                                                textTransform: 'uppercase',
                                                background: `rgba(${member.color}, 0.18)`,
                                                border: `1px solid rgba(${member.color}, 0.4)`,
                                                color: `rgb(${member.color})`,
                                                alignSelf: 'flex-start',
                                            }}
                                        >
                                            {member.role.split(' & ')[0].split(',')[0]}
                                        </span>
                                        <p
                                            style={{
                                                margin: '8px 0 0',
                                                fontSize: '10px',
                                                color: 'rgba(180,180,200,0.85)',
                                                lineHeight: 1.5,
                                                flex: 1,
                                                overflow: 'hidden',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical' as const,
                                            }}
                                        >
                                            {member.description}
                                        </p>
                                    </div>

                                    {/* Social row */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: '6px',
                                            padding: '10px 14px 12px',
                                            borderTop: `1px solid rgba(${member.color}, 0.15)`,
                                            marginTop: 'auto',
                                        }}
                                    >
                                        <a
                                            href={member.linkedin ?? '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={e => e.stopPropagation()}
                                            style={{
                                                width: '28px', height: '28px',
                                                borderRadius: '8px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: `rgba(${member.color}, 0.12)`,
                                                border: `1px solid rgba(${member.color}, 0.3)`,
                                                color: `rgb(${member.color})`,
                                                transition: 'all 0.2s',
                                                textDecoration: 'none',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <LinkedInIcon className="w-3.5 h-3.5" />
                                        </a>
                                        <a
                                            href={member.instagram ?? '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={e => e.stopPropagation()}
                                            style={{
                                                width: '28px', height: '28px',
                                                borderRadius: '8px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: `rgba(${member.color}, 0.12)`,
                                                border: `1px solid rgba(${member.color}, 0.3)`,
                                                color: `rgb(${member.color})`,
                                                transition: 'all 0.2s',
                                                textDecoration: 'none',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <InstagramIcon className="w-3.5 h-3.5" />
                                        </a>
                                        <span
                                            style={{
                                                fontSize: '8.5px',
                                                color: 'rgba(150,150,170,0.7)',
                                                alignSelf: 'center',
                                                marginLeft: '4px',
                                                lineHeight: 1.3,
                                                flex: 1,
                                            }}
                                        >
                                            {member.role}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default TeamCarousel;
