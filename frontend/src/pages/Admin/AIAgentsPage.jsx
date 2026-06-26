import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout/DashboardLayout";
import { useTheme } from "../../context/ThemeContext";
import {
    BrainCircuit, Bot, CheckCircle2, XCircle,
    History, Settings, Eye, Search, Plus
} from "lucide-react";
import { getAllAgents } from "../../services/agentService";

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true
    });
};

const CAPABILITY_MAP = {
    ranking_agent:       [{ label: "Ranking",   color: "#7C5AF6" }, { label: "Scoring",   color: "#3B82F6" }],
    response_agent:      [{ label: "Response",  color: "#10B981" }, { label: "LLM",       color: "#F59E0B" }],
    comparison_agent:    [{ label: "Comparison",color: "#EF4444" }, { label: "Analysis",  color: "#8B5CF6" }],
    discovery_agent:     [{ label: "Discovery", color: "#06B6D4" }, { label: "Search",    color: "#3B82F6" }],
    context_agent:       [{ label: "Context",   color: "#F97316" }, { label: "Memory",    color: "#6366F1" }],
    query_analysis_agent:[{ label: "Query",     color: "#10B981" }, { label: "NLU",       color: "#7C5AF6" }],
    tool_calling_agent:  [{ label: "Tools",     color: "#F59E0B" }, { label: "Execution", color: "#EF4444" }],
    supervisor_agent:    [{ label: "Routing",   color: "#6366F1" }, { label: "Workflow",  color: "#10B981" }],
};

const getCapabilities = (agentName) => {
    const key = agentName?.toLowerCase().replace(/\s+/g, "_");
    return CAPABILITY_MAP[key] || [{ label: "General", color: "#6B7280" }];
};

// ─── Component ───────────────────────────────────────────────────────────────

const AIAgentsPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const [agents, setAgents]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch]   = useState("");
    const [toast, setToast]     = useState(null);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const res = await getAllAgents();
            setAgents(res?.agents || []);
        } catch {
            showToast("Failed to load agents", "error");
        } finally {
            setLoading(false);
        }
    };

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

    useEffect(() => { fetchAgents(); }, []);

    const filtered = agents.filter(a =>
        a.display_name?.toLowerCase().includes(search.toLowerCase()) ||
        a.description?.toLowerCase().includes(search.toLowerCase())
    );

    const stats = {
        total:    agents.length,
        active:   agents.filter(a => a.status === true).length,
        inactive: agents.filter(a => !a.status).length,
        versions: agents.reduce((s, a) => s + (a.version_count || 0), 0),
    };

    // ── Styles ──────────────────────────────────────────────────────────────

    const card = {
        background:   theme.cardBg,
        border:       `1px solid ${theme.cardBorder}`,
        borderRadius: "16px",
        padding:      "24px",
    };

    const kpiCard = (accent) => ({
        ...card,
        padding:      "20px 24px",
        display:      "flex",
        alignItems:   "center",
        gap:          "16px",
        cursor:       "default",
    });

    const iconBox = (accent) => ({
        width:          "44px",
        height:         "44px",
        borderRadius:   "12px",
        background:     accent + "18",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        flexShrink:     0,
    });

    const th = {
        padding:       "10px 16px",
        fontSize:      "11px",
        fontWeight:    700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color:         theme.textMuted,
        borderBottom:  `1px solid ${theme.cardBorder}`,
        whiteSpace:    "nowrap",
    };

    const td = {
        padding:    "14px 16px",
        fontSize:   "13px",
        color:      theme.textPrimary,
        borderBottom: `1px solid ${theme.cardBorder}`,
        verticalAlign: "middle",
    };

    // ── Render ───────────────────────────────────────────────────────────────

    if (loading) return (
        <DashboardLayout>
            <div style={{ minHeight: "70vh", display: "flex", alignItems: "center",
                          justifyContent: "center", color: theme.textMuted, fontSize: "14px" }}>
                Loading AI Agents...
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div style={{ minHeight: "100vh", background: theme.pageBg, padding: isMobile ? "12px" : "24px", }}>

                {/* TOAST */}
                {toast && (
                    <div style={{
                        position: "fixed", top: "20px", right: "20px", zIndex: 9999,
                        padding: "12px 20px", borderRadius: "12px",
                        background: toast.type === "error" ? "#EF4444" : "#10B981",
                        color: "#fff", fontSize: "13px", fontWeight: 600,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
                    }}>
                        {toast.message}
                    </div>
                )}

                <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex",
                              flexDirection: "column", gap: isMobile ? "12px" : "20px", width: "100%"}}>

                    {/* ── HERO ── */}
                    <div style={{
                        ...card,
                        background: theme.isDark
                            ? "linear-gradient(135deg,#13132a 0%,#1a1040 100%)"
                            : "linear-gradient(135deg,#f5f3ff 0%,#ede9fe 100%)",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        flexWrap: "wrap", gap: "16px"
                    }}>
                        <div>
                            <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "3px",
                                        textTransform: "uppercase", color: "#7C5AF6", marginBottom: "6px" }}>
                                AI AGENTS
                            </p>
                            <h1 style={{ fontSize: "22px", fontWeight: 800, color: theme.textPrimary, margin: 0 }}>
                                AI Agent Management
                            </h1>
                            <p style={{ fontSize: "13px", color: theme.textMuted, marginTop: "6px", marginBottom: 0 }}>
                                Manage prompts, configurations and AI behavior without code changes.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/admin/ai-agents/test")}
                            style={{
                                display: "flex", alignItems: "center", gap: "8px",
                                padding: "10px 20px", borderRadius: "12px",
                                background: "linear-gradient(135deg,#7C5AF6,#6366F1)",
                                color: "#fff", border: "none", cursor: "pointer",
                                fontSize: "13px", fontWeight: 600
                            }}
                        >
                            <Plus size={15} />
                            Test an Agent
                        </button>
                    </div>

                    {/* ── KPI CARDS ── */}
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))" , gap: "16px" }}>

                        <div style={kpiCard("#7C5AF6")}>
                            <div style={iconBox("#7C5AF6")}><Bot size={20} color="#7C5AF6" /></div>
                            <div>
                                <div style={{ fontSize: "26px", fontWeight: 800, color: theme.textPrimary,
                                              lineHeight: 1 }}>{stats.total}</div>
                                <div style={{ fontSize: "12px", color: theme.textMuted, marginTop: "4px" }}>
                                    Total Agents</div>
                                <div style={{ fontSize: "11px", color: theme.textMuted, marginTop: "2px" }}>
                                    All configured agents</div>
                            </div>
                        </div>

                        <div style={kpiCard("#10B981")}>
                            <div style={iconBox("#10B981")}><CheckCircle2 size={20} color="#10B981" /></div>
                            <div>
                                <div style={{ fontSize: "26px", fontWeight: 800, color: theme.textPrimary,
                                              lineHeight: 1 }}>{stats.active}</div>
                                <div style={{ fontSize: "12px", color: theme.textMuted, marginTop: "4px" }}>
                                    Active Agents</div>
                                <div style={{ fontSize: "11px", color: theme.textMuted, marginTop: "2px" }}>
                                    Currently active</div>
                            </div>
                        </div>

                        <div style={kpiCard("#EF4444")}>
                            <div style={iconBox("#EF4444")}><XCircle size={20} color="#EF4444" /></div>
                            <div>
                                <div style={{ fontSize: "26px", fontWeight: 800, color: theme.textPrimary,
                                              lineHeight: 1 }}>{stats.inactive}</div>
                                <div style={{ fontSize: "12px", color: theme.textMuted, marginTop: "4px" }}>
                                    Inactive Agents</div>
                                <div style={{ fontSize: "11px", color: theme.textMuted, marginTop: "2px" }}>
                                    Currently inactive</div>
                            </div>
                        </div>

                        <div style={kpiCard("#F59E0B")}>
                            <div style={iconBox("#F59E0B")}><History size={20} color="#F59E0B" /></div>
                            <div>
                                <div style={{ fontSize: "26px", fontWeight: 800, color: theme.textPrimary,
                                              lineHeight: 1 }}>{stats.versions}</div>
                                <div style={{ fontSize: "12px", color: theme.textMuted, marginTop: "4px" }}>
                                    Total Versions</div>
                                <div style={{ fontSize: "11px", color: theme.textMuted, marginTop: "2px" }}>
                                    All prompt versions</div>
                            </div>
                        </div>

                    </div>

                    {/* ── TABLE CARD ── */}
                    <div style={card}>

                        {/* Header row */}
                        <div style={{ display: "flex", justifyContent: "space-between",
                                      alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                            <h2 style={{ fontSize: "16px", fontWeight: 700, color: theme.textPrimary, margin: 0 }}>
                                Agents Overview
                            </h2>

                            {/* Search */}
                            <div style={{ position: "relative" }}>
                                <Search size={14} style={{ position: "absolute", left: "12px", top: "50%",
                                    transform: "translateY(-50%)", color: theme.textMuted }} />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search agents..."
                                    style={{
                                        paddingLeft: "36px", paddingRight: "16px", paddingTop: "8px",
                                        paddingBottom: "8px", borderRadius: "10px",
                                        border: `1px solid ${theme.cardBorder}`,
                                        background: theme.cardBg, color: theme.textPrimary,
                                        fontSize: "13px", outline: "none", width: "220px"
                                    }}
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ background: theme.isDark ? "rgba(255,255,255,0.03)" : "#FAFAFA" }}>
                                        <th style={th}>Agent Name</th>
                                        <th style={th}>Description</th>
                                        <th style={th}>Status</th>
                                        <th style={th}>Last Updated</th>
                                        <th style={th}>Capabilities</th>
                                        <th style={th}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ ...td, textAlign: "center",
                                                color: theme.textMuted, padding: "48px" }}>
                                                No agents found.
                                            </td>
                                        </tr>
                                    ) : filtered.map(agent => {
                                        const caps = getCapabilities(agent.agent_name || agent.display_name);
                                        return (
                                            <tr key={agent.agent_id}
                                                style={{ transition: "background 0.15s" }}
                                                onMouseEnter={e => e.currentTarget.style.background =
                                                    theme.isDark ? "rgba(255,255,255,0.03)" : "#F9F9FF"}
                                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                                                {/* Agent Name */}
                                                <td style={td}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                        <div style={{
                                                            width: "32px", height: "32px", borderRadius: "8px",
                                                            background: "linear-gradient(135deg,#7C5AF6,#6366F1)",
                                                            display: "flex", alignItems: "center",
                                                            justifyContent: "center", flexShrink: 0
                                                        }}>
                                                            <BrainCircuit size={15} color="#fff" />
                                                        </div>
                                                        <span style={{ fontWeight: 600, fontSize: "13px",
                                                                       color: theme.textPrimary }}>
                                                            {agent.display_name}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Description */}
                                                <td style={{ ...td, color: theme.textMuted, maxWidth: "260px" }}>
                                                    <span style={{ display: "-webkit-box",
                                                        WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                                                        overflow: "hidden" }}>
                                                        {agent.description}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td style={td}>
                                                    <span style={{
                                                        display: "inline-flex", alignItems: "center", gap: "5px",
                                                        padding: "4px 10px", borderRadius: "20px", fontSize: "11px",
                                                        fontWeight: 700,
                                                        background: agent.status ? "#10B98118" : "#EF444418",
                                                        color: agent.status ? "#10B981" : "#EF4444",
                                                    }}>
                                                        <span style={{
                                                            width: "6px", height: "6px", borderRadius: "50%",
                                                            background: agent.status ? "#10B981" : "#EF4444"
                                                        }} />
                                                        {agent.status ? "Active" : "Inactive"}
                                                    </span>
                                                </td>

                                                {/* Updated */}
                                                <td style={{ ...td, color: theme.textMuted, fontSize: "12px",
                                                             whiteSpace: "nowrap" }}>
                                                    {formatDate(agent.updated_at)}
                                                </td>

                                                {/* Capabilities */}
                                                <td style={td}>
                                                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                                        {caps.map(c => (
                                                            <span key={c.label} style={{
                                                                padding: "3px 8px", borderRadius: "6px",
                                                                fontSize: "10px", fontWeight: 700,
                                                                background: c.color + "18", color: c.color
                                                            }}>
                                                                {c.label}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td style={td}>
                                                    <div style={{ display: "flex", gap: "8px" }}>
                                                        <button
                                                            onClick={() => navigate(`/admin/ai-agents/${agent.agent_id}`)}
                                                            style={{
                                                                display: "flex", alignItems: "center", gap: "5px",
                                                                padding: "6px 12px", borderRadius: "8px",
                                                                background: "#7C5AF618",
                                                                color: "#7C5AF6", border: "none",
                                                                cursor: "pointer", fontSize: "12px", fontWeight: 600
                                                            }}>
                                                            <Settings size={12} /> Configure
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/admin/ai-agents/test?agent=${agent.agent_id}`)}
                                                            style={{
                                                                display: "flex", alignItems: "center", gap: "5px",
                                                                padding: "6px 12px", borderRadius: "8px",
                                                                background: theme.isDark ? "rgba(255,255,255,0.06)" : "#F3F4F6",
                                                                color: theme.textMuted, border: "none",
                                                                cursor: "pointer", fontSize: "12px", fontWeight: 600
                                                            }}>
                                                            <Eye size={12} /> Test
                                                        </button>
                                                    </div>
                                                </td>

                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AIAgentsPage;