import React from 'react';
/* ─────────────────────────────────────────────────────────────────────────────
   Official brand icons via devicons CDN (jsdelivr — fast, reliable, versioned)
   face-api.js has no devicon → clean inline SVG instead
──────────────────────────────────────────────────────────────────────────────── */
const DV = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';

/* Inline SVG for face-api.js */
const FaceApiIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="1.4" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="9"  cy="10" r="1.4" fill="#A855F7" stroke="none" />
        <circle cx="15" cy="10" r="1.4" fill="#A855F7" stroke="none" />
        <path d="M8.5 15.5c.9 1.5 2.3 2.5 3.5 2.5s2.6-1 3.5-2.5" />
        <line x1="4"  y1="9"  x2="6"  y2="10" />
        <line x1="20" y1="9"  x2="18" y2="10" />
    </svg>
);

/* ─── Data ────────────────────────────────────────────────────────────────── */
interface Tech {
    name: string;
    color: string;
    /** src string → <img>, ReactNode → rendered inline */
    icon: string | React.ReactNode;
}

const ALL_TECH: Tech[] = [
    { name: 'React 19',       color: '#61DAFB', icon: `${DV}/react/react-original.svg`                },
    { name: 'TypeScript',     color: '#3178C6', icon: `${DV}/typescript/typescript-original.svg`       },
    { name: 'Vite',           color: '#8B7CF8', icon: `${DV}/vitejs/vitejs-original.svg`               },
    { name: 'Tailwind CSS',   color: '#06B6D4', icon: `${DV}/tailwindcss/tailwindcss-original.svg`     },
    { name: 'FastAPI',        color: '#00C9A7', icon: `${DV}/fastapi/fastapi-original.svg`             },
    { name: 'MongoDB',        color: '#47A248', icon: `${DV}/mongodb/mongodb-original.svg`             },
    { name: 'TensorFlow',     color: '#FF6F00', icon: `${DV}/tensorflow/tensorflow-original.svg`       },
    { name: 'OpenCV',         color: '#7B61FF', icon: `${DV}/opencv/opencv-original.svg`               },
    { name: 'face-api.js',    color: '#A855F7', icon: <FaceApiIcon size={64} />                        },
    { name: 'React Router',   color: '#F44250', icon: `${DV}/reactrouter/reactrouter-original.svg`     },
    { name: 'GitHub Actions', color: '#2088FF', icon: `${DV}/githubactions/githubactions-original.svg` },
];

const CARD_W  = 200;
const ICON_SZ = 96;

const Card: React.FC<{ tech: Tech }> = ({ tech }) => (
    <div
        className="flex-shrink-0 flex flex-col items-center gap-4 mx-2"
        style={{ width: `${CARD_W}px` }}
    >
        <div
            className="flex items-center justify-center rounded-3xl transition-transform duration-300 hover:-translate-y-2"
            style={{
                width:      `${ICON_SZ + 24}px`,
                height:     `${ICON_SZ + 24}px`,
                background: `${tech.color}22`,
                border:     `1.5px solid ${tech.color}55`,
                boxShadow:  `0 0 32px ${tech.color}28, inset 0 1px 0 rgba(255,255,255,0.12)`,
            }}
        >
            {typeof tech.icon === 'string' ? (
                <img
                    src={tech.icon as string}
                    alt={tech.name}
                    width={ICON_SZ}
                    height={ICON_SZ}
                    loading="lazy"
                    draggable={false}
                    style={{ objectFit: 'contain', userSelect: 'none' }}
                />
            ) : (
                tech.icon
            )}
        </div>
        <span
            className="text-[13px] font-semibold text-center leading-tight"
            style={{ color: 'rgba(210,210,235,0.88)' }}
        >
            {tech.name}
        </span>
    </div>
);

const TechMarquee: React.FC = () => (
    <section
        className="relative py-16 overflow-hidden"
        style={{
            background:   'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(139,92,246,0.06) 50%, rgba(255,255,255,0.03) 100%)',
            borderTop:    '1px solid rgba(255,255,255,0.07)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
    >
        <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(139,92,246,0.45),transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(236,72,153,0.35),transparent)' }} />

        <div className="text-center mb-12">
            <span
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest"
                style={{
                    background: 'rgba(255,255,255,0.05)',
                    border:     '1px solid rgba(255,255,255,0.12)',
                    color:      'rgba(180,180,210,0.7)',
                }}
            >
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                Powered By
            </span>
        </div>

        <div
            className="overflow-hidden"
            style={{
                maskImage:       'linear-gradient(90deg,transparent 0%,black 7%,black 93%,transparent 100%)',
                WebkitMaskImage: 'linear-gradient(90deg,transparent 0%,black 7%,black 93%,transparent 100%)',
            }}
        >
            <div className="flex marquee-left" style={{ width: 'max-content' }}>
                {[0, 1, 2, 3].map(rep =>
                    ALL_TECH.map((t, i) => <Card key={`${rep}-${i}`} tech={t} />)
                )}
            </div>
        </div>
    </section>
);

export default TechMarquee;
