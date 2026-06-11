import { useTheme } from "../../../context/ThemeContext";

const PageHeader = ({
    title,
    subtitle,
    action
}) => {

    const theme = useTheme();

    return (
        <div
            style={{
                background: theme.cardBg,
                border: `1px solid ${theme.border}`,
                borderRadius: "24px",
                padding: "24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "24px",
                marginBottom: "24px"
            }}
        >
            <div>
                <h1
                    style={{
                        fontSize: "42px",
                        fontWeight: 700,
                        color: theme.text,
                        margin: 0
                    }}
                >
                    {title}
                </h1>

                <p
                    style={{
                        color: theme.textMuted,
                        marginTop: "8px"
                    }}
                >
                    {subtitle}
                </p>
            </div>

            {action}
        </div>
    );
};

export default PageHeader;