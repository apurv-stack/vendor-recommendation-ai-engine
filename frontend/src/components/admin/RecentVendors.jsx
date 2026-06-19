import Card from "../common/Card/Card";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const avatarColors = ["#7C5AF6","#22C55E","#F59E0B","#EF4444","#3B82F6","#EC4899","#14B8A6","#F97316"];
const vendorColor = (name = "") => avatarColors[name.charCodeAt(0) % avatarColors.length];

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d)) return "—";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const RecentVendors = ({ vendors = [] }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const recent = [...vendors]
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .slice(0, 5);

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
                    Recent Vendors
                </h2>
                <button onClick={() => navigate("/admin/vendors")}
                    style={{ fontSize: "12px", color: "#7C5AF6", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
                        View All
                </button>
            </div>

            {recent.length === 0 ? (
                <p style={{ fontSize: "12px", color: theme.textMuted }}>No vendors yet.</p>
            ) : (
                <div
                    style={{
                        overflowX: "auto",
                        maxHeight: "420px",
                        overflowY: "auto"
                    }}
                >
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th style={th}>Vendor Name</th>
                                <th style={th}>Category</th>
                                <th style={th}>City</th>
                                <th style={th}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recent.map((vendor) => (
                                <tr key={vendor.vendor_id}>
                                    <td style={td}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <div style={{
                                                width: "26px", height: "26px", borderRadius: "8px",
                                                flexShrink: 0, background: vendorColor(vendor.name),
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                color: "#fff", fontSize: "10px", fontWeight: 700
                                            }}>
                                                {(vendor.name || "?").slice(0, 2).toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{vendor.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ ...td, textTransform: "capitalize", color: theme.textMuted }}>
                                        {vendor.category || "—"}
                                    </td>
                                    <td style={{ ...td, color: theme.textMuted }}>
                                        {vendor.city || "—"}
                                    </td>
                                    <td style={td}>
                                        <span style={{
                                            padding: "3px 10px", borderRadius: "20px",
                                            fontSize: "10px", fontWeight: 700,
                                            background: vendor.is_verified
                                                ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.12)",
                                            color: vendor.is_verified ? "#22C55E" : "#F59E0B"
                                        }}>
                                            {vendor.is_verified ? "Verified" : "Pending"}
                                        </span>
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

export default RecentVendors;