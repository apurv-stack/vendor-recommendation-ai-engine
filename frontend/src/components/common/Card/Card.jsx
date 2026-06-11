import { useTheme } from "../../../context/ThemeContext";

const Card = ({
    children,
    className = "",
    style = {}
}) => {

    const theme = useTheme();

    return (
        <div
            className={className}
            style={{
                background: theme.cardBg,
                border: `1px solid ${theme.border}`,
                borderRadius: "20px",
                padding: "20px",
                boxShadow: theme.isDark
                    ? "0 8px 32px rgba(0,0,0,0.25)"
                    : "0 4px 20px rgba(15,23,42,0.08)",
                transition: "all 0.25s ease",
                ...style
            }}
        >
            {children}
        </div>
    );
};

export default Card;