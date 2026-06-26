import { useState, useEffect, useCallback } from "react";
import ConfirmModal from "../../components/common/ConfirmModal";
import { useTheme } from "../../context/ThemeContext";
import DashboardLayout from "../../components/layouts/DashboardLayout/DashboardLayout";
import Toast from "../../components/common/Toast/Toast";
import {
    Play, RefreshCw, AlertTriangle, CheckCircle,
    ChevronDown, ChevronUp, Search, ChevronLeft,
    ChevronRight, Trash2, Eye, X, ShieldCheck, Download
} from "lucide-react";
import {
    getCleanupDashboard, runAnalysis,
    getCleanupReports, getAllCleanupLogs,
    deleteRun, updateLogStatus
} from "../../services/vendorCleanupService";

// ── Helpers ────────────────────────────────────────────────────────────

const severityColor = (s) =>
    s === "critical" ? "#EF4444"
    : s === "warning" ? "#F59E0B"
    : "#6B7280";

const severityBg = (s) =>
    s === "critical" ? "rgba(239,68,68,0.08)"
    : s === "warning" ? "rgba(245,158,11,0.08)"
    : "rgba(107,114,128,0.06)";

const statusColor = (status) => {
    if (status === "reviewed") return "#22C55E";
    if (status === "ignored")  return "#6B7280";
    if (status === "resolved") return "#3B82F6";
    return null; // pending — no override
};

const ACTION_LABELS = {
    POTENTIAL_DUPLICATE:  "Potential Duplicate",
    EMAIL_INVALID:        "Invalid Email",
    PHONE_MISSING:        "Missing Phone",
    PHONE_INVALID:        "Invalid Phone",
    PRICE_INCONSISTENT:   "Price Issue",
    INACTIVE_VENDOR:      "Inactive Vendor",
    CITY_MISSING:         "Missing City",
    DESCRIPTION_MISSING:  "No Description",
};

const fmt = (iso) => iso ? new Date(iso).toLocaleString() : "—";
const PAGE_SIZE = 25;

