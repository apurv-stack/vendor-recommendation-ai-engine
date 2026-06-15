import { useTheme } from "../../../context/ThemeContext";

const KpiCard = ({ title, value, icon, color, subtitle }) => {
    const theme = useTheme();

    return (
        <div
            style={{
                background: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: "14px",
                padding: "12px 14px",
                minHeight: "88px",
                transition: "all 0.25s ease",
                boxShadow: theme.isDark
                    ? "0 8px 24px rgba(0,0,0,0.25)"
                    : "0 4px 12px rgba(15,23,42,0.06)"
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                <div style={{ flex: 1 }}>
                    <p
                        style={{
                            fontSize: "10px",
                            color: theme.textMuted,
                            marginBottom: "4px",
                            fontWeight: 500
                        }}
                    >
                        {title}
                    </p>

                    <h2
                        style={{
                            fontSize: "18px",
                            fontWeight: 700,
                            color: theme.textPrimary,
                            margin: "0 0 2px 0",
                            lineHeight: 1
                        }}
                    >
                        {value}
                    </h2>

                    <p
                        style={{
                            fontSize: "10px",
                            color: theme.textFaint
                        }}
                    >
                        {subtitle || "0% vs last 7 days"}
                    </p>
                </div>

                <div
                    style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "10px",
                        background: `${color}22`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: color,
                        flexShrink: 0
                    }}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default KpiCard;