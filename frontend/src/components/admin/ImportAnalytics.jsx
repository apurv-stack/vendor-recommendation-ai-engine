import Card from "../common/Card/Card";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { UploadCloud, ChevronRight } from "lucide-react";

const ImportAnalytics = ({
    lastImportDate = null,
    totalImported = 0,
    successCount = 0,
    failedCount = 0,
}) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const successRate = totalImported > 0
        ? ((successCount / totalImported) * 100).toFixed(1)
        : "0.0";

    const formattedDate = lastImportDate
        ? new Date(lastImportDate).toLocaleString("en-US", {
            month: "short", day: "numeric", year: "numeric",
            hour: "numeric", minute: "2-digit"
        })
        : "No imports yet";

    const hasImportData = false; // No import history tracking in backend yet

    const stats = [
        { label: "Records Imported", value: totalImported.toLocaleString(), color: theme.textPrimary },
        { label: "Success", value: successCount.toLocaleString(), color: "#22C55E" },
        { label: "Failed", value: failedCount.toLocaleString(), color: failedCount > 0 ? "#EF4444" : theme.textMuted },
        { label: "Success Rate", value: `${successRate}%`, color: "#22C55E" },
    ];

    return (
        <Card>
            <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: "20px"
            }}>
                <h2 style={{ fontSize: "16px", fontWeight: 700, color: theme.textPrimary, margin: 0 }}>
                    Import Analytics
                </h2>
                <button onClick={() => navigate("/admin/import")}
                    style={{
                        fontSize: "12px", color: "#7C5AF6", fontWeight: 600,
                        background: "none", border: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "2px"
                    }}>
                        View All Imports <ChevronRight size={13} />
                </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "20px" }}>
                <div style={{
                    width: "48px", height: "48px", borderRadius: "14px",
                    background: "rgba(124,90,246,0.12)", display: "flex",
                    alignItems: "center", justifyContent: "center", color: "#7C5AF6",
                    marginBottom: "10px"
                }}>
                    <UploadCloud size={22} />
                </div>
                <p style={{ fontSize: "12px", color: theme.textMuted, margin: "0 0 2px" }}>Last Import</p>
                <p style={{ fontSize: "13px", fontWeight: 600, color: theme.textPrimary, margin: 0 }}>
                    {formattedDate}
                </p>
            </div>

            <div
        style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
            gap: "10px",
            marginBottom: "16px"
        }}
    >
        {stats.map((s) => (
            <div
                key={s.label}
                style={{
                    padding: "12px",
                    borderRadius: "12px",
                    background: theme.panelBg,
                    border: `1px solid ${theme.cardBorder}`,
                    textAlign: "center"
                }}
            >
                <p
                    style={{
                        fontSize: "20px",
                        fontWeight: 800,
                        color: s.color,
                        margin: "0 0 4px"
                    }}
                >
                    {s.value}
                </p>

                <p
                    style={{
                        fontSize: "10px",
                        color: theme.textMuted,
                        margin: 0
                    }}
                >
                    {s.label}
                </p>
            </div>
        ))}
    </div>

            <div
        style={{
            width: "100%",
            height: "8px",
            borderRadius: "8px",
            background: theme.cardBorder,
            overflow: "hidden"
        }}
    >
        <div
            style={{
                width: `${successRate}%`,
                height: "100%",
                borderRadius: "8px",
                background: "linear-gradient(90deg, #22C55E, #16A34A)",
                transition: "width 0.3s ease"
            }}
        />
    </div>
        </Card>
    );
};

export default ImportAnalytics;