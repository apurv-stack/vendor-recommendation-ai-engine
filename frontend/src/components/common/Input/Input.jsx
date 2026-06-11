import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

const Input = ({
    label,
    type = "text",
    placeholder,
    name,
    value,
    onChange,
    required = false,
    disabled = false,
    error = "",
    helperText = "",
    icon = null
}) => {

    const theme = useTheme();

    const [showPassword, setShowPassword] = useState(false);

    const actualType =
        type === "password"
            ? showPassword
                ? "text"
                : "password"
            : type;

    return (
        <div className="w-full">

            {label && (
                <label
                    htmlFor={name}
                    style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: theme.text
                    }}
                >
                    {label}

                    {required && (
                        <span
                            style={{
                                color: "#EF4444",
                                marginLeft: "4px"
                            }}
                        >
                            *
                        </span>
                    )}
                </label>
            )}

            <div
                style={{
                    position: "relative"
                }}
            >

                {icon && (
                    <div
                        style={{
                            position: "absolute",
                            left: "16px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: theme.textMuted,
                            zIndex: 2
                        }}
                    >
                        {icon}
                    </div>
                )}

                <input
                    id={name}
                    type={actualType}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                    disabled={disabled}
                    style={{
                        width: "100%",
                        padding: "16px 20px",
                        paddingLeft: icon ? "48px" : "20px",
                        paddingRight: type === "password" ? "48px" : "20px",

                        background: theme.cardBg,
                        border: error
                            ? "1px solid #EF4444"
                            : `1px solid ${theme.border}`,

                        borderRadius: "16px",

                        color: theme.text,
                        fontSize: "14px",

                        outline: "none",

                        transition: "all 0.25s ease",

                        opacity: disabled ? 0.6 : 1
                    }}
                />

                {type === "password" && (
                    <button
                        type="button"
                        onClick={() =>
                            setShowPassword(prev => !prev)
                        }
                        style={{
                            position: "absolute",
                            right: "16px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: theme.textMuted
                        }}
                    >
                        {showPassword
                            ? <EyeOff size={18} />
                            : <Eye size={18} />
                        }
                    </button>
                )}
            </div>

            {error && (
                <p
                    style={{
                        marginTop: "8px",
                        fontSize: "13px",
                        color: "#EF4444",
                        fontWeight: 500
                    }}
                >
                    {error}
                </p>
            )}

            {helperText && !error && (
                <p
                    style={{
                        marginTop: "8px",
                        fontSize: "13px",
                        color: theme.textMuted
                    }}
                >
                    {helperText}
                </p>
            )}
        </div>
    );
};

export default Input;