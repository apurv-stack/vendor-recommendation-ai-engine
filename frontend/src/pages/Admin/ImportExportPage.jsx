import { useTheme } from "../../context/ThemeContext";
import DashboardLayout from "../../components/layouts/DashboardLayout/DashboardLayout";
import VendorImportUpload from "../../components/vendor/VendorImportUpload/VendorImportUpload";
import ImportAnalytics from "../../components/admin/ImportAnalytics";
import { Upload } from "lucide-react";

const ImportExportPage = () => {
    const theme = useTheme();

    const card = {
        background: theme.cardBg, border: `1px solid ${theme.cardBorder}`,
        borderRadius: "20px", padding: "24px",
    };

    return (
        <DashboardLayout>
        <div style={{ minHeight: "100vh", background: theme.pageBg, padding: "20px" }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

                <div style={card}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                        <div style={{ width: "38px", height: "38px", borderRadius: "12px",
                            background: "rgba(124,90,246,0.12)", display: "flex",
                            alignItems: "center", justifyContent: "center", color: "#7C5AF6" }}>
                            <Upload size={18} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: "15px", fontWeight: 700, color: theme.textPrimary, margin: 0 }}>
                                Bulk Vendor Import
                            </h2>
                            <p style={{ fontSize: "11px", color: theme.textMuted, margin: 0 }}>
                                Upload CSV or Excel file to import vendors into the platform
                            </p>
                        </div>
                    </div>
                    <VendorImportUpload />
                </div>

                <div style={{
                    background: theme.cardBg,
                    border: `1px solid ${theme.cardBorder}`,
                    borderRadius: "20px", padding: "24px"
                }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: theme.textPrimary, margin: "0 0 8px" }}>
                        Import History
                    </h3>
                    <p style={{ fontSize: "13px", color: theme.textMuted, margin: 0 }}>
                        Import history tracking is not yet enabled. Each import result is returned immediately after upload. Use the upload panel above to import vendors via CSV or Excel.
                    </p>
                </div>

            </div>
        </div>
        </DashboardLayout>
    );
};

export default ImportExportPage;