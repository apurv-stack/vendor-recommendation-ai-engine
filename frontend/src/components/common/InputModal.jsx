import React, { useEffect, useState } from "react";

const InputModal = ({
    isOpen,
    title = "Enter Value",
    label = "",
    placeholder = "",
    defaultValue = "",
    confirmText = "Save",
    cancelText = "Cancel",
    loading = false,
    onConfirm,
    onCancel,
}) => {

    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        setValue(defaultValue);
    }, [defaultValue]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,.45)",
                backdropFilter: "blur(3px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
            }}
        >
            <div
                style={{
                    width: 430,
                    background: "#fff",
                    borderRadius: 20,
                    padding: 28,
                    boxShadow: "0 25px 60px rgba(0,0,0,.18)",
                }}
            >
                <h2
                    style={{
                        fontSize: 22,
                        fontWeight: 700,
                        marginBottom: 20,
                        color: "#111827",
                    }}
                >
                    {title}
                </h2>

                {label && (
                    <label
                        style={{
                            display: "block",
                            marginBottom: 8,
                            fontSize: 14,
                            color: "#4B5563",
                            fontWeight: 600,
                        }}
                    >
                        {label}
                    </label>
                )}

                <input
                    autoFocus
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: 10,
                        border: "1px solid #D1D5DB",
                        outline: "none",
                        fontSize: 15,
                        marginBottom: 28,
                    }}
                />

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 12,
                    }}
                >
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        style={{
                            padding: "10px 18px",
                            borderRadius: 10,
                            border: "1px solid #E5E7EB",
                            background: "#fff",
                            cursor: "pointer",
                            fontWeight: 600,
                        }}
                    >
                        {cancelText}
                    </button>

                    <button
                        disabled={loading}
                        onClick={() => onConfirm(value)}
                        style={{
                            padding: "10px 22px",
                            borderRadius: 10,
                            border: "none",
                            background: "#6D5DFC",
                            color: "#fff",
                            cursor: "pointer",
                            fontWeight: 600,
                        }}
                    >
                        {loading ? "Saving..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InputModal;