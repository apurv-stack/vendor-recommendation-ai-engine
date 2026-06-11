// ─────────────────────────────────────────────
//  All SVG vector illustrations used in the app
// ─────────────────────────────────────────────

export const AIBotIllustration = ({
    width = 220,
    height = 220,
    isDark = true
}) => {

    const strokeColor = isDark ? "#A78BFA" : "#B197FC";

    const bodyFill = isDark
        ? "#16122F"
        : "#FCFBFF";

    const panelFill = isDark
        ? "#1B1635"
        : "#F8F5FF";
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 320 280"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="headGrad" x1="0" y1="0" x2="0.4" y2="1">
                    <stop offset="0%" stopColor={isDark ? "#8B3CF7" : "#C4B5FD"} />
                    <stop offset="100%" stopColor={isDark ? "#4C1D95" : "#8B5CF6"} />
                </linearGradient>
                <linearGradient id="bodyGrad" x1="0" y1="0" x2="0.3" y2="1">
                    <stop offset="0%" stopColor={isDark ? "#7C3AED" : "#A78BFA"} />
                    <stop offset="100%" stopColor={isDark ? "#4C1D95" : "#7C3AED"} />
                </linearGradient>
                <linearGradient id="botBadge" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#9D4EDD" />
                    <stop offset="100%" stopColor="#5A189A" />
                </linearGradient>
                <linearGradient id="visorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0A0520" />
                    <stop offset="100%" stopColor="#04020F" />
                </linearGradient>
                <linearGradient id="cardGrad" x1="0" y1="0" x2="0.2" y2="1">
                    <stop offset="0%" stopColor={isDark ? "rgba(130,70,240,0.32)" : "rgba(245,240,255,0.88)"} />
                    <stop offset="100%" stopColor={isDark ? "rgba(55,12,130,0.2)" : "rgba(230,220,255,0.72)"} />
                </linearGradient>
                <linearGradient id="cardShine" x1="0" y1="0" x2="0.4" y2="1">
                    <stop offset="0%" stopColor={isDark ? "rgba(190,150,255,0.2)" : "rgba(255,255,255,0.75)"} />
                    <stop offset="55%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
                <radialGradient id="bgGlow" cx="38%" cy="65%" r="55%">
                    <stop offset="0%" stopColor={isDark ? "rgba(120,50,230,0.65)" : "rgba(124,90,246,0.22)"} />
                    <stop offset="50%" stopColor={isDark ? "rgba(90,28,190,0.3)" : "rgba(124,90,246,0.08)"} />
                    <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                </radialGradient>
                <radialGradient id="cardGlowRad" cx="25%" cy="18%" r="70%">
                    <stop offset="0%" stopColor={isDark ? "rgba(180,140,255,0.18)" : "rgba(255,255,255,0.9)"} />
                    <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                </radialGradient>
                <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation={isDark ? "5" : "2"} result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation={isDark ? "14" : "4"} result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="deepGlow" x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur stdDeviation={isDark ? "22" : "6"} result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="eyeGlow" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation={isDark ? "4" : "1.5"} result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <clipPath id="cardClip">
                    <rect x="174" y="24" width="116" height="156" rx="18" />
                </clipPath>
            </defs>

            {/* ── BACKGROUND GLOW ── */}
            <ellipse cx="112" cy="195" rx="125" ry="100" fill="url(#bgGlow)" />
            {isDark && <ellipse cx="112" cy="210" rx="88" ry="68" fill="rgba(80,20,180,0.25)" />}

            {/* ── STARS ── */}
            <circle cx="16" cy="48" r="2"   fill="#A78BFA" opacity="0.8" />
            <circle cx="36" cy="24" r="1.5" fill="#C4B5FD" opacity="0.6" />
            <circle cx="8"  cy="80" r="1.2" fill="#A78BFA" opacity="0.5" />
            <circle cx="50" cy="16" r="1"   fill="#C4B5FD" opacity="0.45" />
            <path d="M26 68 L27.6 63 L29.2 68 L34.5 69.5 L29.2 71 L27.6 76 L26 71 L20.7 69.5Z"
                fill="#A78BFA" opacity={isDark ? "0.6" : "0.35"} />
            <circle cx="282" cy="16" r="1.8" fill="#C4B5FD" opacity="0.5" />
            <circle cx="304" cy="36" r="1.2" fill="#A78BFA" opacity="0.4" />
            <path d="M294 50 L295 47 L296 50 L299 51 L296 52 L295 55 L294 52 L291 51Z"
                fill="#C4B5FD" opacity="0.4" />

            {/* ── GLASSMORPHISM CARD ── */}
            {isDark && (
                <rect x="170" y="20" width="124" height="164" rx="20"
                    fill="rgba(110,40,220,0.22)"
                    filter={isDark ? "url(#strongGlow)" : undefined} />
            )}
            <rect x="174" y="24" width="116" height="156" rx="18" fill="url(#cardGrad)" />
            <rect x="174" y="24" width="116" height="156" rx="18"
                fill="url(#cardGlowRad)" clipPath="url(#cardClip)" />
            <rect x="174" y="24" width="116" height="62" rx="18"
                fill="url(#cardShine)" clipPath="url(#cardClip)" />
            <rect x="174" y="24" width="116" height="156" rx="18"
                fill="none"
                stroke={isDark ? "rgba(170,130,255,0.6)" : "rgba(139,92,246,0.4)"}
                strokeWidth="1.2" />
            <rect x="176" y="26" width="112" height="152" rx="16"
                fill="none"
                stroke={isDark ? "rgba(210,180,255,0.1)" : "rgba(255,255,255,0.55)"}
                strokeWidth="0.8" />

            {/* card row 1 — person */}
            <circle cx="198" cy="58" r="15"
                fill={isDark ? "rgba(110,42,220,0.38)" : "rgba(139,92,246,0.15)"}
                stroke={isDark ? "rgba(170,130,255,0.6)" : "rgba(139,92,246,0.35)"}
                strokeWidth="1.2" />
            <circle cx="198" cy="54" r="5.5" fill={isDark ? "#A78BFA" : "#7C3AED"} opacity="0.9" />
            <path d="M189 68 Q198 63 207 68"
                stroke={isDark ? "#A78BFA" : "#6D28D9"} strokeWidth="1.6" strokeLinecap="round" fill="none" />
            <rect x="218" y="49" width="58" height="6" rx="3"
                fill={isDark ? "rgba(170,130,255,0.38)" : "rgba(139,92,246,0.25)"} />
            <rect x="218" y="59" width="44" height="5" rx="2.5"
                fill={isDark ? "rgba(170,130,255,0.22)" : "rgba(139,92,246,0.15)"} />
            <rect x="218" y="68" width="50" height="5" rx="2.5"
                fill={isDark ? "rgba(170,130,255,0.15)" : "rgba(139,92,246,0.1)"} />
            <line x1="182" y1="88" x2="280" y2="88"
                stroke={isDark ? "rgba(170,130,255,0.2)" : "rgba(139,92,246,0.18)"} strokeWidth="0.8" />

            {/* card row 2 — shop */}
            <rect x="185" y="98" width="24" height="20" rx="5"
                fill={isDark ? "rgba(110,42,220,0.32)" : "rgba(139,92,246,0.12)"}
                stroke={isDark ? "rgba(170,130,255,0.5)" : "rgba(139,92,246,0.28)"} strokeWidth="1" />
            <path d="M183 102 Q197 97 211 102"
                stroke={isDark ? "#A78BFA" : "#7C3AED"} strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <rect x="190" y="107" width="11" height="11" rx="2"
                fill={isDark ? "rgba(170,130,255,0.55)" : "rgba(139,92,246,0.35)"} />
            <rect x="216" y="100" width="52" height="5.5" rx="2.8"
                fill={isDark ? "rgba(170,130,255,0.32)" : "rgba(139,92,246,0.22)"} />
            <rect x="216" y="109" width="40" height="4.5" rx="2.2"
                fill={isDark ? "rgba(170,130,255,0.2)" : "rgba(139,92,246,0.13)"} />
            <line x1="182" y1="128" x2="280" y2="128"
                stroke={isDark ? "rgba(170,130,255,0.2)" : "rgba(139,92,246,0.18)"} strokeWidth="0.8" />

            {/* card row 3 — star */}
            <path d="M197 143 l3 9 9.5 0 -7.7 5.6 2.9 9 -7.7-5.6 -7.7 5.6 2.9-9 -7.7-5.6 9.5 0z"
                fill={isDark ? "rgba(170,130,255,0.42)" : "rgba(139,92,246,0.28)"}
                stroke={isDark ? "#A78BFA" : "#7C3AED"} strokeWidth="0.8"
                transform="scale(0.68) translate(92, 72)" />
            <rect x="216" y="140" width="50" height="5.5" rx="2.8"
                fill={isDark ? "rgba(170,130,255,0.32)" : "rgba(139,92,246,0.22)"} />
            <rect x="216" y="149" width="36" height="4.5" rx="2.2"
                fill={isDark ? "rgba(170,130,255,0.2)" : "rgba(139,92,246,0.13)"} />

            {/* ── MAGNIFIER ── */}
            {isDark && (
                <circle cx="258" cy="188" r="36"
                    fill="rgba(100,30,210,0.22)"
                    filter={isDark ? "url(#deepGlow)" : undefined} />
            )}
            <circle cx="258" cy="188" r="29"
                fill={isDark ? "rgba(45,8,105,0.55)" : "rgba(139,92,246,0.1)"}
                stroke={isDark ? "#9D4EDD" : "#7C3AED"}
                strokeWidth="4.5"
                filter={isDark ? "url(#glow)" : undefined} />
            <circle cx="249" cy="179" r="9"
                fill={isDark ? "rgba(190,155,255,0.12)" : "rgba(139,92,246,0.08)"} />
            <circle cx="246" cy="176" r="4.5"
                fill={isDark ? "rgba(215,190,255,0.18)" : "rgba(139,92,246,0.12)"} />
            <line x1="279" y1="209" x2="295" y2="225"
                stroke={isDark ? "#7C3AED" : "#6D28D9"}
                strokeWidth="8" strokeLinecap="round"
                filter={isDark ? "url(#glow)" : undefined} />

            {/* ── GROUND ── */}
            <ellipse cx="112" cy="258" rx="98" ry="17"
                fill={isDark ? "rgba(85,25,175,0.28)" : "rgba(139,92,246,0.1)"} />
            <path d="M0 252 Q60 232 112 244 Q172 256 232 240 Q270 230 320 244 L320 280 L0 280Z"
                fill={isDark ? "rgba(50,10,110,0.38)" : "rgba(167,139,250,0.13)"} />
            <path d="M8 250 C55 234 95 252 148 240 C196 229 244 246 312 234"
                stroke={isDark ? "#6D28D9" : "#A78BFA"}
                strokeWidth="2" opacity={isDark ? "0.75" : "0.4"} fill="none"
                filter={isDark ? "url(#glow)" : undefined} />

            {/* ── BOT BODY GLOW HALO ── */}
            {isDark && (
                <>
                    <ellipse cx="110" cy="190" rx="82" ry="78"
                        fill="rgba(109,40,217,0.3)" filter="url(#deepGlow)" />
                    <ellipse cx="110" cy="170" rx="62" ry="60"
                        fill="rgba(124,58,237,0.2)" />
                </>
            )}

            {/* ── ANTENNA ── */}
            <line x1="110" y1="56" x2="110" y2="34"
                stroke={isDark ? "#9D4EDD" : "#7C3AED"}
                strokeWidth="3.5" strokeLinecap="round"
                filter={isDark ? "url(#glow)" : undefined} />
            {isDark && (
                <circle cx="110" cy="26" r="14" fill="rgba(157,78,221,0.25)" filter={isDark ? "url(#glow)" : undefined} />
            )}
            <circle cx="110" cy="26" r="10"
                fill={isDark ? "#1E0B45" : "#EDE9FE"}
                stroke={isDark ? "#9D4EDD" : "#7C3AED"}
                strokeWidth="2.5"
                filter={isDark ? "url(#glow)" : undefined} />
            <circle cx="110" cy="26" r="6" fill="url(#botBadge)" />
            <circle cx="108" cy="24" r="2.2" fill="rgba(255,255,255,0.65)" />

            {/* ── HEAD ── */}
            <circle cx="110" cy="118" r="62"
                fill="url(#headGrad)"
                filter={isDark ? "url(#strongGlow)" : undefined} />
            <circle cx="110" cy="118" r="62"
                fill="none"
                stroke={isDark ? "rgba(139,92,246,0.55)" : "rgba(139,92,246,0.3)"}
                strokeWidth="1.8" />
            <ellipse cx="85" cy="78" rx="24" ry="11"
                fill="rgba(255,255,255,0.1)" transform="rotate(-22 85 78)" />

            {/* ── VISOR ── */}
            <rect x="65" y="95" width="90" height="52" rx="24"
                fill="url(#visorGrad)" />
            <rect x="66" y="96" width="88" height="50" rx="23"
                fill="none"
                stroke={isDark ? "rgba(139,92,246,0.6)" : "rgba(100,40,200,0.45)"}
                strokeWidth="1.4" />

            {/* ── LEFT EYE — smaller ── */}
            <circle cx="93" cy="120" r="13" fill="#FFFFFF" filter="url(#eyeGlow)" />
            <circle cx="93" cy="120" r="8" fill={isDark ? "#100728" : "#1E0F50"} />
            <circle cx="90" cy="117" r="3.5" fill="#FFFFFF" opacity="0.92" />
            <circle cx="98" cy="124" r="1.5" fill="#FFFFFF" opacity="0.32" />

            {/* ── RIGHT EYE — smaller ── */}
            <circle cx="127" cy="120" r="13" fill="#FFFFFF" filter="url(#eyeGlow)" />
            <circle cx="127" cy="120" r="8" fill={isDark ? "#100728" : "#1E0F50"} />
            <circle cx="124" cy="117" r="3.5" fill="#FFFFFF" opacity="0.92" />
            <circle cx="132" cy="124" r="1.5" fill="#FFFFFF" opacity="0.32" />

            {/* ── SMILE ── */}
            <path d="M97 133 Q110 145 123 133"
                stroke="#FFFFFF" strokeWidth="3"
                strokeLinecap="round" fill="none" opacity="0.88" />

            {/* ── BODY — wide round ball ── */}
            <rect x="55" y="168" width="110" height="84" rx="42"
                fill="url(#bodyGrad)"
                filter={isDark ? "url(#strongGlow)" : undefined} />
            <rect x="55" y="168" width="110" height="84" rx="42"
                fill="none"
                stroke={isDark ? "rgba(139,92,246,0.48)" : "rgba(139,92,246,0.3)"}
                strokeWidth="1.8" />
            <ellipse cx="82" cy="179" rx="20" ry="7" fill="rgba(255,255,255,0.1)" />

            {/* ── AI BADGE ── */}
            <rect x="82" y="190" width="56" height="32" rx="12"
                fill="url(#botBadge)"
                filter={isDark ? "url(#glow)" : undefined} />
            <rect x="82" y="190" width="56" height="14" rx="12"
                fill="rgba(255,255,255,0.22)" />
            <text x="110" y="211"
                textAnchor="middle" fill="#FFFFFF"
                fontSize="13" fontWeight="900" letterSpacing="2.5">AI</text>

            {/* ── LEFT ARM ── */}
            <rect x="22" y="182" width="36" height="18" rx="9"
                fill="url(#bodyGrad)"
                stroke={isDark ? "rgba(139,92,246,0.45)" : "rgba(139,92,246,0.3)"}
                strokeWidth="1.5" />
            <circle cx="23" cy="191" r="10"
                fill="url(#headGrad)"
                stroke={isDark ? "rgba(139,92,246,0.45)" : "rgba(139,92,246,0.3)"}
                strokeWidth="1.5" />

            {/* ── RIGHT ARM ── */}
            <rect x="162" y="182" width="36" height="18" rx="9"
                fill="url(#bodyGrad)"
                stroke={isDark ? "rgba(139,92,246,0.45)" : "rgba(139,92,246,0.3)"}
                strokeWidth="1.5" />
            <circle cx="197" cy="191" r="10"
                fill="url(#headGrad)"
                stroke={isDark ? "rgba(139,92,246,0.45)" : "rgba(139,92,246,0.3)"}
                strokeWidth="1.5" />
        </svg>
    );
};

