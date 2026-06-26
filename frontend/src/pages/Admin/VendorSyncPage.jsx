import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../../context/ThemeContext";
import DashboardLayout from "../../components/layouts/DashboardLayout/DashboardLayout";
import Toast from "../../components/common/Toast/Toast";
import {
    RefreshCw, Play, CheckCircle, XCircle, Clock,
    ChevronDown, ChevronUp, Search, ChevronLeft,
    ChevronRight, Download, AlertTriangle, Activity
} from "lucide-react";
import {
    getSyncDashboard, runSync,
    getSyncRuns, getSyncLogs
} from "../../services/vendorSyncService";

const fmt = (iso) => iso ? new Date(iso).toLocaleString() : "—";
const PAGE_SIZE = 25;

const statusColor = (s) =>
    s === "success" ? "#22C55E"
    : s === "failed"  ? "#EF4444"
    : s === "skipped" ? "#F59E0B"
    : s === "running" ? "#3B82F6"
    : "#6B7280";

const statusBg = (s) =>
    s === "success" ? "rgba(34,197,94,0.08)"
    : s === "failed"  ? "rgba(239,68,68,0.08)"
    : s === "skipped" ? "rgba(245,158,11,0.08)"
    : s === "running" ? "rgba(59,130,246,0.08)"
    : "rgba(107,114,128,0.08)";

