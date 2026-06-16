import { useTheme } from "../../context/ThemeContext";
import {
    AIBotIllustration,
    AiBotIcon,
    RecommendationStarIcon,
    CompareIcon,
    ClockIcon,
    ShieldTrustedIcon
} from "./VectorIllustration";

const features = [
    { Icon: AiBotIcon,              title: "AI-Powered Search",      desc: "Intelligent AI finds the best vendors for your needs." },
    { Icon: RecommendationStarIcon, title: "Smart Recommendations",  desc: "Get top matched vendors based on your requirements." },
    { Icon: CompareIcon,            title: "Compare & Decide",       desc: "Compare pricing, ratings and services in one place." },
    { Icon: ClockIcon,              title: "Save Time",              desc: "Quick & easy vendor discovery to save your valuable time." },
    { Icon: ShieldTrustedIcon,      title: "Trusted Vendors",        desc: "Verified and reliable vendors for your special events." }
];

const RightInfoPanel = () => {
    const t = useTheme();

    return (
        <div style={{
            width: "clamp(200px, 15vw, 248px)", flexShrink: 0,
            height: "100%",
            display: "flex", flexDirection: "column",
            background: t.panelBg,
            borderLeft: `1px solid ${t.panelBorder}`,
            overflow: "hidden",
            transition: "background 0.3s, border-color 0.3s"
        }}>
            {/* TITLE */}
            <div style={{ flexShrink: 0, padding: "22px 18px 14px" }}>
                <h3 style={{
                    fontSize: 14, fontWeight: 800,
                    color: t.panelTitleText, margin: 0,
                    letterSpacing: "-0.01em"
                }}>Why VendorDiscovery AI?</h3>
            </div>

            {/* FEATURE LIST */}
            <div className="rip-scroll" style={{
                flex: 1, overflowY: "auto",
                padding: "0 14px",
                scrollbarWidth: "none"
            }}>
                <style>{`.rip-scroll::-webkit-scrollbar{display:none}`}</style>

                {features.map(({ Icon, title, desc }, i) => (
                    <div key={i} style={{
                        display: "flex", alignItems: "flex-start", gap: 12,
                        marginBottom: 8,
                        padding: "8px 10px",
                        borderRadius: 12,
                        background: t.featureCardBg,
                        border: `1px solid ${t.featureCardBorder}`,
                        transition: "background 0.2s"
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = t.featureCardHoverBg}
                        onMouseLeave={e => e.currentTarget.style.background = t.featureCardBg}
                    >
                        <div style={{
                            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                            background: "rgba(124,90,246,0.1)",
                            border: "1px solid rgba(124,90,246,0.2)",
                            display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            <Icon size={16} />
                        </div>
                        <div>
                            <div style={{
                                fontSize: 12, fontWeight: 700,
                                color: t.featureTitleText,
                                marginBottom: 3, lineHeight: 1.3
                            }}>{title}</div>
                            <div style={{
                                fontSize: 11, color: t.featureDescText,
                                lineHeight: 1.55
                            }}>{desc}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* AI BOT ILLUSTRATION */}
            <div style={{
                flexShrink: 0,
                padding: "8px 0 12px",
                borderTop: `1px solid ${t.panelBorder}`,
                display: "flex", flexDirection: "column", alignItems: "center"
            }}>
                <AIBotIllustration
                    width={220}
                    height={220}
                    isDark={t.isDark}
                />
            </div>
        </div>
    );
};

export default RightInfoPanel;