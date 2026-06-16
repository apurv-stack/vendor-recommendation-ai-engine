import { useTheme } from "../../../context/ThemeContext";

const PageHeader = ({ title, subtitle, action }) => {
    const theme = useTheme();

    return (
        <div
            style={{
                background: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: "18px",
                padding: "14px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
                flexWrap: "wrap"
            }}
        >
            <div style={{ minWidth: 0 }}>
                <h1
                    style={{
                        fontSize: "clamp(16px, 4vw, 24px)",
                        fontWeight: 700,
                        color: theme.textPrimary,
                        margin: 0,
                        lineHeight: 1.2,
                        wordBreak: "break-word"
                    }}
                >
                    {title}
                </h1>

                <p
                    style={{
                        color: theme.textMuted,
                        marginTop: "4px",
                        fontSize: "clamp(11px, 2vw, 13px)",
                        wordBreak: "break-word"
                    }}
                >
                    {subtitle}
                </p>
            </div>

            {action && (
                <div style={{ flexShrink: 0 }}>
                    {action}
                </div>
            )}
        </div>
    );
};

export default PageHeader;