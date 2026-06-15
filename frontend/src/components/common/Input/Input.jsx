import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

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

    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState(false);
    const [hovered, setHovered] = useState(false);

    const actualType =
        type === "password"
            ? showPassword
                ? "text"
                : "password"
            : type;

    const isActive = focused || hovered;

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
                        color: "#1E293B"
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
                            color: focused ? "#6366F1" : "#94A3B8",
                            zIndex: 2,
                            transition: "color 0.25s ease"
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
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    required={required}
                    disabled={disabled}
                    style={{
                        width: "100%",
                        padding: "16px 20px",
                        paddingLeft: icon ? "48px" : "20px",
                        paddingRight: type === "password" ? "48px" : "20px",

                        background: isActive
                            ? "rgba(255, 255, 255, 0.65)"
                            : "rgba(255, 255, 255, 0.4)",

                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",

                        border: error
                            ? "1px solid #EF4444"
                            : focused
                                ? "1px solid #6366F1"
                                : "1px solid rgba(226, 232, 240, 0.8)",

                        borderRadius: "16px",

                        color: "#1E293B",
                        fontSize: "14px",

                        outline: "none",

                        boxShadow: focused
                            ? "0 0 0 4px rgba(99, 102, 241, 0.12)"
                            : isActive
                                ? "0 4px 12px rgba(15, 23, 42, 0.06)"
                                : "none",

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
                            color: "#94A3B8"
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
                        color: "#94A3B8"
                    }}
                >
                    {helperText}
                </p>
            )}
        </div>
    );
};

export default Input;