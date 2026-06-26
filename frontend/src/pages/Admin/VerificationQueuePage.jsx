import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";
import DashboardLayout from "../../components/layouts/DashboardLayout/DashboardLayout";
import Toast from "../../components/common/Toast/Toast";
import { ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 10

const VerificationQueuePage = () => {
    const theme = useTheme();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [actionLoading, setActionLoading] = useState(null);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    useEffect(() => {

        const handleResize = () => {

            setScreenWidth(window.innerWidth);

        };

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);

    }, []);

    const isMobile = screenWidth < 640;

    const isTablet = screenWidth >= 640 && screenWidth < 1024;

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get("/vendors/");
            const data = res.data?.vendors || res.data?.data?.vendors || [];
            const root = data
                .filter(v => !v.parent_vendor_id)
                .map(v => ({
                    ...v,
                    category: v.managed_teams?.[0]?.name || null,
                    all_categories: v.managed_teams?.map(t => t.name).join(", ") || null,
                }));
            setVendors(root);
        } catch {
            showToast("Failed to load vendors", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchVendors(); }, []);
    const formatDate = (dateStr) => {
        if (!dateStr) return "—";

        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const pending = vendors.filter(v => !v.is_verified && !v.is_rejected);
    const totalPages = Math.ceil(pending.length / ITEMS_PER_PAGE);
    const paginated = pending.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleVerify = async (vendorId) => {
        try {
            setActionLoading(vendorId);
            await axiosInstance.patch(`/vendors/${vendorId}/verify`);
            setVendors(prev => prev.map(v => v.vendor_id === vendorId ? { ...v, is_verified: true } : v));
            showToast("Vendor verified");
        } catch {
            showToast("Verification failed", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (vendorId) => {
        try {
            await axiosInstance.patch(`/vendors/${vendorId}/reject`);
            setVendors(prev => prev.filter(v => v.vendor_id !== vendorId));
            showToast("Vendor rejected");
        } catch {
            showToast("Reject failed", "error");
        }
    };

    const card = {
        background: theme.cardBg, border: `1px solid ${theme.cardBorder}`,
        borderRadius: "20px", padding: "24px",
    };
    const th = {
        textAlign: "left", fontSize: "10px", fontWeight: 600,
        letterSpacing: "0.05em", textTransform: "uppercase",
        color: theme.textMuted, padding: "10px 16px",
        background: theme.panelBg, borderBottom: `1px solid ${theme.cardBorder}`,
    };
    const td = {
        padding: "12px 16px", fontSize: "13px", color: theme.textPrimary,
        borderBottom: `1px solid ${theme.cardBorder}`, verticalAlign: "middle",
    };

    return (
        <DashboardLayout>
        <div style={{ minHeight: "100vh", background: theme.pageBg, padding: isMobile ? "12px" : "20px" }}>

            {toast && (
                <div style={{ position: "fixed", top: "24px", right: "24px", zIndex: 9999 }}>
                    <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
                </div>
            )}

            <div style={{ maxWidth: "1400px", margin: "0 auto", width: "100%"}}>
                <div style={card}>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                        <div style={{ width: "38px", height: "38px", borderRadius: "12px",
                            background: "rgba(245,158,11,0.12)", display: "flex",
                            alignItems: "center", justifyContent: "center", color: "#F59E0B" }}>
                            <ShieldCheck size={18} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: "16px", fontWeight: 700, color: theme.textPrimary, margin: 0 }}>
                                Verification Queue ({pending.length})
                            </h2>
                            <p style={{ fontSize: "11px", color: theme.textMuted, margin: 0 }}>
                                Vendors awaiting verification
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
                            <div style={{ width: "28px", height: "28px", border: "3px solid #7C5AF6",
                                borderTopColor: "transparent", borderRadius: "50%",
                                animation: "spin 0.8s linear infinite" }} />
                        </div>
                    ) : pending.length === 0 ? (
                        <p style={{ fontSize: "13px", color: theme.textMuted, textAlign: "center", padding: "32px 0" }}>
                            Nothing pending review.
                        </p>
                    ) : (
                        <>
                            <div style={{ overflowX: "auto", width: "100%", borderRadius: "12px", border: `1px solid ${theme.cardBorder}` }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: isMobile ? "850px" : "600px" }}>
                                    <thead>
                                        <tr>
                                            {["Vendor Name", "Category", "City", "Action"].map(h => (
                                                <th key={h} style={th}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginated.map(vendor => (
                                            <tr key={vendor.vendor_id}>
                                                <td style={{ ...td, fontWeight: 600 }}>{vendor.name}</td>
                                                <td style={{ ...td, textTransform: "capitalize", color: theme.textMuted }}>
                                                    {vendor.all_categories || "—"}
                                                </td>
                                                <td style={{ ...td, color: theme.textMuted }}>{vendor.city || "—"}</td>
                                                <td style={td}>
                                                    <div style={{ display: "flex", gap: "8px" }}>
                                                        <button
                                                            onClick={() => handleVerify(vendor.vendor_id)}
                                                            disabled={actionLoading === vendor.vendor_id}
                                                            style={{ padding: "4px 12px", borderRadius: "8px",
                                                                border: "1px solid rgba(34,197,94,0.3)",
                                                                background: "rgba(34,197,94,0.1)",
                                                                color: "#22C55E", fontSize: "11px",
                                                                fontWeight: 600, cursor: "pointer" }}>
                                                            Verify
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(vendor.vendor_id)}
                                                            style={{ padding: "4px 12px", borderRadius: "8px",
                                                                border: "1px solid rgba(239,68,68,0.3)",
                                                                background: "rgba(239,68,68,0.1)",
                                                                color: "#EF4444", fontSize: "11px",
                                                                fontWeight: 600, cursor: "pointer" }}>
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages > 1 && (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                                    marginTop: "14px", paddingTop: "14px", borderTop: `1px solid ${theme.cardBorder}` }}>
                                    <p style={{ fontSize: "11px", color: theme.textMuted }}>
                                        Page {currentPage} of {totalPages}
                                    </p>
                                    <div style={{ display: "flex", gap: "6px" }}>
                                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            style={{ width: "28px", height: "28px", borderRadius: "8px",
                                                border: `1px solid ${theme.cardBorder}`, background: theme.panelBg,
                                                color: theme.textPrimary, cursor: "pointer",
                                                opacity: currentPage === 1 ? 0.4 : 1 }}>
                                            <ChevronLeft size={14} />
                                        </button>
                                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            style={{ width: "28px", height: "28px", borderRadius: "8px",
                                                border: `1px solid ${theme.cardBorder}`, background: theme.panelBg,
                                                color: theme.textPrimary, cursor: "pointer",
                                                opacity: currentPage === totalPages ? 0.4 : 1 }}>
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
        </DashboardLayout>
    );
};

export default VerificationQueuePage;