export const SearchDiscoveryIcon = ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"><circle cx="20" cy="20" r="11" fill="rgba(124,90,246,0.15)" stroke="#A78BFA" strokeWidth="1.5" />
        
        <path d="M28.5 28.5 L38 38" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M16 20h8M20 16v8" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="34" cy="10" r="3" fill="#a78bfa" fillOpacity="0.5" />
        <path d="M38 6l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" fill="#7c5af6" fillOpacity="0.7" />
    </svg>
);

export const RecommendationStarIcon = ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <polygon points="24,5 28.5,16.5 41,16.5 31,24.5 34.5,36 24,28.5 13.5,36 17,24.5 7,16.5 19.5,16.5"
            fill="rgba(124,90,246,0.15)" stroke="#A78BFA" strokeWidth="1.5" strokeLinejoin="round" />
        <polygon points="24,10 27,18.5 36,18.5 29,23.5 31.5,32 24,27 16.5,32 19,23.5 12,18.5 21,18.5"
            fill="#7c5af6" fillOpacity="0.3" />
        <circle cx="38" cy="38" r="7" fill="rgba(167,139,250,0.15)" stroke="#a78bfa" strokeWidth="1.5" />
        <path d="M35 38l2 2 4-4" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const CompareIcon = ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <path d="M24 6v36" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 40h28" stroke="#5a5a8a" strokeWidth="1" strokeLinecap="round" />
        <path d="M14 24l-7 9h14l-7-9z" fill="rgba(124,90,246,0.2)" stroke="#A78BFA" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M34 24l-7 9h14l-7-9z" fill="rgba(167,139,250,0.2)" stroke="#a78bfa" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M14 24h20" stroke="#a78bfa" strokeWidth="1" strokeLinecap="round" strokeDasharray="2.5 2" />
    </svg>
);

