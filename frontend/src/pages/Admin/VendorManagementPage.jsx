import { useEffect, useState } from "react";
import ConfirmModal from "../../components/common/ConfirmModal";
import axiosInstance from "../../api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";
import DashboardLayout from "../../components/layouts/DashboardLayout/DashboardLayout";
import Toast from "../../components/common/Toast/Toast";
import {
  Building2, Search, RefreshCw, ChevronLeft, ChevronRight,
  Trash2, Eye, TrendingUp, Activity, BadgeCheck, Users, RotateCcw,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

const VendorManagementPage = () => {
  const theme = useTheme();

  const [vendors, setVendors]             = useState([]);
  const [filteredVendors, setFiltered]    = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [searchQuery, setSearchQuery]     = useState("");
  const [currentPage, setCurrentPage]     = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast]                 = useState(null);
  const [activeTab, setActiveTab]         = useState("all");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, vendorId: null, vendorName: "" });
  const [deleteLoading, setDeleteLoading] = useState(false);
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
      setFiltered(root);
    } catch {
      showToast("Failed to load vendors", "error");
    } finally {
      setLoadingVendors(false);
    }
  };

  useEffect(() => { fetchVendors(); }, []);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    let list = vendors;
    if (activeTab === "verified")   list = vendors.filter(v => v.is_verified);
    if (activeTab === "unverified") list = vendors.filter(v => !v.is_verified && v.is_active !== false);
    if (activeTab === "rejected")   list = vendors.filter(v => v.is_rejected === true);
    if (q) list = list.filter(v =>
      v.name?.toLowerCase().includes(q) ||
      v.business_email?.toLowerCase().includes(q) ||
      v.city?.toLowerCase().includes(q) ||
      v.category?.toLowerCase().includes(q)
    );
    setFiltered(list);
    setCurrentPage(1);
  }, [searchQuery, vendors, activeTab]);

  const handleVerify = async (vendorId, currentStatus) => {
    try {
      setActionLoading(vendorId + "_verify");
      await axiosInstance.patch(`/vendors/${vendorId}/verify`);
      setVendors(prev => prev.map(v =>
        v.vendor_id === vendorId ? { ...v, is_verified: !currentStatus } : v
      ));
      if (selectedVendor?.vendor_id === vendorId)
        setSelectedVendor(prev => ({ ...prev, is_verified: !currentStatus }));
      showToast(currentStatus ? "Vendor unverified" : "Vendor verified");
    } catch {
      showToast("Verification update failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (vendorId) => {
    try {
      setActionLoading(vendorId + "_restore");
      await axiosInstance.patch(`/vendors/${vendorId}/restore`);
      setVendors(prev => prev.map(v =>
        v.vendor_id === vendorId ? { ...v, is_rejected: false } : v
      ));
      if (selectedVendor?.vendor_id === vendorId)
        setSelectedVendor(prev => ({ ...prev, is_rejected: false }));
      showToast("Vendor restored to pending review");
    } catch {
      showToast("Restore failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = (vendorId, vendorName) => {
    setDeleteModal({ open: true, vendorId, vendorName });
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await axiosInstance.delete(`/vendors/${deleteModal.vendorId}`);
      setVendors(prev => prev.filter(v => v.vendor_id !== deleteModal.vendorId));
      if (selectedVendor?.vendor_id === deleteModal.vendorId) setSelectedVendor(null);
      showToast(`"${deleteModal.vendorName}" deleted`);
    } catch {
      showToast("Failed to delete vendor", "error");
    } finally {
      setDeleteLoading(false);
      setDeleteModal({ open: false, vendorId: null, vendorName: "" });
    }
  };

  const totalPages       = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE);
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const stats = {
    verified:   vendors.filter(v => v.is_verified).length,
    unverified: vendors.filter(v => !v.is_verified && v.is_active !== false).length,
    rejected:   vendors.filter(v => v.is_rejected === true).length,
  };

  const avatarColors = ["#7C5AF6","#22C55E","#F59E0B","#EF4444","#3B82F6","#EC4899","#14B8A6","#F97316"];
  const vendorColor  = (name = "") => avatarColors[name.charCodeAt(0) % avatarColors.length];

  const card = {
    background:   theme.cardBg,
    border:       `1px solid ${theme.cardBorder}`,
    borderRadius: "20px",
    padding:      "24px",
  };

  const th = {
    padding: "10px 16px", textAlign: "left", fontSize: "10px",
    fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
    color: theme.textMuted, background: theme.panelBg,
    borderBottom: `1px solid ${theme.cardBorder}`,
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

      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: isMobile ? "12px" : "20px",
          overflow: "hidden",
        }}
      >

        <div style={{ display: "grid",
          gridTemplateColumns: selectedVendor && !isTablet && !isMobile
            ? "1fr 360px"
            : "1fr",
          gap: "20px", alignItems: "start" }}>

          <div style={card}>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "12px",
                  background: "rgba(124,90,246,0.12)", display: "flex",
                  alignItems: "center", justifyContent: "center", color: "#7C5AF6" }}>
                  <Building2 size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: "15px", fontWeight: 700, color: theme.textPrimary, margin: 0 }}>
                    Vendor Management
                  </h2>
                  <p style={{ fontSize: "11px", color: theme.textMuted, margin: 0 }}>
                    Manage, verify and remove vendors
                  </p>
                </div>
              </div>
              <button onClick={fetchVendors}
                style={{ display: "flex", alignItems: "center", gap: "6px",
                  padding: "7px 14px", borderRadius: "10px", border: `1px solid ${theme.cardBorder}`,
                  background: theme.panelBg, color: theme.textMuted, cursor: "pointer", fontSize: "12px" }}>
                <RefreshCw size={13} /> Refresh
              </button>
            </div>

            <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
              {[
                { key: "all",        label: `All (${vendors.length})` },
                { key: "verified",   label: `Verified (${stats.verified})` },
                { key: "unverified", label: `Pending (${stats.unverified})` },
                { key: "rejected",   label: `Rejected (${stats.rejected})` },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  style={{ padding: "5px 12px", borderRadius: "8px", border: "none",
                    cursor: "pointer", fontSize: "11px", fontWeight: 600, transition: "all 0.15s",
                    background: activeTab === tab.key ? "#7C5AF6" : theme.panelBg,
                    color: activeTab === tab.key ? "#fff" : theme.textMuted }}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ position: "relative", marginBottom: "14px" }}>
              <Search size={13} style={{ position: "absolute", left: "12px", top: "50%",
                transform: "translateY(-50%)", color: theme.textMuted }} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, city or category…"
                style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px 8px 34px",
                  borderRadius: "10px", border: `1px solid ${theme.cardBorder}`,
                  background: theme.panelBg, color: theme.textPrimary, fontSize: "12px", outline: "none" }} />
            </div>

            {loadingVendors ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
                <div style={{ width: "28px", height: "28px", border: "3px solid #7C5AF6",
                  borderTopColor: "transparent", borderRadius: "50%",
                  animation: "spin 0.8s linear infinite" }} />
              </div>
            ) : filteredVendors.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0",
                color: theme.textMuted, fontSize: "13px" }}>
                No vendors found.
              </div>
            ) : (
              <>
                <div
                  style={{
                    overflowX: "auto",
                    overflowY: "auto",
                    maxHeight: isMobile ? "500px" : "600px",
                    borderRadius: "12px",
                    border: `1px solid ${theme.cardBorder}`
                  }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: isMobile ? "900px" : "600px", }}>
                    <thead>
                      <tr>
                        {["Vendor","Email","City","Category","Rating","Status","Actions"].map(h => (
                          <th key={h} style={th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedVendors.map(vendor => {
                        const isSelected = selectedVendor?.vendor_id === vendor.vendor_id;
                        return (
                          <tr key={vendor.vendor_id}
                            onClick={() => setSelectedVendor(isSelected ? null : vendor)}
                            style={{ cursor: "pointer",
                              background: isSelected ? "rgba(124,90,246,0.08)" : "transparent",
                              transition: "background 0.15s" }}
                            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = theme.menuHoverBg; }}
                            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}>

                            <td style={td}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div style={{ width: "30px", height: "30px", borderRadius: "8px",
                                  flexShrink: 0, background: vendorColor(vendor.name),
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  color: "#fff", fontSize: "11px", fontWeight: 700 }}>
                                  {(vendor.name || "?").slice(0, 2).toUpperCase()}
                                </div>
                                <span style={{ fontWeight: 600, fontSize: "12px" }}>{vendor.name}</span>
                              </div>
                            </td>

                            <td style={{ ...td, fontSize: "11px", color: theme.textMuted }}>
                              {vendor.business_email}
                            </td>
                            <td style={{ ...td, fontSize: "12px" }}>{vendor.city || "—"}</td>
                            <td style={{ ...td, fontSize: "12px", textTransform: "capitalize" }}>
                              {vendor.all_categories || "—"}
                            </td>
                            <td style={{ ...td, fontSize: "12px" }}>
                              ⭐ {vendor.avg_rating?.toFixed(1) || "0.0"}
                            </td>
                            <td style={td}>
                              <span style={{ padding: "3px 10px", borderRadius: "20px",
                                fontSize: "10px", fontWeight: 700, letterSpacing: "0.04em",
                                background: vendor.is_rejected === true
                                  ? "rgba(239,68,68,0.12)"
                                  : vendor.is_verified
                                    ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.12)",
                                color: vendor.is_rejected === true
                                  ? "#EF4444"
                                  : vendor.is_verified ? "#22C55E" : "#F59E0B" }}>
                                {vendor.is_rejected === true ? "Rejected" : vendor.is_verified ? "Verified" : "Pending"}
                              </span>
                            </td>
                            <td style={td} onClick={e => e.stopPropagation()}>
                              <div style={{ display: "flex", gap: "6px" }}>
                                {vendor.is_rejected === true ? (
                                  <button
                                    onClick={() => handleRestore(vendor.vendor_id)}
                                    disabled={actionLoading === vendor.vendor_id + "_restore"}
                                    title="Restore vendor"
                                    style={{ width: "28px", height: "28px", borderRadius: "8px",
                                      border: "none", cursor: "pointer", display: "flex",
                                      alignItems: "center", justifyContent: "center",
                                      background: "rgba(59,130,246,0.1)", color: "#3B82F6",
                                      opacity: actionLoading === vendor.vendor_id + "_restore" ? 0.5 : 1 }}>
                                    <RotateCcw size={13} />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleVerify(vendor.vendor_id, vendor.is_verified)}
                                    disabled={actionLoading === vendor.vendor_id + "_verify"}
                                    title={vendor.is_verified ? "Unverify" : "Verify"}
                                    style={{ width: "28px", height: "28px", borderRadius: "8px",
                                      border: "none", cursor: "pointer", display: "flex",
                                      alignItems: "center", justifyContent: "center",
                                      background: vendor.is_verified
                                        ? "rgba(245,158,11,0.1)" : "rgba(34,197,94,0.1)",
                                      color: vendor.is_verified ? "#F59E0B" : "#22C55E",
                                      opacity: actionLoading === vendor.vendor_id + "_verify" ? 0.5 : 1 }}>
                                    <BadgeCheck size={13} />
                                  </button>
                                )}
                                <button
                                  onClick={() => setSelectedVendor(vendor)}
                                  title="View Details"
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "8px",
                                    border: "none",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "rgba(59,130,246,0.1)",
                                    color: "#3B82F6"
                                  }}
                                >
                                  <Eye size={13} />
                                </button>
                                <button
                                  onClick={() => handleDelete(vendor.vendor_id, vendor.name)}
                                  disabled={actionLoading === vendor.vendor_id + "_delete"}
                                  title="Delete vendor"
                                  style={{ width: "28px", height: "28px", borderRadius: "8px",
                                    border: "none", cursor: "pointer", display: "flex",
                                    alignItems: "center", justifyContent: "center",
                                    background: "rgba(239,68,68,0.1)", color: "#EF4444",
                                    opacity: actionLoading === vendor.vendor_id + "_delete" ? 0.5 : 1 }}>
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginTop: "14px", paddingTop: "14px", borderTop: `1px solid ${theme.cardBorder}` }}>
                    <p style={{ fontSize: "11px", color: theme.textMuted }}>
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredVendors.length)} of {filteredVendors.length}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        style={{ width: "28px", height: "28px", borderRadius: "8px",
                          border: `1px solid ${theme.cardBorder}`, background: theme.panelBg,
                          color: theme.textPrimary, cursor: "pointer", display: "flex",
                          alignItems: "center", justifyContent: "center",
                          opacity: currentPage === 1 ? 0.4 : 1 }}>
                        <ChevronLeft size={14} />
                      </button>
                      <span style={{ fontSize: "11px", color: theme.textMuted,
                        minWidth: "50px", textAlign: "center" }}>
                        {currentPage} / {totalPages}
                      </span>
                      <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        style={{ width: "28px", height: "28px", borderRadius: "8px",
                          border: `1px solid ${theme.cardBorder}`, background: theme.panelBg,
                          color: theme.textPrimary, cursor: "pointer", display: "flex",
                          alignItems: "center", justifyContent: "center",
                          opacity: currentPage === totalPages ? 0.4 : 1 }}>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {selectedVendor && (
            <div
              style={{
                ...card,
                position: "sticky",
                top: "20px",
                width: "100%",
                maxWidth: "380px",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "14px",
                    background: vendorColor(selectedVendor.name), display: "flex",
                    alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: "16px", fontWeight: 800 }}>
                    {(selectedVendor.name || "?").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "15px", fontWeight: 700,
                      color: theme.textPrimary, margin: 0 }}>
                      {selectedVendor.name}
                    </h3>
                    <p style={{ fontSize: "11px", color: theme.textMuted,
                      margin: 0, textTransform: "capitalize" }}>
                      {selectedVendor.all_categories || "No category"}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedVendor(null)}
                  style={{ border: "none", background: "transparent",
                    color: theme.textMuted, cursor: "pointer", fontSize: "20px", lineHeight: 1 }}>
                  ×
                </button>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <span style={{ padding: "5px 14px", borderRadius: "20px",
                  fontSize: "11px", fontWeight: 700,
                  background: selectedVendor.is_rejected === true
                    ? "rgba(239,68,68,0.12)"
                    : selectedVendor.is_verified
                      ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.12)",
                  color: selectedVendor.is_rejected === true
                    ? "#EF4444"
                    : selectedVendor.is_verified ? "#22C55E" : "#F59E0B" }}>
                  {selectedVendor.is_rejected === true
                    ? "✕ Rejected"
                    : selectedVendor.is_verified ? "✓ Verified" : "⏳ Pending Verification"}
                </span>
              </div>

              {[
                { label: "Email",     value: selectedVendor.business_email },
                { label: "Phone",     value: selectedVendor.contact_phone || "—" },
                { label: "City",      value: selectedVendor.city || "—" },
                { label: "Rating",    value: `⭐ ${selectedVendor.avg_rating?.toFixed(1) || "0.0"} (${selectedVendor.review_count || 0} reviews)` },
                { label: "Price",     value: selectedVendor.price_min && selectedVendor.price_max
                    ? `₹${selectedVendor.price_min.toLocaleString()} – ₹${selectedVendor.price_max.toLocaleString()}`
                    : "—" },
                { label: "Available", value: selectedVendor.is_available ? "Yes" : "No" },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between",
                  padding: "10px 0", borderBottom: `1px solid ${theme.cardBorder}` }}>
                  <span style={{ fontSize: "11px", color: theme.textMuted, fontWeight: 600 }}>
                    {row.label}
                  </span>
                  <span style={{ fontSize: "12px", color: theme.textPrimary,
                    textAlign: "right", maxWidth: "60%", wordBreak: "break-word" }}>
                    {row.value}
                  </span>
                </div>
              ))}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: "8px", marginTop: "16px", marginBottom: "16px" }}>
                {[
                  { label: "Followers", value: selectedVendor.follower_count || 0, icon: <Users size={13} />,     color: "#7C5AF6" },
                  { label: "Views",     value: selectedVendor.view_count || 0,     icon: <Eye size={13} />,       color: "#3B82F6" },
                  { label: "Reviews",   value: selectedVendor.review_count || 0,   icon: <TrendingUp size={13} />,color: "#22C55E" },
                  { label: "Services",  value: selectedVendor.managed_teams?.reduce( (count, team) => count + (team.services?.length || 0),0),  icon: <Activity size={13} />,  color: "#F59E0B" },
                ].map(s => (
                  <div key={s.label} style={{ padding: "10px", borderRadius: "10px",
                    background: theme.panelBg, border: `1px solid ${theme.cardBorder}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px",
                      marginBottom: "4px" }}>
                      <span style={{ color: s.color }}>{s.icon}</span>
                      <span style={{ fontSize: "10px", fontWeight: 600, color: theme.textMuted }}>
                        {s.label}
                      </span>
                    </div>
                    <p style={{ fontSize: "16px", fontWeight: 700,
                      color: theme.textPrimary, margin: 0 }}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
              {selectedVendor.managed_teams?.some(
                team => team.services?.length
                ) && (
                  <div style={{ marginBottom: "16px" }}>
                    <h4
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        marginBottom: "10px",
                        color: theme.textPrimary,
                      }}
                    >
                      Services
                    </h4>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      {selectedVendor.managed_teams.flatMap(team =>
                        (team.services || []).map(service => (
                          <span
                            key={service.service_id}
                            style={{
                              padding: "6px 10px",
                              borderRadius: "999px",
                              background: theme.panelBg,
                              border: `1px solid ${theme.cardBorder}`,
                              fontSize: "11px",
                              color: theme.textPrimary,
                            }}
                          >
                            {service.name}
                          </span>
                        ))
                      )}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "8px" }}>
                {selectedVendor.is_rejected === true ? (
                  <button
                    onClick={() => handleRestore(selectedVendor.vendor_id)}
                    disabled={actionLoading === selectedVendor.vendor_id + "_restore"}
                    style={{ flex: 1, padding: "9px", borderRadius: "10px", border: "none",
                      cursor: "pointer", fontSize: "12px", fontWeight: 600,
                      background: "rgba(59,130,246,0.12)", color: "#3B82F6" }}>
                    Restore Vendor
                  </button>
                ) : (
                  <button
                    onClick={() => handleVerify(selectedVendor.vendor_id, selectedVendor.is_verified)}
                    disabled={actionLoading === selectedVendor.vendor_id + "_verify"}
                    style={{ flex: 1, padding: "9px", borderRadius: "10px", border: "none",
                      cursor: "pointer", fontSize: "12px", fontWeight: 600,
                      background: selectedVendor.is_verified
                        ? "rgba(245,158,11,0.12)" : "rgba(34,197,94,0.12)",
                      color: selectedVendor.is_verified ? "#F59E0B" : "#22C55E" }}>
                    {selectedVendor.is_verified ? "Unverify" : "Verify"}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedVendor.vendor_id, selectedVendor.name)}
                  disabled={actionLoading === selectedVendor.vendor_id + "_delete"}
                  style={{ flex: 1, padding: "9px", borderRadius: "10px", border: "none",
                    cursor: "pointer", fontSize: "12px", fontWeight: 600,
                    background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>
                  Delete Vendor
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
    <ConfirmModal
          isOpen={deleteModal.open}
          title="Delete Vendor"
          message={`Are you sure you want to delete "${deleteModal.vendorName}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmColor="#EF4444"
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModal({ open: false, vendorId: null, vendorName: "" })}
      />
    </DashboardLayout>
  );
};

export default VendorManagementPage;