import { useTheme } from "../../context/ThemeContext";

const TypingIndicator = () => {
    const t = useTheme();

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <style>{`
                @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-8px)} }
                @keyframes fadeInUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
                @keyframes pulse-ring { 0%{transform:scale(0.8);opacity:0.8} 100%{transform:scale(1.4);opacity:0} }
            `}</style>

            <div style={{ position: "relative", width: 32, height: 32, flexShrink: 0 }}>
                <div style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    background: "rgba(124,90,246,0.3)",
                    animation: "pulse-ring 1.2s ease-out infinite"
                }} />
                <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "linear-gradient(135deg,#7c5af6,#a78bfa)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative", zIndex: 1
                }}>
                    <span style={{ fontSize: 14 }}>✦</span>
                </div>
            </div>

            <div style={{
                padding: "12px 18px", borderRadius: "4px 18px 18px 18px",
                background: t.aiBubbleBg, border: `1px solid ${t.aiBubbleBorder}`,
                display: "flex", flexDirection: "column", gap: 4,
                animation: "fadeInUp 0.3s ease"
            }}>
                <div style={{ fontSize: 10, color: t.textMuted, fontWeight: 500 }}>
                    AI is thinking...
                </div>
                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    {[0, 1, 2].map(d => (
                        <div key={d} style={{
                            width: 7, height: 7, borderRadius: "50%",
                            background: t.loadingDotBg,
                            animation: `bounce 1.2s ease-in-out ${d * 0.2}s infinite`
                        }} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TypingIndicator;