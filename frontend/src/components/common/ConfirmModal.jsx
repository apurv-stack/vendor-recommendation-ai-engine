import React from "react";
import { AlertTriangle } from "lucide-react";

const ConfirmModal = ({
    isOpen,
    title = "Confirm Action",
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmColor = "#EF4444",
    loading = false,
    onConfirm,
    onCancel,
}) => {

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
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
                    animation: "fadeIn .18s ease",
                }}
            >
                <div
                    style={{
                        width: 52,
                        height: 52,
                        borderRadius: "50%",
                        background: "#FEF2F2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 18,
                    }}
                >
                    <AlertTriangle size={24} color="#DC2626" />
                </div>

                <h2
                    style={{
                        fontSize: 22,
                        fontWeight: 700,
                        marginBottom: 10,
                        color: "#111827",
                    }}
                >
                    {title}
                </h2>

                <p
                    style={{
                        color: "#6B7280",
                        lineHeight: 1.6,
                        fontSize: 15,
                        marginBottom: 28,
                    }}
                >
                    {message}
                </p>

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
                        onClick={onConfirm}
                        style={{
                            padding: "10px 22px",
                            borderRadius: 10,
                            border: "none",
                            background: confirmColor,
                            color: "#fff",
                            cursor: "pointer",
                            fontWeight: 600,
                        }}
                    >
                        {loading ? "Please wait..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;