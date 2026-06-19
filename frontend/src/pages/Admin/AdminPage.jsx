import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import axiosInstance from "../../api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";
import DashboardLayout from "../../components/layouts/DashboardLayout/DashboardLayout";
import Toast from "../../components/common/Toast/Toast";
import AdminStatsCards from "../../components/admin/AdminStatsCard";
import BusinessAnalytics from "../../components/admin/BusinessAnalytics";
import AIIntelligence from "../../components/admin/AIIntelligence";
import RecentVendors from "../../components/admin/RecentVendors";
import VerificationQueue from "../../components/admin/VerificationQueue";
import ImportAnalytics from "../../components/admin/ImportAnalytics";

const AdminPage = () => {
  const { user } = useAuth();
  const theme = useTheme();

  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [adminStats, setAdminStats] = useState({ totalUsers: 0, activeUsers: 0 });
  const [toast, setToast] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchVendors = async () => {
    try {
      setLoadingVendors(true);
      const res  = await axiosInstance.get("/vendors/");
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
      setLoadingVendors(false);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const res = await axiosInstance.get("/vendors/admin/stats");
      setAdminStats({
        totalUsers: res.data?.total_users || 0,
        activeUsers: res.data?.active_users || 0,
      });
    } catch {
      // silently ignore — KPI cards just show 0
    }
  };

  useEffect(() => { fetchVendors(); fetchAdminStats(); }, []);
  useEffect(() => {
    const handleResize = () => {
        setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);

    return () => {
        window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleVerify = async (vendorId, currentStatus) => {
    try {
      await axiosInstance.patch(`/vendors/${vendorId}/verify`);
      setVendors(prev => prev.map(v =>
        v.vendor_id === vendorId ? { ...v, is_verified: !currentStatus } : v
      ));
      showToast(currentStatus ? "Vendor unverified" : "Vendor verified");
    } catch {
      showToast("Verification update failed", "error");
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

  const stats = {
    total:      vendors.length,
    verified:   vendors.filter(v => v.is_verified).length,
    unverified: vendors.filter(v => !v.is_verified && !v.is_rejected).length,
    active:     vendors.filter(v => v.is_available).length,
  };

  const card = {
    background:   theme.cardBg,
    border:       `1px solid ${theme.cardBorder}`,
    borderRadius: "20px",
    padding:      "24px",
  };

  if (loadingVendors) {
    return (
        <DashboardLayout>
            <div
                style={{
                    minHeight: "70vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: theme.textMuted,
                    fontSize: "14px",
                }}
            >
                Loading dashboard...
            </div>
        </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
    <div style={{ minHeight: "100vh", background: theme.pageBg, padding: "20px" }}>

      {toast && (
        <div style={{ position: "fixed", top: "24px", right: "24px", zIndex: 9999 }}>
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* HERO */}
        <div style={{ ...card,
          background: theme.isDark
            ? "linear-gradient(135deg, #13132a 0%, #1a1040 100%)"
            : "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)" }}>
          <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "3px",
            textTransform: "uppercase", color: "#7C5AF6", marginBottom: "6px" }}>
            Admin Command Center
          </p>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: theme.textPrimary, margin: "0 0 4px" }}>
            Welcome back, {user?.full_name || "Administrator"}
          </h1>
          <p style={{ fontSize: "13px", color: theme.textMuted, margin: 0 }}>
            Monitor platform performance, manage vendors, and track AI intelligence.
          </p>
        </div>

        {/* KPI CARDS */}
        <AdminStatsCards
          total={stats.total}
          verified={stats.verified}
          pending={stats.unverified}
          active={stats.active}
          registeredUsers={adminStats.totalUsers}
          activeUsers={adminStats.activeUsers}
        />

        {/* BUSINESS ANALYTICS + AI INTELLIGENCE */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.4fr 1fr", gap: "16px" }}>
          <BusinessAnalytics vendors={vendors} />
          <AIIntelligence vendors={vendors} />
        </div>

        {/* RECENT VENDORS + VERIFICATION QUEUE */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
          <RecentVendors vendors={vendors} />
          <VerificationQueue
            vendors={vendors}
            onVerify={(id) => {
              const v = vendors.find(x => x.vendor_id === id);
              if (v) handleVerify(id, v.is_verified);
            }}
            onReject={handleReject}
          />
        </div>

        {/* IMPORT ANALYTICS (summary only — full upload lives on /admin/import) */}
        <ImportAnalytics
          totalImported={0}
          successCount={0}
          failedCount={0}
          lastImportDate={null}
        />

      </div>
    </div>
    </DashboardLayout>
  );
};

export default AdminPage;