const exportCSV = (logs) => {
    const headers = ["Vendor Name", "Status", "Attempts", "Message", "Date"];
    const rows = logs.map(l => [
        l.vendor_name || "",
        l.status,
        l.attempts,
        (l.message || "").replace(/,/g, ";"),
        fmt(l.created_at)
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `vendor-sync-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};

export default function VendorSyncPage() {
    const theme = useTheme();

    const [dashboard,   setDashboard]   = useState(null);
    const [runs,        setRuns]        = useState([]);
    const [logs,        setLogs]        = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [running,     setRunning]     = useState(false);
    const [activeTab,   setActiveTab]   = useState("dashboard");
    const [expandedRun, setExpandedRun] = useState(null);
    const [runResult,   setRunResult]   = useState(null);
    const [toast,       setToast]       = useState(null);

    const [logSearch,    setLogSearch]    = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [logPage,      setLogPage]      = useState(1);


    const showToast = (msg, type = "success") => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [dash, r, lg] = await Promise.all([
                getSyncDashboard(),
                getSyncRuns(),
                getSyncLogs()
            ]);
            setDashboard(dash.data);
            setRuns(r.runs   || []);
            setLogs(lg.logs  || []);
        } catch (e) {
            console.error(e);
            showToast("Failed to load sync data", "error");
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

    const handleRunSync = async () => {
        setRunning(true);
        setRunResult(null);
        try {
            const res = await runSync();
            setRunResult(res);
            await load();
            setActiveTab("runs");
            showToast(`Sync complete — ${res.success_count} succeeded, ${res.failed_count} failed`);
        } catch (e) {
            console.error(e);
            showToast("Sync failed", "error");
        } finally {
            setRunning(false);
        }
    };

    const filteredLogs = logs.filter(l => {
        const matchStatus = statusFilter === "all" || l.status === statusFilter;
        const matchSearch = !logSearch
            || (l.vendor_name || "").toLowerCase().includes(logSearch.toLowerCase())
            || (l.message     || "").toLowerCase().includes(logSearch.toLowerCase());
        return matchStatus && matchSearch;
    });

    const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);
    const pagedLogs  = filteredLogs.slice((logPage - 1) * PAGE_SIZE, logPage * PAGE_SIZE);

    useEffect(() => { setLogPage(1); }, [statusFilter, logSearch]);

    const last = dashboard?.latest_run;

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
        transition: "opacity 0.15s", ...extra
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

    return (
        <DashboardLayout>
        <div style={{ minHeight: "100vh", background: theme.pageBg, padding: isMobile ? "12px" : "20px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: isMobile ? "12px" : "20px", width: "100%"}}>

            {toast && (
                <div style={{ position: "fixed", top: "24px", right: "24px", zIndex: 9999 }}>
                    <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
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
                    <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "#7C5AF6", margin: "0 0 6px" }}>
                        Admin Panel · Vendor Sync
                    </p>
                    <h1 style={{ fontSize: "22px", fontWeight: 800, color: theme.textPrimary, margin: "0 0 4px" }}>
                        Vendor Data Synchronization
                    </h1>
                    <p style={{ fontSize: "13px", color: theme.textMuted, margin: 0 }}>
                        Automated sync runs every 1 hour. Validates all parent vendor records.
                    </p>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button onClick={() => exportCSV(logs)} style={btn(theme.cardBg, theme.textMuted, { border: `1px solid ${theme.cardBorder}`, padding: "9px 16px" })}>
                        <Download size={13} /> Export CSV
                    </button>
                    <button onClick={load} style={btn(theme.cardBg, theme.textMuted, { border: `1px solid ${theme.cardBorder}`, padding: "9px 16px" })}>
                        <RefreshCw size={13} /> Refresh
                    </button>
                    <button
                        onClick={handleRunSync}
                        disabled={running}
                        style={btn(
                            running ? "rgba(124,90,246,0.5)" : "#7C5AF6", "#fff",
                            { padding: "9px 20px", cursor: running ? "not-allowed" : "pointer", opacity: running ? 0.7 : 1 }
                        )}
                    >
                        {running
                            ? <><RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} /> Syncing...</>
                            : <><Play size={13} /> Run Sync Now</>
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
                        Sync complete — {runResult.success_count} vendors synced successfully, {runResult.failed_count} failed out of {runResult.total_vendors} total.
                    </span>
                </div>
            )}

            {/* ── Scheduler Status Card ────────────────────────────── */}
            <div style={{
                ...card, padding: "16px 24px",
                display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 8px #22C55E" }} />
                    <span style={{ fontSize: "13px", fontWeight: 600, color: theme.textPrimary }}>Scheduler Running</span>
                </div>
                <div style={{ width: "1px", height: "24px", background: theme.cardBorder }} />
                <div style={{ fontSize: "12px", color: theme.textMuted }}>
                    Interval: <strong style={{ color: theme.textPrimary }}>Every 1 hour</strong>
                </div>
                <div style={{ width: "1px", height: "24px", background: theme.cardBorder }} />
                <div style={{ fontSize: "12px", color: theme.textMuted }}>
                    Last Run: <strong style={{ color: theme.textPrimary }}>{last ? fmt(last.started_at) : "Never"}</strong>
                </div>
                <div style={{ width: "1px", height: "24px", background: theme.cardBorder }} />
                <div style={{ fontSize: "12px", color: theme.textMuted }}>
                    Last Status:{" "}
                    <strong style={{ color: statusColor(last?.status) }}>
                        {last?.status ? last.status.charAt(0).toUpperCase() + last.status.slice(1) : "—"}
                    </strong>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Activity size={13} color="#3B82F6" />
                    <span style={{ fontSize: "11px", color: "#3B82F6", fontWeight: 600 }}>Auto-sync active</span>
                </div>
            </div>

            {/* ── Inline KPI bar ───────────────────────────────────── */}
            <div style={{
                ...card, padding: "16px 24px",
                display: "flex", alignItems: "center", gap: "0", flexWrap: "wrap"
            }}>
                {[
                    { label: "Total Runs",      value: dashboard?.total_runs ?? "—",    color: "#7C5AF6" },
                    { label: "Vendors in Scope",value: dashboard?.total_vendors ?? "—", color: "#7C5AF6" },
                    { label: "Last Synced OK",  value: last?.success_count ?? "—",      color: "#22C55E" },
                    { label: "Last Failed",     value: last?.failed_count ?? "—",       color: last?.failed_count > 0 ? "#EF4444" : "#6B7280" },
                    { label: "Last Status",     value: last?.status ? last.status.charAt(0).toUpperCase() + last.status.slice(1) : "—", color: statusColor(last?.status) },
                ].map((item, i, arr) => (
                    <div key={item.label} style={{
                        flex: 1, minWidth: "120px", padding: "8px 20px",
                        borderRight: i < arr.length - 1 ? `1px solid ${theme.cardBorder}` : "none"
                    }}>
                        <div style={{ fontSize: "10px", fontWeight: 600, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                            {item.label}
                        </div>
                        <div style={{ fontSize: "20px", fontWeight: 800, color: item.color, textTransform: "capitalize" }}>
                            {item.value}
                        </div>
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
                <Tab k="dashboard" label="Dashboard"     />
                <Tab k="runs"      label="Sync Runs"     />
                <Tab k="logs"      label="Activity Logs" />
            </div>

            {loading ? (
                <div style={{ ...card, textAlign: "center", color: theme.textMuted, padding: "60px" }}>Loading...</div>
            ) : (<>

            {/* ════════════════════════════════════════════════════
                DASHBOARD TAB
            ════════════════════════════════════════════════════ */}
            {activeTab === "dashboard" && (
                <div style={card}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                        <div>
                            <h3 style={{ fontSize: "15px", fontWeight: 700, color: theme.textPrimary, margin: 0 }}>Last Run Details</h3>
                            {last && <p style={{ fontSize: "12px", color: theme.textMuted, margin: "4px 0 0" }}>
                                {fmt(last.started_at)} → {fmt(last.completed_at)}
                            </p>}
                        </div>
                        {last && (
                            <span style={{
                                padding: "5px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 700,
                                background: last.status === "completed" ? "#22C55E18" : last.status === "failed" ? "#EF444418" : "#F59E0B18",
                                color: last.status === "completed" ? "#22C55E" : last.status === "failed" ? "#EF4444" : "#F59E0B",
                                textTransform: "capitalize"
                            }}>{last.status}</span>
                        )}
                    </div>

                    {last ? (
                        <>
                            {/* Progress bar */}
                            <div style={{ marginBottom: "20px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: theme.textMuted, marginBottom: "6px" }}>
                                    <span>Sync success rate</span>
                                    <span style={{ fontWeight: 700, color: "#22C55E" }}>
                                        {last.total_vendors > 0 ? Math.round((last.success_count / last.total_vendors) * 100) : 0}%
                                    </span>
                                </div>
                                <div style={{ height: "8px", borderRadius: "4px", background: theme.pageBg, overflow: "hidden", border: `1px solid ${theme.cardBorder}` }}>
                                    <div style={{
                                        height: "100%", borderRadius: "4px",
                                        width: `${last.total_vendors > 0 ? Math.round((last.success_count / last.total_vendors) * 100) : 0}%`,
                                        background: "linear-gradient(90deg, #22C55E, #10B981)", transition: "width 0.6s ease"
                                    }} />
                                </div>
                            </div>

                            {/* Row-based breakdown */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "1px", borderRadius: "12px", overflow: "hidden", border: `1px solid ${theme.cardBorder}` }}>
                                {[
                                    { label: "Total Scanned",  value: last.total_vendors,  color: "#7C5AF6", icon: "📦" },
                                    { label: "Synced OK",      value: last.success_count,  color: "#22C55E", icon: "✓" },
                                    { label: "Failed",         value: last.failed_count,   color: last.failed_count > 0 ? "#EF4444" : "#6B7280", icon: "✕" },
                                    { label: "Retry Attempts", value: last.retry_count ?? 0, color: "#F59E0B", icon: "↻" },
                                ].map((row, i) => (
                                    <div key={row.label} style={{
                                        display: "flex", alignItems: "center", justifyContent: "space-between",
                                        padding: "12px 18px",
                                        background: i % 2 === 0 ? theme.pageBg : theme.cardBg,
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <span style={{ fontSize: "13px" }}>{row.icon}</span>
                                            <span style={{ fontSize: "13px", color: theme.textMuted, fontWeight: 500 }}>{row.label}</span>
                                        </div>
                                        <span style={{ fontSize: "16px", fontWeight: 800, color: row.color }}>{row.value ?? 0}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: "14px", display: "flex", justifyContent: "flex-end" }}>
                                <button onClick={() => setActiveTab("logs")} style={btn("rgba(124,90,246,0.10)", "#7C5AF6")}>
                                    View Activity Logs
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: "center", color: theme.textMuted, padding: "56px" }}>
                            No sync runs yet. Click <strong>Run Sync Now</strong> to start.
                        </div>
                    )}
                </div>
            )}

            {/* ════════════════════════════════════════════════════
                SYNC RUNS TAB
            ════════════════════════════════════════════════════ */}
            {activeTab === "runs" && (
                <div style={card}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 700, color: theme.textPrimary, margin: 0 }}>Sync Run History</h3>
                        <span style={{ fontSize: "12px", color: theme.textMuted }}>{runs.length} runs</span>
                    </div>

                    {runs.length === 0 ? (
                        <div style={{ color: theme.textMuted, textAlign: "center", padding: "48px" }}>No runs yet.</div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", overflowX: "auto", width: "100%", minWidth: 0 }}>
                            {runs.map(r => (
                                <div key={r.run_id} style={{ border: `1px solid ${theme.cardBorder}`, borderRadius: "14px", overflow: "hidden" }}>
                                    <div
                                        onClick={() => setExpandedRun(expandedRun === r.run_id ? null : r.run_id)}
                                        style={{
                                            display: "flex", alignItems: "center", gap: "14px",
                                            padding: "14px 18px", cursor: "pointer", background: theme.cardBg
                                        }}
                                    >
                                        <span style={{
                                            width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                                            background: statusColor(r.status)
                                        }} />
                                        <span style={{ fontSize: "13px", color: theme.textPrimary, fontWeight: 500, flex: 1 }}>
                                            {fmt(r.started_at)}
                                        </span>
                                        <span style={{ fontSize: "12px", color: theme.textMuted }}>{r.total_vendors} vendors</span>
                                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#22C55E" }}>{r.success_count} ok</span>
                                        <span style={{ fontSize: "12px", fontWeight: 700, color: r.failed_count > 0 ? "#EF4444" : "#22C55E" }}>
                                            {r.failed_count} failed
                                        </span>
                                        <span style={{
                                            fontSize: "11px", fontWeight: 600,
                                            color: statusColor(r.status),
                                            background: statusBg(r.status),
                                            padding: "3px 10px", borderRadius: "8px",
                                            textTransform: "capitalize"
                                        }}>
                                            {r.status}
                                        </span>
                                        {expandedRun === r.run_id
                                            ? <ChevronUp   size={14} color={theme.textMuted} />
                                            : <ChevronDown size={14} color={theme.textMuted} />
                                        }
                                    </div>

                                    {expandedRun === r.run_id && (
                                        <div style={{
                                            padding: "16px 18px",
                                            borderTop: `1px solid ${theme.cardBorder}`,
                                            background: theme.pageBg,
                                            display: "grid",
                                            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                                            gap: "14px"
                                        }}>
                                            {[
                                                ["Total Vendors", r.total_vendors, "#3B82F6"],
                                                ["Successful",    r.success_count, "#22C55E"],
                                                ["Failed",        r.failed_count,  r.failed_count > 0 ? "#EF4444" : "#22C55E"],
                                                ["Started",       fmt(r.started_at),   theme.textPrimary],
                                                ["Completed",     fmt(r.completed_at), theme.textPrimary],
                                            ].map(([label, val, color]) => (
                                                <div key={label}>
                                                    <div style={{ fontSize: "10px", color: theme.textMuted, marginBottom: "4px", fontWeight: 500 }}>{label}</div>
                                                    <div style={{ fontSize: typeof val === "number" ? "20px" : "12px", fontWeight: 700, color }}>{val}</div>
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

                        <div style={{ position: "relative" }}>
                            <Search size={12} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: theme.textMuted, pointerEvents: "none" }} />
                            <input
                                value={logSearch}
                                onChange={e => setLogSearch(e.target.value)}
                                placeholder="Search vendor or message..."
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
                            <option value="success">Success</option>
                            <option value="failed">Failed</option>
                            <option value="skipped">Skipped</option>
                        </select>

                        <button onClick={() => exportCSV(filteredLogs)} style={btn("rgba(59,130,246,0.10)", "#3B82F6")}>
                            <Download size={12} /> Export
                        </button>

                        <span style={{ fontSize: "12px", color: theme.textMuted }}>{filteredLogs.length} entries</span>
                    </div>

                    {/* Table header */}
                    {pagedLogs.length > 0 && (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: isMobile
                                ? "220px 100px 90px 220px 140px"
                                : "1fr 90px 70px 1fr 110px",
                            gap: "8px", padding: "8px 14px",
                            fontSize: "10px", fontWeight: 700,
                            color: theme.textMuted, textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            borderBottom: `1px solid ${theme.cardBorder}`,
                            marginBottom: "8px"
                        }}>
                            <span>Vendor</span>
                            <span>Status</span>
                            <span>Attempts</span>
                            <span>Message</span>
                            <span>Date</span>
                        </div>
                    )}

                    {pagedLogs.length === 0 ? (
                        <div style={{ color: theme.textMuted, textAlign: "center", padding: "48px" }}>
                            No entries match your filter.
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {pagedLogs.map(l => (
                                <div key={l.log_id} style={{
                                    display: "grid",
                                    gridTemplateColumns: isMobile
                                        ? "220px 100px 90px 220px 140px"
                                        : "1fr 90px 70px 1fr 110px",
                                    gap: "8px", padding: "12px 14px",
                                    borderRadius: "12px", alignItems: "center",
                                    background: statusBg(l.status),
                                    border: `1px solid ${statusColor(l.status)}22`
                                }}>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontSize: "13px", fontWeight: 600, color: theme.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {l.vendor_name || "Unknown"}
                                        </div>
                                    </div>

                                    <span style={{
                                        fontSize: "10px", fontWeight: 700,
                                        color: statusColor(l.status),
                                        background: statusBg(l.status),
                                        padding: "3px 8px", borderRadius: "6px",
                                        textTransform: "uppercase", letterSpacing: "0.3px",
                                        display: "inline-block", width: "fit-content"
                                    }}>
                                        {l.status}
                                    </span>

                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <span style={{ fontSize: "13px", fontWeight: 600, color: l.attempts > 1 ? "#F59E0B" : theme.textPrimary }}>
                                            {l.attempts}
                                        </span>
                                        {l.attempts > 1 && <AlertTriangle size={12} color="#F59E0B" />}
                                    </div>

                                    <span style={{ fontSize: "12px", color: theme.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {l.message || "—"}
                                    </span>

                                    <span style={{ fontSize: "11px", color: theme.textMuted }}>
                                        {fmt(l.created_at)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
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
                                        opacity: logPage === 1 ? 0.4 : 1, cursor: logPage === 1 ? "not-allowed" : "pointer"
                                    }}
                                >
                                    <ChevronLeft size={13} /> Prev
                                </button>

                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const p = Math.max(1, Math.min(totalPages - 4, logPage - 2)) + i;
                                    return (
                                        <button key={p} onClick={() => setLogPage(p)} style={{
                                            padding: "7px 11px", borderRadius: "8px",
                                            border: `1px solid ${p === logPage ? "#3B82F6" : theme.cardBorder}`,
                                            background: p === logPage ? "rgba(59,130,246,0.12)" : theme.pageBg,
                                            color: p === logPage ? "#3B82F6" : theme.textPrimary,
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
                                        opacity: logPage === totalPages ? 0.4 : 1, cursor: logPage === totalPages ? "not-allowed" : "pointer"
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
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
        </div>
        </DashboardLayout>
    );
}