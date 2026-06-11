import { X } from "lucide-react";
import { useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = "md"
}) => {

    const theme = useTheme();

    useEffect(() => {

        const close = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", close);

        return () => {
            document.removeEventListener("keydown", close);
        };

    }, [onClose]);

    if (!isOpen) {
        return null;
    }

    const sizes = {
        sm: "480px",
        md: "800px",
        lg: "1100px",
        xl: "1400px"
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px"
            }}
        >

            {/* Backdrop */}

            <div
                onClick={onClose}
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.45)",
                    backdropFilter: "blur(8px)"
                }}
            />

            {/* Modal */}

            <div
                style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: sizes[size],
                    maxHeight: "90vh",
                    overflow: "hidden",

                    background: theme.cardBg,
                    border: `1px solid ${theme.border}`,
                    borderRadius: "28px",

                    display: "flex",
                    flexDirection: "column",

                    boxShadow: theme.isDark
                        ? "0 20px 60px rgba(0,0,0,0.45)"
                        : "0 20px 50px rgba(15,23,42,0.12)"
                }}
            >

                {/* Glow */}

                <div
                    style={{
                        position: "absolute",
                        top: "-120px",
                        right: "-120px",
                        width: "280px",
                        height: "280px",
                        borderRadius: "999px",
                        background: "rgba(139,92,246,0.18)",
                        filter: "blur(90px)",
                        pointerEvents: "none"
                    }}
                />

                {/* Header */}

                <div
                    style={{
                        position: "relative",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",

                        padding: "24px 32px",

                        borderBottom: `1px solid ${theme.border}`,

                        background: theme.isDark
                            ? "linear-gradient(135deg,#111126,#181830)"
                            : "linear-gradient(135deg,#F8FAFC,#F3F4F6)"
                    }}
                >

                    <div>

                        <p
                            style={{
                                color: theme.primary,
                                textTransform: "uppercase",
                                letterSpacing: "3px",
                                fontSize: "12px",
                                fontWeight: 600,
                                marginBottom: "8px"
                            }}
                        >
                            Enterprise View
                        </p>

                        <h2
                            style={{
                                margin: 0,
                                fontSize: "32px",
                                fontWeight: 700,
                                color: theme.text
                            }}
                        >
                            {title}
                        </h2>

                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            width: "48px",
                            height: "48px",

                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",

                            borderRadius: "14px",

                            background: theme.cardBg,
                            border: `1px solid ${theme.border}`,

                            cursor: "pointer"
                        }}
                    >
                        <X
                            size={20}
                            color={theme.textMuted}
                        />
                    </button>

                </div>

                {/* Body */}

                <div
                    style={{
                        overflowY: "auto",
                        padding: "32px",

                        background: theme.pageBg,
                        color: theme.text,

                        flex: 1
                    }}
                >
                    {children}
                </div>

            </div>

        </div>
    );
};

export default Modal;