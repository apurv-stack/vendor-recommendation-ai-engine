import { useTheme } from "../../../context/ThemeContext";

const KpiCard = ({
    title,
    value,
    icon,
    color
}) => {

    const theme = useTheme();

    return (
        <div
            style={{
                background: theme.cardBg,
                border: `1px solid ${theme.border}`,
                borderRadius: "20px",
                padding: "20px",
                minHeight: "120px",
                transition: "all 0.25s ease",
                boxShadow: theme.isDark
                    ? "0 8px 24px rgba(0,0,0,0.25)"
                    : "0 4px 12px rgba(15,23,42,0.08)"
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start"
                }}
            >
                <div>
                    <p
                        style={{
                            fontSize: "13px",
                            color: theme.textMuted,
                            marginBottom: "10px",
                            fontWeight: 500
                        }}
                    >
                        {title}
                    </p>

                    <h2
                        style={{
                            fontSize: "32px",
                            fontWeight: 700,
                            color: theme.text,
                            margin: 0
                        }}
                    >
                        {value}
                    </h2>
                </div>

                <div
                    style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "14px",
                        background: color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff"
                    }}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default KpiCard;