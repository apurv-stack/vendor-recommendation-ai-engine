import Card from "../common/Card/Card";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const VerificationQueue = ({
    vendors = [],
    onVerify,
    onReject,
}) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const pending = vendors.filter((vendor) => !vendor.is_verified && !vendor.is_rejected);
    const visible = pending.slice(0, 5);

    const th = {
        textAlign: "left", fontSize: "10px", fontWeight: 600,
        letterSpacing: "0.05em", textTransform: "uppercase",
        color: theme.textMuted, padding: "0 0 10px",
    };

    const td = {
        padding: "10px 0", fontSize: "12px", color: theme.textPrimary,
        borderTop: `1px solid ${theme.cardBorder}`, verticalAlign: "middle",
    };

    return (
        <Card>
            <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: "14px"
            }}>
                <h2 style={{ fontSize: "16px", fontWeight: 700, color: theme.textPrimary, margin: 0 }}>
                    Verification Queue ({pending.length})
                </h2>
                <button onClick={() => navigate("/admin/verification")}
                    style={{ fontSize: "12px", color: "#7C5AF6", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
                        View All
                </button>
            </div>

            {visible.length === 0 ? (
                <p style={{ fontSize: "12px", color: theme.textMuted }}>Nothing pending review.</p>
            ) : (
                <div
                    style={{
                        overflowX: "auto",
                        overflowY: "auto",
                        maxHeight: "420px"
                    }}
                >
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th style={th}>Vendor Name</th>
                                <th style={th}>Category</th>
                                <th style={th}>City</th>
                                <th style={th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map((vendor) => (
                                <tr key={vendor.vendor_id}>
                                    <td style={{ ...td, fontWeight: 600 }}>{vendor.name}</td>
                                    <td style={{ ...td, textTransform: "capitalize", color: theme.textMuted }}>
                                        {vendor.category || "—"}
                                    </td>
                                    <td style={{ ...td, color: theme.textMuted }}>
                                        {vendor.city || "—"}
                                    </td>
                                    <td style={td}>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <button
                                                onClick={() => onVerify?.(vendor.vendor_id)}
                                                style={{
                                                    padding: "4px 12px", borderRadius: "8px",
                                                    border: "1px solid rgba(34,197,94,0.3)",
                                                    background: "rgba(34,197,94,0.1)",
                                                    color: "#22C55E", fontSize: "11px",
                                                    fontWeight: 600, cursor: "pointer"
                                                }}
                                            >
                                                Verify
                                            </button>
                                            <button
                                                onClick={() => onReject?.(vendor.vendor_id)}
                                                style={{
                                                    padding: "4px 12px", borderRadius: "8px",
                                                    border: "1px solid rgba(239,68,68,0.3)",
                                                    background: "rgba(239,68,68,0.1)",
                                                    color: "#EF4444", fontSize: "11px",
                                                    fontWeight: 600, cursor: "pointer"
                                                }}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
};

export default VerificationQueue;