// CSV export helper
const exportCSV = (logs) => {
    const headers = ["Vendor Name", "Issue Type", "Reason", "Severity", "Value", "Date", "Status"];
    const rows = logs.map(l => [
        l.vendor_name || "",
        ACTION_LABELS[l.action] || l.action,
        (l.reason || "").replace(/,/g, ";"),
        l.severity,
        l.before_value || "",
        fmt(l.created_at),
        l.after_value || "pending"
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `vendor-analysis-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};

// ── Component ──────────────────────────────────────────────────────────

export default function VendorCleanupPage() {
    const theme = useTheme();

    const [dashboard,    setDashboard]    = useState(null);
    const [reports,      setReports]      = useState([]);
    const [logs,         setLogs]         = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [running,      setRunning]      = useState(false);
    const [activeTab,    setActiveTab]    = useState("dashboard");
    const [expandedRun,  setExpandedRun]  = useState(null);
    const [runResult,    setRunResult]    = useState(null);
    const [toast,        setToast]        = useState(null);

    // Filters
    const [logFilter,    setLogFilter]    = useState("all");
    const [actionFilter, setActionFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [logSearch,    setLogSearch]    = useState("");
    const [logPage,      setLogPage]      = useState(1);

    // Multi-select
    const [selected,     setSelected]     = useState(new Set());
    const [bulkLoading,  setBulkLoading]  = useState(false);

    // Detail modal
    const [detailLog,    setDetailLog]    = useState(null);
    const [deleteRunModal, setDeleteRunModal] = useState({ open: false, runId: null });
    const [deleteRunLoading, setDeleteRunLoading] = useState(false);

    const showToast = (msg, type = "success") => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [dash, rep, lg] = await Promise.all([
                getCleanupDashboard(),
                getCleanupReports(),
                getAllCleanupLogs()
            ]);
            setDashboard(dash.data);
            setReports(rep.reports || []);
            setLogs(lg.logs        || []);
            setSelected(new Set());
        } catch (e) {
            console.error(e);
            showToast("Failed to load data", "error");
        } finally {
            setLoading(false);
        }
    }, []);

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

    useEffect(() => { load(); }, [load]);

    const handleRun = async () => {
        setRunning(true);
        setRunResult(null);
        try {
            const res = await runAnalysis();
            setRunResult(res.stats);
            await load();
            setActiveTab("reports");
            showToast(`Analysis complete — ${res.stats?.issues_detected ?? 0} issues found`);
        } catch (e) {
            console.error(e);
            showToast("Analysis failed", "error");
        } finally {
            setRunning(false);
        }
    };

    const handleDeleteRun = (runId, e) => {
        e.stopPropagation();
        setDeleteRunModal({ open: true, runId });
    };

    const confirmDeleteRun = async () => {
        setDeleteRunLoading(true);
        try {
            await deleteRun(deleteRunModal.runId);
            showToast("Run deleted");
            await load();
        } catch {
            showToast("Failed to delete run", "error");
        } finally {
            setDeleteRunLoading(false);
            setDeleteRunModal({ open: false, runId: null });
        }
    };
    const handleUpdateStatus = async (logId, status) => {
        try {
            await updateLogStatus(logId, status);
            setLogs(prev => prev.map(l =>
                l.log_id === logId ? { ...l, after_value: status } : l
            ));
            showToast(`Marked as ${status}`);
            if (detailLog?.log_id === logId) {
                setDetailLog(prev => ({ ...prev, after_value: status }));
            }
        } catch {
            showToast("Failed to update", "error");
        }
    };

    const handleBulkStatus = async (status) => {
        if (selected.size === 0) return;
        setBulkLoading(true);
        try {
            await Promise.all([...selected].map(id => updateLogStatus(id, status)));
            setLogs(prev => prev.map(l =>
                selected.has(l.log_id) ? { ...l, after_value: status } : l
            ));
            showToast(`${selected.size} items marked as ${status}`);
            setSelected(new Set());
        } catch {
            showToast("Bulk update failed", "error");
        } finally {
            setBulkLoading(false);
        }
    };

    const toggleSelect = (logId) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(logId) ? next.delete(logId) : next.add(logId);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selected.size === pagedLogs.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(pagedLogs.map(l => l.log_id)));
        }
    };

    // Filtered logs
    const filteredLogs = logs.filter(l => {
        const matchSeverity = logFilter    === "all" || l.severity     === logFilter;
        const matchAction   = actionFilter === "all"
            || l.action === actionFilter
            || (actionFilter === "MISSING_INFO" && (l.action === "CITY_MISSING" || l.action === "DESCRIPTION_MISSING"));
        const matchStatus   = statusFilter === "all" || (l.after_value || "pending") === statusFilter;
        const matchSearch   = !logSearch
            || (l.vendor_name || "").toLowerCase().includes(logSearch.toLowerCase())
            || (ACTION_LABELS[l.action] || "").toLowerCase().includes(logSearch.toLowerCase())
            || (l.reason || "").toLowerCase().includes(logSearch.toLowerCase());
        return matchSeverity && matchAction && matchStatus && matchSearch;
    });

    const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);
    const pagedLogs  = filteredLogs.slice((logPage - 1) * PAGE_SIZE, logPage * PAGE_SIZE);

    useEffect(() => {
        setLogPage(1);
        setSelected(new Set());
    }, [logFilter, actionFilter, statusFilter, logSearch]);

    const last = dashboard?.last_run;

    // ── Shared styles ──────────────────────────────────────────────────

    const card = {
        background:   theme.cardBg,
        border:       `1px solid ${theme.cardBorder}`,
        borderRadius: "20px",
        padding:      "24px",
    };

    const btn = (bg, color, extra = {}) => ({
        background: bg, color, border: "none",
        borderRadius: "10px", padding: "8px 16px",
        cursor: "pointer", fontSize: "12px", fontWeight: 600,
        display: "flex", alignItems: "center", gap: "6px",
        transition: "opacity 0.15s",
        ...extra
    });

    const Tab = ({ k, label }) => (
        <button
            onClick={() => setActiveTab(k)}
            style={{
                padding: "8px 20px", borderRadius: "10px",
                border: "none", cursor: "pointer", fontSize: "13px",
                fontWeight: activeTab === k ? 600 : 400,
                background: activeTab === k ? "rgba(124,90,246,0.12)" : "transparent",
                color:      activeTab === k ? "#7C5AF6" : theme.textMuted,
                transition: "all 0.15s"
            }}
        >
            {label}
        </button>
    );

    const StatCard = ({ label, value, color = "#7C5AF6", sub }) => (
        <div style={{
            background: theme.cardBg,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: "14px", padding: "12px 14px", minHeight: "88px",
            display: "flex", flexDirection: "column", gap: "6px"
        }}>
            <span style={{ fontSize: "10px", color: theme.textMuted, fontWeight: 500, marginBottom: "4px" }}>
                {label}
            </span>
            <span style={{ fontSize: "18px", fontWeight: 700, color }}>
                {value ?? "—"}
            </span>
            {sub && <span style={{ fontSize: "10px", color: theme.textFaint }}>{sub}</span>}
        </div>
    );

    // ── Render ─────────────────────────────────────────────────────────

    return (
        <DashboardLayout>
        <div style={{ minHeight: "100vh", background: theme.pageBg, padding: isMobile ? "12px" : "20px",}}>
            <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: isMobile ? "12px" : "20px", padding: isMobile ? "0 8px" : "0"}}>

                {/* Toast */}
                {toast && (
                    <div style={{ position: "fixed", top: "24px", right: "24px", zIndex: 9999 }}>
                        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
                    </div>
                )}

                {/* Detail Modal */}
                {detailLog && (
                    <div style={{
                        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
                        zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center"
                    }} onClick={() => setDetailLog(null)}>
                        <div
                            onClick={e => e.stopPropagation()}
                            style={{
                                background: theme.cardBg,
                                border: `1px solid ${theme.cardBorder}`,
                                borderRadius: "20px", padding: "28px",
                                width: "480px", maxWidth: "90vw"
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                                <h3 style={{ fontSize: "16px", fontWeight: 700, color: theme.textPrimary, margin: 0 }}>
                                    Issue Details
                                </h3>
                                <button onClick={() => setDetailLog(null)} style={{ background: "none", border: "none", cursor: "pointer", color: theme.textMuted }}>
                                    <X size={18} />
                                </button>
                            </div>

                            {[
                                ["Vendor",    detailLog.vendor_name || "—"],
                                ["Issue",     ACTION_LABELS[detailLog.action] || detailLog.action],
                                ["Severity",  detailLog.severity],
                                ["Reason",    detailLog.reason],
                                ["Value",     detailLog.before_value || "—"],
                                ["Status",    detailLog.after_value  || "pending"],
                                ["Detected",  fmt(detailLog.created_at)],
                            ].map(([k, v]) => (
                                <div key={k} style={{
                                    display: "flex", gap: "12px",
                                    padding: "10px 0",
                                    borderBottom: `1px solid ${theme.cardBorder}`
                                }}>
                                    <span style={{ fontSize: "12px", color: theme.textMuted, width: "80px", flexShrink: 0 }}>{k}</span>
                                    <span style={{ fontSize: "13px", color: theme.textPrimary, fontWeight: 500 }}>{v}</span>
                                </div>
                            ))}

                            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                                <button onClick={() => handleUpdateStatus(detailLog.log_id, "reviewed")}
                                    style={btn("rgba(34,197,94,0.12)", "#22C55E")}>
                                    <ShieldCheck size={13} /> Mark Reviewed
                                </button>
                                <button onClick={() => handleUpdateStatus(detailLog.log_id, "resolved")}
                                    style={btn("rgba(59,130,246,0.12)", "#3B82F6")}>
                                    <CheckCircle size={13} /> Resolved
                                </button>
                                <button onClick={() => handleUpdateStatus(detailLog.log_id, "ignored")}
                                    style={btn("rgba(107,114,128,0.12)", "#6B7280")}>
                                    <X size={13} /> Ignore
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Hero ────────────────────────────────────────────── */}
                <div style={{
                    ...card,
                    background: theme.isDark
                        ? "linear-gradient(135deg, #13132a 0%, #1a1040 100%)"
                        : "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", flexWrap: "wrap", gap: "16px"
                }}>
                    <div>
                        <p style={{
                            fontSize: "10px", fontWeight: 700, letterSpacing: "3px",
                            textTransform: "uppercase", color: "#7C5AF6", margin: "0 0 6px"
                        }}>
                            Admin Panel · Vendor Data Quality
                        </p>
                        <h1 style={{ fontSize: "22px", fontWeight: 800, color: theme.textPrimary, margin: "0 0 4px" }}>
                            Vendor Data Quality
                        </h1>
                        <p style={{ fontSize: "13px", color: theme.textMuted, margin: 0 }}>
                            Detect and review data quality issues across all parent vendor records.
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <button
                            onClick={() => exportCSV(logs)}
                            style={btn(theme.cardBg, theme.textMuted, { border: `1px solid ${theme.cardBorder}`, padding: "9px 16px" })}
                        >
                            <Download size={13} /> Export CSV
                        </button>
                        <button
                            onClick={load}
                            style={btn(theme.cardBg, theme.textMuted, { border: `1px solid ${theme.cardBorder}`, padding: "9px 16px" })}
                        >
                            <RefreshCw size={13} /> Refresh
                        </button>
                        <button
                            onClick={handleRun}
                            disabled={running}
                            style={btn(
                                running ? "rgba(124,90,246,0.5)" : "#7C5AF6",
                                "#fff",
                                { padding: "9px 20px", opacity: running ? 0.7 : 1, cursor: running ? "not-allowed" : "pointer" }
                            )}
                        >
                            {running
                                ? <><RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} /> Analysing...</>
                                : <><Play size={13} /> Run Analysis</>
                            }
                        </button>
                    </div>
                </div>

                {/* ── Result Banner ────────────────────────────────────── */}
                {runResult && (
                    <div style={{
                        background: "rgba(34,197,94,0.08)",
                        border: "1px solid rgba(34,197,94,0.25)",
                        borderRadius: "14px", padding: "14px 20px",
                        display: "flex", alignItems: "center", gap: "12px"
                    }}>
                        <CheckCircle size={16} color="#22C55E" />
                        <span style={{ color: "#22C55E", fontWeight: 600, fontSize: "13px" }}>
                            Analysis complete — {runResult.issues_detected} issues found across {runResult.total_scanned} parent vendors. Review the findings in Activity Logs.
                        </span>
                        <button onClick={() => setRunResult(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#22C55E" }}>
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* ── Inline KPI bar ───────────────────────────────────── */}
                <div style={{
                    ...card, padding: "16px 24px",
                    display: "flex", alignItems: "center", flexWrap: "wrap"
                }}>
                    {[
                        { label: "Vendors Analysed", value: dashboard?.total_vendors ?? "—", color: "#7C5AF6" },
                        { label: "Total Runs",        value: dashboard?.total_runs ?? "—",    color: "#6B7280" },
                        { label: "Issues Detected",   value: last?.issues_detected ?? "—",    color: last?.issues_detected > 0 ? "#F59E0B" : "#22C55E" },
                        { label: "Needs Review",      value: last?.issues_pending ?? "—",     color: last?.issues_pending > 0 ? "#EF4444" : "#22C55E" },
                        { label: "Auto Fixed",        value: last?.issues_fixed ?? 0,         color: "#22C55E" },
                    ].map((item, i, arr) => (
                        <div key={item.label} style={{
                            flex: 1, minWidth: "120px", padding: "8px 20px",
                            borderRight: i < arr.length - 1 ? `1px solid ${theme.cardBorder}` : "none"
                        }}>
                            <div style={{ fontSize: "10px", fontWeight: 600, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                                {item.label}
                            </div>
                            <div style={{ fontSize: "20px", fontWeight: 800, color: item.color }}>{item.value}</div>
                        </div>
                    ))}
                </div>
                {/* ── Tabs ─────────────────────────────────────────────── */}
                <div style={{
                    display: "flex", gap: "4px",
                    background: theme.cardBg,
                    border: `1px solid ${theme.cardBorder}`,
                    borderRadius: "14px", padding: "6px",
                    width: "fit-content"
                }}>
                    <Tab k="dashboard" label="Dashboard"    />
                    <Tab k="reports"   label="Run History"  />
                    <Tab k="logs"      label="Activity Logs"/>
                </div>

                {loading ? (
                    <div style={{ ...card, textAlign: "center", color: theme.textMuted, padding: "60px" }}>
                        Loading...
                    </div>
                ) : (<>

                {/* ════════════════════════════════════════════════════
                    DASHBOARD TAB
                ════════════════════════════════════════════════════ */}
                {activeTab === "dashboard" && (
                    <div style={card}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                            <div>
                                <h3 style={{ fontSize: "15px", fontWeight: 700, color: theme.textPrimary, margin: 0 }}>Issue Breakdown</h3>
                                {last && <p style={{ fontSize: "12px", color: theme.textMuted, margin: "4px 0 0" }}>
                                    Last analysed {fmt(last.completed_at)} · {last.total_scanned} vendors scanned
                                </p>}
                            </div>
                            {last && (
                                <span style={{ fontSize: "12px", color: "#F59E0B", fontWeight: 700 }}>
                                    {last.total_issues} total issues
                                </span>
                            )}
                        </div>

                        {last ? (
                            <>
                                {/* Issue severity progress */}
                                <div style={{ marginBottom: "20px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: theme.textMuted, marginBottom: "6px" }}>
                                        <span>Data quality score</span>
                                        <span style={{ fontWeight: 700, color: "#22C55E" }}>
                                            {last.total_scanned > 0 ? Math.max(0, Math.round(((last.total_scanned - (last.duplicates_found + last.invalid_emails)) / last.total_scanned) * 100)) : 100}%
                                        </span>
                                    </div>
                                    <div style={{ height: "8px", borderRadius: "4px", background: theme.pageBg, overflow: "hidden", border: `1px solid ${theme.cardBorder}` }}>
                                        <div style={{
                                            height: "100%", borderRadius: "4px",
                                            width: `${last.total_scanned > 0 ? Math.max(0, Math.round(((last.total_scanned - (last.duplicates_found + last.invalid_emails)) / last.total_scanned) * 100)) : 100}%`,
                                            background: "linear-gradient(90deg, #7C5AF6, #6366F1)", transition: "width 0.6s ease"
                                        }} />
                                    </div>
                                </div>

                                {/* Row-based breakdown */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "1px", borderRadius: "12px", overflow: "auto", minWidth: 0, border: `1px solid ${theme.cardBorder}` }}>
                                    {[
                                        ["Potential Duplicates", last.duplicates_found,      "#EF4444", "POTENTIAL_DUPLICATE"],
                                        ["Invalid Emails",       last.invalid_emails,        "#EF4444", "EMAIL_INVALID"],
                                        ["Phone Issues",         last.missing_phones,        "#F59E0B", "PHONE_MISSING"],
                                        ["Price Issues",         last.price_inconsistencies, "#F59E0B", "PRICE_INCONSISTENT"],
                                        ["Inactive Vendors",     last.inactive_vendors,      "#6B7280", "INACTIVE_VENDOR"],
                                        ["Missing Information",  last.missing_info,          "#6B7280", "MISSING_INFO"],
                                    ].map(([label, val, color, actionKey], i) => (
                                        <div
                                            key={label}
                                            onClick={() => {
                                                if (val > 0) {
                                                    setActiveTab("logs");
                                                    setActionFilter(actionKey);
                                                    setLogFilter("all");
                                                    setStatusFilter("all");
                                                }
                                            }}
                                            style={{
                                                cursor: val > 0 ? "pointer" : "default",
                                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                                padding: "12px 18px",
                                                background: i % 2 === 0 ? theme.pageBg : theme.cardBg,
                                            }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <span style={{
                                                    width: "6px", height: "6px", borderRadius: "50%",
                                                    background: color, flexShrink: 0,
                                                    display: "inline-block"
                                                }} />
                                                <span style={{ fontSize: "13px", color: theme.textMuted, fontWeight: 500 }}>{label}</span>
                                            </div>
                                            <span style={{ fontSize: "16px", fontWeight: 800, color: val > 0 ? color : "#22C55E" }}>
                                                {val ?? 0}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginTop: "14px", display: "flex", justifyContent: "flex-end" }}>
                                    <button
                                    onClick={() => { setActiveTab("logs"); setActionFilter("all"); setLogFilter("all"); }}
                                    style={btn("rgba(124,90,246,0.10)", "#7C5AF6", { marginLeft: "auto" })}
                                >
                                    <Eye size={12} /> View All Issues
                                </button>
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: "center", color: theme.textMuted, padding: "56px" }}>
                                No analysis runs yet. Click <strong>Run Analysis</strong> to start.
                            </div>
                        )}
                    </div>
                )}

                {/* ════════════════════════════════════════════════════
                    RUN HISTORY TAB
                ════════════════════════════════════════════════════ */}
                {activeTab === "reports" && (
                    <div style={card}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
                            <h3 style={{ fontSize: "15px", fontWeight: 700, color: theme.textPrimary, margin: 0 }}>
                                Run History
                            </h3>
                            <span style={{ fontSize: "12px", color: theme.textMuted }}>{reports.length} runs</span>
                        </div>

                        {reports.length === 0 ? (
                            <div style={{ color: theme.textMuted, textAlign: "center", padding: "48px" }}>No runs yet.</div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {reports.map(r => (
                                    <div key={r.run_id} style={{
                                        border: `1px solid ${theme.cardBorder}`,
                                        borderRadius: "14px", overflow: "hidden"
                                    }}>
                                        {/* Row header */}
                                        <div
                                            onClick={() => setExpandedRun(expandedRun === r.run_id ? null : r.run_id)}
                                            style={{
                                                display: "flex", alignItems: "center", gap: "14px",
                                                padding: "14px 18px", cursor: "pointer",
                                                background: theme.cardBg
                                            }}
                                        >
                                            <span style={{
                                                width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                                                background: r.status === "completed" ? "#22C55E"
                                                    : r.status === "failed" ? "#EF4444" : "#F59E0B"
                                            }} />
                                            <span style={{ fontSize: "13px", color: theme.textPrimary, fontWeight: 500, flex: 1 }}>
                                                {fmt(r.started_at)}
                                            </span>
                                            <span style={{ fontSize: "12px", color: theme.textMuted }}>
                                                {r.total_scanned} vendors scanned
                                            </span>
                                            <span style={{
                                                fontSize: "12px", fontWeight: 700,
                                                color: r.issues_detected > 0 ? "#F59E0B" : "#22C55E"
                                            }}>
                                                {r.issues_detected} issues
                                            </span>
                                            <span style={{ fontSize: "11px", color: theme.textMuted, minWidth: "120px", textAlign: "right" }}>
                                                {r.performed_by || "—"}
                                            </span>
                                            <button
                                                onClick={(e) => handleDeleteRun(r.run_id, e)}
                                                style={{
                                                    background: "rgba(239,68,68,0.08)",
                                                    border: "1px solid rgba(239,68,68,0.2)",
                                                    borderRadius: "8px", padding: "5px 10px",
                                                    cursor: "pointer", color: "#EF4444",
                                                    display: "flex", alignItems: "center", gap: "4px",
                                                    fontSize: "11px", fontWeight: 600
                                                }}
                                            >
                                                <Trash2 size={11} /> Delete
                                            </button>
                                            {expandedRun === r.run_id
                                                ? <ChevronUp   size={14} color={theme.textMuted} />
                                                : <ChevronDown size={14} color={theme.textMuted} />
                                            }
                                        </div>

                                        {/* Expanded detail */}
                                        {expandedRun === r.run_id && (
                                            <div style={{
                                                padding: "16px 18px",
                                                borderTop: `1px solid ${theme.cardBorder}`,
                                                background: theme.pageBg,
                                                display: "grid",
                                                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                                                gap: "14px"
                                            }}>
                                                {[
                                                    ["Issues Detected",   r.issues_detected,       "#F59E0B"],
                                                    ["Needs Review",      r.issues_pending,        "#EF4444"],
                                                    ["Auto Fixed",        r.issues_fixed,          "#22C55E"],
                                                    ["Duplicates",        r.duplicates_found,      "#EF4444"],
                                                    ["Invalid Emails",    r.invalid_emails,        "#EF4444"],
                                                    ["Phone Issues",      r.missing_phones,        "#F59E0B"],
                                                    ["Price Issues",      r.price_inconsistencies, "#F59E0B"],
                                                    ["Inactive",          r.inactive_vendors,      "#6B7280"],
                                                    ["Missing Info",      r.missing_info,          "#6B7280"],
                                                ].map(([label, val, color]) => (
                                                    <div key={label}>
                                                        <div style={{ fontSize: "10px", color: theme.textMuted, marginBottom: "4px", fontWeight: 500 }}>{label}</div>
                                                        <div style={{ fontSize: "20px", fontWeight: 700, color }}>{val}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ════════════════════════════════════════════════════
                    ACTIVITY LOGS TAB
                ════════════════════════════════════════════════════ */}
                {activeTab === "logs" && (
                    <div style={card}>

                        {/* Controls */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
                            <h3 style={{ fontSize: "15px", fontWeight: 700, color: theme.textPrimary, margin: 0, marginRight: "auto" }}>
                                Activity Log
                            </h3>

                            {/* Search */}
                            <div style={{ position: "relative" }}>
                                <Search size={12} style={{
                                    position: "absolute", left: "10px",
                                    top: "50%", transform: "translateY(-50%)",
                                    color: theme.textMuted, pointerEvents: "none"
                                }} />
                                <input
                                    value={logSearch}
                                    onChange={e => setLogSearch(e.target.value)}
                                    placeholder="Search vendor or issue..."
                                    style={{
                                        paddingLeft: "28px", paddingRight: "10px",
                                        paddingTop: "8px", paddingBottom: "8px",
                                        borderRadius: "10px",
                                        border: `1px solid ${theme.cardBorder}`,
                                        background: theme.pageBg,
                                        color: theme.textPrimary,
                                        fontSize: "12px", outline: "none", width: "200px"
                                    }}
                                />
                            </div>

                            {/* Issue type filter */}
                            <select
                                value={actionFilter}
                                onChange={e => setActionFilter(e.target.value)}
                                style={{
                                    padding: "8px 12px", borderRadius: "10px",
                                    border: `1px solid ${theme.cardBorder}`,
                                    background: theme.pageBg, color: theme.textPrimary,
                                    fontSize: "12px", outline: "none", cursor: "pointer"
                                }}
                            >
                                <option value="all">All Issues</option>
                                {Object.entries(ACTION_LABELS).map(([k, v]) => (
                                    <option key={k} value={k}>{v}</option>
                                ))}
                            </select>

                            {/* Status filter */}
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                style={{
                                    padding: "8px 12px", borderRadius: "10px",
                                    border: `1px solid ${theme.cardBorder}`,
                                    background: theme.pageBg, color: theme.textPrimary,
                                    fontSize: "12px", outline: "none", cursor: "pointer"
                                }}
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="resolved">Resolved</option>
                                <option value="ignored">Ignored</option>
                            </select>

                            {/* Severity pills with live counts */}
                            {[
                                ["all",      "All",      logs.length],
                                ["critical", "Critical", logs.filter(l => l.severity === "critical").length],
                                ["warning",  "Warning",  logs.filter(l => l.severity === "warning").length],
                                ["info",     "Info",     logs.filter(l => l.severity === "info").length],
                            ].map(([f, label, count]) => (
                                <button key={f} onClick={() => setLogFilter(f)} style={{
                                    padding: "7px 13px", borderRadius: "8px",
                                    border: `1px solid ${logFilter === f ? "#7C5AF6" : theme.cardBorder}`,
                                    background: logFilter === f ? "rgba(124,90,246,0.10)" : "transparent",
                                    color:      logFilter === f ? "#7C5AF6" : theme.textMuted,
                                    cursor: "pointer", fontSize: "12px",
                                    fontWeight: logFilter === f ? 600 : 400,
                                    display: "flex", alignItems: "center", gap: "5px"
                                }}>
                                    {label}
                                    {count > 0 && (
                                        <span style={{
                                            fontSize: "10px",
                                            background: logFilter === f ? "#7C5AF6" : theme.cardBorder,
                                            color: logFilter === f ? "#fff" : theme.textMuted,
                                            borderRadius: "10px", padding: "1px 6px", fontWeight: 700
                                        }}>{count}</span>
                                    )}
                                </button>
                            ))}

                            <span style={{ fontSize: "12px", color: theme.textMuted }}>
                                {filteredLogs.length} entries
                            </span>
                        </div>

                        {/* Bulk action bar */}
                        {selected.size > 0 && (
                            <div style={{
                                display: "flex", alignItems: "center", gap: "10px",
                                padding: "10px 16px", marginBottom: "14px",
                                background: "rgba(124,90,246,0.08)",
                                border: "1px solid rgba(124,90,246,0.20)",
                                borderRadius: "12px"
                            }}>
                                <span style={{ fontSize: "13px", fontWeight: 600, color: "#7C5AF6" }}>
                                    {selected.size} selected
                                </span>
                                <button
                                    onClick={() => handleBulkStatus("reviewed")}
                                    disabled={bulkLoading}
                                    style={btn("rgba(34,197,94,0.12)", "#22C55E")}
                                >
                                    <ShieldCheck size={12} /> Mark Reviewed
                                </button>
                                <button
                                    onClick={() => handleBulkStatus("resolved")}
                                    disabled={bulkLoading}
                                    style={btn("rgba(59,130,246,0.12)", "#3B82F6")}
                                >
                                    <CheckCircle size={12} /> Mark Resolved
                                </button>
                                <button
                                    onClick={() => handleBulkStatus("ignored")}
                                    disabled={bulkLoading}
                                    style={btn("rgba(107,114,128,0.12)", "#6B7280")}
                                >
                                    <X size={12} /> Ignore All
                                </button>
                                <button
                                    onClick={() => setSelected(new Set())}
                                    style={{ ...btn("transparent", theme.textMuted), marginLeft: "auto" }}
                                >
                                    Clear Selection
                                </button>
                            </div>
                        )}

                        {/* Log table header */}
                        {pagedLogs.length > 0 && (
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: isMobile
                                    ? "32px 180px 120px 100px 110px 130px 100px"
                                    : "32px minmax(100px,1fr) 100px 80px 90px 110px 80px",
                                gap: "8px", padding: "8px 14px",
                                fontSize: "10px", fontWeight: 700,
                                color: theme.textMuted, textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                borderBottom: `1px solid ${theme.cardBorder}`,
                                marginBottom: "8px"
                            }}>
                                <input
                                    type="checkbox"
                                    checked={selected.size === pagedLogs.length && pagedLogs.length > 0}
                                    onChange={toggleSelectAll}
                                    style={{ cursor: "pointer" }}
                                />
                                <span>Vendor</span>
                                <span>Issue Type</span>
                                <span>Severity</span>
                                <span>Status</span>
                                <span>Detected</span>
                                <span>Actions</span>
                            </div>
                        )}

                        {/* Log rows */}
                        {pagedLogs.length === 0 ? (
                            <div style={{ color: theme.textMuted, textAlign: "center", padding: "48px" }}>
                                No entries match your filter.
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                {pagedLogs.map(l => {
                                    const isSelected  = selected.has(l.log_id);
                                    const logStatus   = l.after_value || "pending";
                                    const sColor      = statusColor(logStatus);

                                    return (
                                        <div key={l.log_id} style={{
                                            display: "grid",
                                            gridTemplateColumns: isMobile
                                                ? "32px 220px 150px 120px 120px 150px 120px"
                                                : "32px 1fr 130px 90px 100px 130px 90px",
                                            gap: "8px", padding: "12px 14px",
                                            borderRadius: "12px", alignItems: "center",
                                            background: isSelected
                                                ? "rgba(124,90,246,0.06)"
                                                : severityBg(l.severity),
                                            border: `1px solid ${isSelected ? "rgba(124,90,246,0.25)" : severityColor(l.severity) + "22"}`
                                        }}>
                                            {/* Checkbox */}
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleSelect(l.log_id)}
                                                style={{ cursor: "pointer" }}
                                            />

                                            {/* Vendor + reason */}
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontSize: "13px", fontWeight: 600, color: theme.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                    {l.vendor_name || "Unknown Vendor"}
                                                </div>
                                                <div style={{ fontSize: "11px", color: theme.textMuted, marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                    {l.reason}
                                                </div>
                                            </div>

                                            {/* Issue type badge */}
                                            <span style={{
                                                fontSize: "10px", fontWeight: 700,
                                                color: severityColor(l.severity),
                                                background: severityBg(l.severity),
                                                padding: "3px 8px", borderRadius: "6px",
                                                textTransform: "uppercase", letterSpacing: "0.3px",
                                                display: "inline-block"
                                            }}>
                                                {ACTION_LABELS[l.action] || l.action}
                                            </span>

                                            {/* Severity */}
                                            <span style={{
                                                fontSize: "11px", fontWeight: 600,
                                                color: severityColor(l.severity),
                                                textTransform: "capitalize"
                                            }}>
                                                {l.severity}
                                            </span>

                                            {/* Status */}
                                            <span style={{
                                                fontSize: "11px", fontWeight: 600,
                                                color: sColor || theme.textMuted,
                                                textTransform: "capitalize"
                                            }}>
                                                {logStatus}
                                            </span>

                                            {/* Date */}
                                            <span style={{ fontSize: "11px", color: theme.textMuted }}>
                                                {fmt(l.created_at)}
                                            </span>

                                            {/* Actions */}
                                            <div style={{ display: "flex", gap: "6px" }}>
                                                <button
                                                    onClick={() => setDetailLog(l)}
                                                    title="View details"
                                                    style={{
                                                        background: "rgba(124,90,246,0.10)",
                                                        border: "none", borderRadius: "7px",
                                                        padding: "5px 8px", cursor: "pointer",
                                                        color: "#7C5AF6", display: "flex", alignItems: "center"
                                                    }}
                                                >
                                                    <Eye size={12} />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(l.log_id, logStatus === "reviewed" ? "pending" : "reviewed")}
                                                    title={logStatus === "reviewed" ? "Unmark" : "Mark reviewed"}
                                                    style={{
                                                        background: logStatus === "reviewed" ? "rgba(34,197,94,0.12)" : "rgba(107,114,128,0.10)",
                                                        border: "none", borderRadius: "7px",
                                                        padding: "5px 8px", cursor: "pointer",
                                                        color: logStatus === "reviewed" ? "#22C55E" : theme.textMuted,
                                                        display: "flex", alignItems: "center"
                                                    }}
                                                >
                                                    <ShieldCheck size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{
                                display: "flex", alignItems: "center",
                                justifyContent: "space-between",
                                marginTop: "20px", paddingTop: "16px",
                                borderTop: `1px solid ${theme.cardBorder}`
                            }}>
                                <span style={{ fontSize: "12px", color: theme.textMuted }}>
                                    Page {logPage} of {totalPages} · {filteredLogs.length} entries
                                </span>
                                <div style={{ display: "flex", gap: "6px" }}>
                                    <button
                                        onClick={() => setLogPage(p => Math.max(1, p - 1))}
                                        disabled={logPage === 1}
                                        style={{
                                            ...btn(theme.pageBg, theme.textPrimary, { border: `1px solid ${theme.cardBorder}`, padding: "7px 12px" }),
                                            opacity: logPage === 1 ? 0.4 : 1,
                                            cursor: logPage === 1 ? "not-allowed" : "pointer"
                                        }}
                                    >
                                        <ChevronLeft size={13} /> Prev
                                    </button>

                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const p = Math.max(1, Math.min(totalPages - 4, logPage - 2)) + i;
                                        return (
                                            <button key={p} onClick={() => setLogPage(p)} style={{
                                                padding: "7px 11px", borderRadius: "8px",
                                                border: `1px solid ${p === logPage ? "#7C5AF6" : theme.cardBorder}`,
                                                background: p === logPage ? "rgba(124,90,246,0.12)" : theme.pageBg,
                                                color: p === logPage ? "#7C5AF6" : theme.textPrimary,
                                                cursor: "pointer", fontSize: "12px",
                                                fontWeight: p === logPage ? 700 : 400
                                            }}>
                                                {p}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => setLogPage(p => Math.min(totalPages, p + 1))}
                                        disabled={logPage === totalPages}
                                        style={{
                                            ...btn(theme.pageBg, theme.textPrimary, { border: `1px solid ${theme.cardBorder}`, padding: "7px 12px" }),
                                            opacity: logPage === totalPages ? 0.4 : 1,
                                            cursor: logPage === totalPages ? "not-allowed" : "pointer"
                                        }}
                                    >
                                        Next <ChevronRight size={13} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                </>)}
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </div>
        <ConfirmModal
            isOpen={deleteRunModal.open}
            title="Delete Run"
            message="Are you sure you want to delete this run and all its logs? This cannot be undone."
            confirmText="Delete"
            confirmColor="#EF4444"
            loading={deleteRunLoading}
            onConfirm={confirmDeleteRun}
            onCancel={() => setDeleteRunModal({ open: false, runId: null })}
        />
        </DashboardLayout>
    );
}