import { useTheme } from "../../../context/ThemeContext";

const Card = ({ children, className = "", style = {} }) => {
    const theme = useTheme();

    return (
        <div
            className={className}
            style={{
                background: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: "16px",
                padding: "18px",
                boxShadow: theme.isDark
                    ? "0 4px 20px rgba(0,0,0,0.18)"
                    : "0 2px 12px rgba(15,23,42,0.05)",
                transition: "all 0.25s ease",
                ...style
            }}
        >
            {children}
        </div>
    );
};

export default Card;