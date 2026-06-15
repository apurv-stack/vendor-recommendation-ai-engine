import { useTheme } from "../../../context/ThemeContext";

const PageHeader = ({ title, subtitle, action }) => {
    const theme = useTheme();

    return (
        <div
            style={{
                background: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: "18px",
                padding: "18px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                marginBottom: "16px"
            }}
        >
            <div>
                <h1
                    style={{
                        fontSize: "24px",
                        fontWeight: 700,
                        color: theme.textPrimary,
                        margin: 0,
                        lineHeight: 1.2
                    }}
                >
                    {title}
                </h1>

                <p
                    style={{
                        color: theme.textMuted,
                        marginTop: "4px",
                        fontSize: "13px"
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