export const ClockIcon = ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="16" fill="rgba(124,90,246,0.1)" stroke="#A78BFA" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="11" fill="rgba(124,90,246,0.08)" stroke="#A78BFA" strokeWidth="0.8" strokeOpacity="0.4" />
        <path d="M24 13v11l7 4.5" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="24" cy="24" r="2.5" fill="#7c5af6" />
        <line x1="24" y1="10" x2="24" y2="8" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="24" y1="40" x2="24" y2="38" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="10" y1="24" x2="8" y2="24" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="40" y1="24" x2="38" y2="24" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const ShieldTrustedIcon = ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <path d="M24 5l16 6v11c0 10-7 18-16 21C15 40 8 32 8 22V11l16-6z"
            fill="rgba(124,90,246,0.12)" stroke="#A78BFA" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M24 5l16 6v11c0 10-7 18-16 21"
            fill="rgba(167,139,250,0.08)" />
        <path d="M17 24l5 5 9-10" stroke="#a78bfa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const AiBotIcon = ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="10" y="20" width="28" height="22" rx="7" fill="rgba(124,90,246,0.15)" stroke="#A78BFA" strokeWidth="1.5" />
        <rect x="16" y="10" width="16" height="13" rx="5" fill="rgba(124,90,246,0.15)" stroke="#A78BFA" strokeWidth="1.5" />
        <circle cx="24" cy="9" r="3" fill="#a78bfa" />
        <circle cx="19" cy="28" r="3.5" fill="#a78bfa" fillOpacity="0.8" />
        <circle cx="29" cy="28" r="3.5" fill="#a78bfa" fillOpacity="0.8" />
        <circle cx="19" cy="28" r="2" fill="#c4b5fd" />
        <circle cx="29" cy="28" r="2" fill="#c4b5fd" />
        <path d="M20 35h8" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 31H6M38 31h4" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);