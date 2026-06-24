import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import {
    Play, RefreshCw, AlertTriangle, CheckCircle,
    ArrowLeft, ChevronDown, ChevronUp, Search
} from "lucide-react";
import {
    getCleanupDashboard, runAnalysis,
    getCleanupReports, getAllCleanupLogs
} from "../../services/vendorCleanupService";

// ── Helpers ───────────────────────────────────────────────────────────

const severityColor = (s) =>
    s === "critical" ? "#EF4444" : s === "warning" ? "#F59E0B" : "#6B7280";

const severityBg = (s) =>
    s === "critical" ? "rgba(239,68,68,0.08)"
    : s === "warning" ? "rgba(245,158,11,0.08)"
    : "rgba(107,114,128,0.08)";

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

const fmt = (iso) =>
    iso ? new Date(iso).toLocaleString() : "—";

// ── Component ─────────────────────────────────────────────────────────

export default function VendorCleanupPage() {
    const theme    = useTheme();
    const navigate = useNavigate();

    const [dashboard,   setDashboard]   = useState(null);
    const [reports,     setReports]     = useState([]);
    const [logs,        setLogs]        = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [running,     setRunning]     = useState(false);
    const [activeTab,   setActiveTab]   = useState("dashboard");
    const [expandedRun, setExpandedRun] = useState(null);
    const [runResult,   setRunResult]   = useState(null);
    const [logFilter,   setLogFilter]   = useState("all");
    const [logSearch,   setLogSearch]   = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [dash, rep, lg] = await Promise.all([
                getCleanupDashboard(),
                getCleanupReports(),
                getAllCleanupLogs()
            ]);
            setDashboard(dash.data);
            setReports(rep.reports  || []);
            setLogs(lg.logs         || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleRun = async () => {
        setRunning(true);
        setRunResult(null);
        try {
            const res = await runAnalysis();
            setRunResult(res.stats);
            await load();
            setActiveTab("reports");
        } catch (e) {
            console.error(e);
        } finally {
            setRunning(false);
        }
    };

    // Filtered logs
    const visibleLogs = logs.filter(l => {
        const matchSeverity = logFilter === "all" || l.severity === logFilter;
        const matchSearch   = !logSearch
            || (l.vendor_name || "").toLowerCase().includes(logSearch.toLowerCase())
            || (l.action      || "").toLowerCase().includes(logSearch.toLowerCase())
            || (l.reason      || "").toLowerCase().includes(logSearch.toLowerCase());
        return matchSeverity && matchSearch;
    });

    // ── Styles ─────────────────────────────────────────────────────────

    const card = {
        background:   theme.cardBg,
        border:       `1px solid ${theme.cardBorder}`,
        borderRadius: "16px",
        padding:      "24px",
    };

    const Tab = ({ k, label }) => (
        <button
            onClick={() => setActiveTab(k)}
            style={{
                padding:    "8px 18px",
                borderRadius: "10px",
                border:     "none",
                cursor:     "pointer",
                fontSize:   "13px",
                fontWeight: activeTab === k ? 600 : 400,
                background: activeTab === k ? "rgba(124,90,246,0.12)" : "transparent",
                color:      activeTab === k ? "#7C5AF6" : theme.textMuted,
                transition: "all 0.15s"
            }}
        >
            {label}
        </button>
    );

    const StatCard = ({ label, value, color = "#7C5AF6" }) => (
        <div style={{
            ...card, padding: "20px",
            display: "flex", flexDirection: "column", gap: "6px"
        }}>
            <span style={{ fontSize: "11px", color: theme.textMuted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {label}
            </span>
            <span style={{ fontSize: "26px", fontWeight: 700, color }}>
                {value ?? "—"}
            </span>
        </div>
    );

    const last = dashboard?.last_run;

    // ── Render ─────────────────────────────────────────────────────────

    return (
        <div style={{ minHeight: "100vh", background: theme.pageBg, padding: "32px 24px" }}>
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

                {/* ── Header ──────────────────────────────────────────── */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "28px" }}>
                    <button
                        onClick={() => navigate("/admin")}
                        style={{
                            background: theme.cardBg,
                            border: `1px solid ${theme.cardBorder}`,
                            borderRadius: "10px", padding: "8px 12px",
                            cursor: "pointer", color: theme.textMuted,
                            display: "flex", alignItems: "center", gap: "6px", fontSize: "13px"
                        }}
                    >
                        <ArrowLeft size={14} /> Back
                    </button>

                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "11px", color: theme.textMuted, marginBottom: "2px" }}>
                            ADMIN PANEL
                        </div>
                        <h1 style={{ fontSize: "22px", fontWeight: 700, color: theme.textPrimary, margin: 0 }}>
                            Vendor Data Quality
                        </h1>
                        <p style={{ fontSize: "12px", color: theme.textMuted, marginTop: "2px" }}>
                            Detect and review data quality issues in vendor records
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                        <button
                            onClick={load}
                            style={{
                                background: theme.cardBg,
                                border: `1px solid ${theme.cardBorder}`,
                                borderRadius: "10px", padding: "8px 14px",
                                cursor: "pointer", color: theme.textMuted,
                                display: "flex", alignItems: "center", gap: "6px", fontSize: "13px"
                            }}
                        >
                            <RefreshCw size={13} /> Refresh
                        </button>

                        <button
                            onClick={handleRun}
                            disabled={running}
                            style={{
                                background: running ? "rgba(124,90,246,0.5)" : "#7C5AF6",
                                color: "#fff", border: "none", borderRadius: "10px",
                                padding: "8px 18px",
                                cursor: running ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", gap: "8px",
                                fontSize: "13px", fontWeight: 600
                            }}
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
                        background: "rgba(34,197,94,0.10)",
                        border: "1px solid rgba(34,197,94,0.25)",
                        borderRadius: "12px", padding: "14px 20px",
                        marginBottom: "20px",
                        display: "flex", alignItems: "center", gap: "12px"
                    }}>
                        <CheckCircle size={16} color="#22C55E" />
                        <span style={{ color: "#22C55E", fontWeight: 600, fontSize: "13px" }}>
                            Analysis complete — {runResult.issues_detected} issues found across {runResult.total_scanned} vendors. Review the findings below.
                        </span>
                    </div>
                )}

                {/* ── Tabs ─────────────────────────────────────────────── */}
                <div style={{
                    display: "flex", gap: "4px", marginBottom: "20px",
                    background: theme.cardBg,
                    border: `1px solid ${theme.cardBorder}`,
                    borderRadius: "12px", padding: "6px",
                    width: "fit-content"
                }}>
                    <Tab k="dashboard" label="Dashboard"    />
                    <Tab k="reports"   label="Run History"  />
                    <Tab k="logs"      label="Activity Logs"/>
                </div>

                {loading ? (
                    <div style={{ color: theme.textMuted, textAlign: "center", padding: "60px" }}>
                        Loading...
                    </div>
                ) : (
                <>

                {/* ══════════════════════════════════════════════════════
                    DASHBOARD TAB
                ══════════════════════════════════════════════════════ */}
                {activeTab === "dashboard" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                        {/* Top row */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px" }}>
                            <StatCard label="Total Vendors"     value={dashboard?.total_vendors} color="#7C5AF6" />
                            <StatCard label="Total Runs"        value={dashboard?.total_runs}    color="#6B7280" />
                            <StatCard label="Issues Detected"   value={last?.issues_detected}    color={last?.issues_detected > 0 ? "#F59E0B" : "#22C55E"} />
                            <StatCard label="Needs Review"      value={last?.issues_pending}     color={last?.issues_pending  > 0 ? "#EF4444" : "#22C55E"} />
                            <StatCard label="Auto Fixed"        value={last?.issues_fixed ?? 0}  color="#22C55E" />
                        </div>

                        {/* Breakdown */}
                        {last ? (
                            <div style={card}>
                                <h3 style={{ fontSize: "14px", fontWeight: 600, color: theme.textPrimary, marginBottom: "16px" }}>
                                    Last Run Breakdown
                                </h3>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
                                    {[
                                        ["Potential Duplicates", last.duplicates_found,      "#EF4444"],
                                        ["Invalid Emails",       last.invalid_emails,        "#EF4444"],
                                        ["Phone Issues",         last.missing_phones,        "#F59E0B"],
                                        ["Price Issues",         last.price_inconsistencies, "#F59E0B"],
                                        ["Inactive Vendors",     last.inactive_vendors,      "#6B7280"],
                                        ["Missing Information",  last.missing_info,          "#6B7280"],
                                    ].map(([label, val, color]) => (
                                        <div key={label} style={{
                                            background: theme.panelBg || theme.cardBg,
                                            border: `1px solid ${theme.cardBorder}`,
                                            borderRadius: "12px", padding: "16px",
                                        }}>
                                            <div style={{ fontSize: "11px", color: theme.textMuted, marginBottom: "6px" }}>{label}</div>
                                            <div style={{ fontSize: "22px", fontWeight: 700, color }}>{val}</div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: "14px", fontSize: "11px", color: theme.textMuted }}>
                                    Last analysed: {fmt(last.completed_at)} · {last.total_scanned} vendors scanned
                                </div>
                            </div>
                        ) : (
                            <div style={{ ...card, textAlign: "center", color: theme.textMuted, padding: "56px" }}>
                                No analysis runs yet. Click <strong>Run Analysis</strong> to start.
                            </div>
                        )}
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════
                    REPORTS TAB
                ══════════════════════════════════════════════════════ */}
                {activeTab === "reports" && (
                    <div style={card}>
                        <h3 style={{ fontSize: "14px", fontWeight: 600, color: theme.textPrimary, marginBottom: "16px" }}>
                            Run History
                        </h3>

                        {reports.length === 0 ? (
                            <div style={{ color: theme.textMuted, textAlign: "center", padding: "48px" }}>
                                No runs yet.
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {reports.map(r => (
                                    <div key={r.run_id} style={{
                                        border: `1px solid ${theme.cardBorder}`,
                                        borderRadius: "12px", overflow: "hidden"
                                    }}>
                                        {/* Row */}
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
                                                background: r.status === "completed" ? "#22C55E" : r.status === "failed" ? "#EF4444" : "#F59E0B"
                                            }} />
                                            <span style={{ fontSize: "13px", color: theme.textPrimary, fontWeight: 500, flex: 1 }}>
                                                {fmt(r.started_at)}
                                            </span>
                                            <span style={{ fontSize: "12px", color: theme.textMuted }}>
                                                {r.total_scanned} vendors
                                            </span>
                                            <span style={{
                                                fontSize: "12px", fontWeight: 600,
                                                color: r.issues_detected > 0 ? "#F59E0B" : "#22C55E"
                                            }}>
                                                {r.issues_detected} issues
                                            </span>
                                            <span style={{ fontSize: "11px", color: theme.textMuted }}>
                                                {r.performed_by || "—"}
                                            </span>
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
                                                background: theme.panelBg || theme.cardBg,
                                                display: "grid",
                                                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                                                gap: "12px"
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
                                                        <div style={{ fontSize: "11px", color: theme.textMuted }}>{label}</div>
                                                        <div style={{ fontSize: "18px", fontWeight: 700, color }}>{val}</div>
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

                {/* ══════════════════════════════════════════════════════
                    LOGS TAB
                ══════════════════════════════════════════════════════ */}
                {activeTab === "logs" && (
                    <div style={card}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                            <h3 style={{ fontSize: "14px", fontWeight: 600, color: theme.textPrimary, margin: 0, flex: 1 }}>
                                Activity Log
                            </h3>

                            {/* Search */}
                            <div style={{ position: "relative" }}>
                                <Search size={12} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: theme.textMuted }} />
                                <input
                                    value={logSearch}
                                    onChange={e => setLogSearch(e.target.value)}
                                    placeholder="Search vendor or issue..."
                                    style={{
                                        paddingLeft: "28px", paddingRight: "10px",
                                        paddingTop: "7px", paddingBottom: "7px",
                                        borderRadius: "8px",
                                        border: `1px solid ${theme.cardBorder}`,
                                        background: theme.cardBg,
                                        color: theme.textPrimary,
                                        fontSize: "12px", outline: "none", width: "200px"
                                    }}
                                />
                            </div>

                            {/* Severity filter */}
                            {["all", "critical", "warning", "info"].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setLogFilter(f)}
                                    style={{
                                        padding: "6px 12px", borderRadius: "8px",
                                        border: `1px solid ${logFilter === f ? "#7C5AF6" : theme.cardBorder}`,
                                        background: logFilter === f ? "rgba(124,90,246,0.10)" : "transparent",
                                        color: logFilter === f ? "#7C5AF6" : theme.textMuted,
                                        cursor: "pointer", fontSize: "12px",
                                        fontWeight: logFilter === f ? 600 : 400,
                                        textTransform: "capitalize"
                                    }}
                                >
                                    {f}
                                </button>
                            ))}

                            <span style={{ fontSize: "12px", color: theme.textMuted }}>
                                {visibleLogs.length} entries
                            </span>
                        </div>

                        {visibleLogs.length === 0 ? (
                            <div style={{ color: theme.textMuted, textAlign: "center", padding: "48px" }}>
                                No entries match your filter.
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {visibleLogs.map(l => (
                                    <div key={l.log_id} style={{
                                        display: "flex", alignItems: "flex-start", gap: "12px",
                                        padding: "12px 14px", borderRadius: "10px",
                                        background: severityBg(l.severity),
                                        border: `1px solid ${severityColor(l.severity)}22`
                                    }}>
                                        <AlertTriangle
                                            size={13}
                                            color={severityColor(l.severity)}
                                            style={{ marginTop: "2px", flexShrink: 0 }}
                                        />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                                <span style={{
                                                    fontSize: "10px", fontWeight: 700,
                                                    color: severityColor(l.severity),
                                                    background: severityBg(l.severity),
                                                    padding: "2px 8px", borderRadius: "6px",
                                                    textTransform: "uppercase", letterSpacing: "0.4px"
                                                }}>
                                                    {ACTION_LABELS[l.action] || l.action}
                                                </span>
                                                <span style={{ fontSize: "13px", fontWeight: 600, color: theme.textPrimary }}>
                                                    {l.vendor_name || "Unknown Vendor"}
                                                </span>
                                                <span style={{ fontSize: "11px", color: theme.textMuted, marginLeft: "auto" }}>
                                                    {fmt(l.created_at)}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: "12px", color: theme.textMuted, marginTop: "4px" }}>
                                                {l.reason}
                                            </div>
                                            {l.before_value && (
                                                <div style={{ fontSize: "11px", color: theme.textMuted, marginTop: "3px" }}>
                                                    Value:{" "}
                                                    <code style={{
                                                        background: theme.cardBg,
                                                        padding: "1px 6px", borderRadius: "4px",
                                                        fontSize: "11px"
                                                    }}>
                                                        {l.before_value}
                                                    </code>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                </>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}