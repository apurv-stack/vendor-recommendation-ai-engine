import {
    CheckCircle,
    AlertCircle,
    Info,
    X
} from "lucide-react";

import { useTheme } from "../../../context/ThemeContext";

const Toast = ({
    message,
    type = "success",
    onClose
}) => {

    const theme = useTheme();

    const variants = {
        success: {
            icon: <CheckCircle size={20} />,
            color: "#22C55E"
        },
        error: {
            icon: <AlertCircle size={20} />,
            color: "#EF4444"
        },
        info: {
            icon: <Info size={20} />,
            color: theme.primary
        }
    };

    const current = variants[type];

    return (
        <div
            style={{
                position: "relative",

                minWidth: "340px",
                maxWidth: "500px",

                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",

                gap: "16px",

                padding: "18px",

                background: theme.cardBg,
                border: `1px solid ${theme.border}`,
                borderRadius: "20px",

                boxShadow: theme.isDark
                    ? "0 10px 30px rgba(0,0,0,.25)"
                    : "0 8px 24px rgba(15,23,42,.08)"
            }}
        >

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px"
                }}
            >
                <div
                    style={{
                        width: "44px",
                        height: "44px",

                        borderRadius: "14px",

                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",

                        background: `${current.color}20`,
                        color: current.color
                    }}
                >
                    {current.icon}
                </div>

                <div>
                    <div
                        style={{
                            fontWeight: 600,
                            color: theme.text
                        }}
                    >
                        {type === "success"
                            ? "Success"
                            : type === "error"
                                ? "Error"
                                : "Information"}
                    </div>

                    <div
                        style={{
                            fontSize: "14px",
                            color: theme.textMuted,
                            marginTop: "4px"
                        }}
                    >
                        {message}
                    </div>
                </div>
            </div>

            <button
                onClick={onClose}
                style={{
                    width: "36px",
                    height: "36px",

                    border: "none",
                    borderRadius: "12px",

                    background: "transparent",
                    cursor: "pointer",

                    color: theme.textMuted
                }}
            >
                <X size={16} />
            </button>

            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,

                    height: "4px",
                    width: "100%",

                    borderRadius: "20px 20px 0 0",

                    background: current.color
                }}
            />
        </div>
    );
};

export default Toast;