import {
    SearchX,
    Sparkles,
    RefreshCcw
} from "lucide-react";

import { useTheme } from "../../../context/ThemeContext";

const EmptyState = ({
    title = "No Data Found",
    message = "Nothing available right now.",
    buttonText,
    onClick
}) => {

    const theme = useTheme();

    return (
        <div
            style={{
                position: "relative",
                overflow: "hidden",
                background: theme.cardBg,
                border: `1px solid ${theme.border}`,
                borderRadius: "32px",
                minHeight: "260px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "28px 16px",
                boxShadow: theme.isDark
                    ? "0 12px 40px rgba(0,0,0,0.25)"
                    : "0 8px 24px rgba(15,23,42,0.08)"
            }}
        >

            {/* Background Glow */}

            <div
                style={{
                    position: "absolute",
                    top: "-80px",
                    right: "-80px",
                    width: "280px",
                    height: "280px",
                    borderRadius: "999px",
                    background: theme.isDark
                        ? "rgba(139,92,246,0.18)"
                        : "rgba(139,92,246,0.10)",
                    filter: "blur(80px)"
                }}
            />

            {/* Icon */}

            <div
                style={{
                    position: "relative",
                    marginBottom: "20px"
                }}
            >

                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: theme.isDark
                            ? "rgba(139,92,246,0.25)"
                            : "rgba(139,92,246,0.12)",
                        borderRadius: "999px",
                        filter: "blur(30px)"
                    }}
                />

                <div
                    style={{
                        position: "relative",
                        width: "72px",
                        height: "72px",
                        borderRadius: "999px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: theme.isDark
                            ? "linear-gradient(135deg,#1B1635,#241C48)"
                            : "linear-gradient(135deg,#F5F0FF,#F8FAFC)",
                        border: `1px solid ${theme.border}`
                    }}
                >
                    <SearchX
                        size={28}
                        color={theme.primary}
                    />
                </div>
            </div>

            {/* Label */}

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "10px"
                }}
            >
                <Sparkles
                    size={16}
                    color={theme.primary}
                />

                <p
                    style={{
                        textTransform: "uppercase",
                        letterSpacing: "1.5px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: theme.primary,
                        margin: 0
                    }}
                >
                    AI Vendor Discovery
                </p>
            </div>

            {/* Title */}

            <h2
                style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: theme.textPrimary,
                    marginBottom: "10px",
                    marginTop: 0
                }}
            >
                {title}
            </h2>

            {/* Message */}

            <p
                style={{
                    maxWidth: "480px",
                    fontSize: "13px",
                    lineHeight: 1.7,
                    color: theme.textMuted,
                    marginBottom: "20px"
                }}
            >
                {message}
            </p>

            {/* Button */}

            {buttonText && (
                <button
                    onClick={onClick}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px 24px",
                        borderRadius: "16px",
                        border: "none",
                        cursor: "pointer",
                        color: "#FFFFFF",
                        fontWeight: 600,
                        background:
                            "linear-gradient(135deg,#7C5AF6,#A78BFA)",
                        boxShadow:
                            "0 0 20px rgba(124,90,246,0.35)"
                    }}
                >
                    <RefreshCcw size={16} />
                    {buttonText}
                </button>
            )}

        </div>
    );
};

export default EmptyState;