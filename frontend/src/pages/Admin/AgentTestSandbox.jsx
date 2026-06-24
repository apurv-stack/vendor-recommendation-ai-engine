import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout/DashboardLayout";
import { useTheme } from "../../context/ThemeContext";
import {
    ArrowLeft, Play, Copy, Download,
    CheckCircle2, AlertCircle, Clock, Cpu, Hash
} from "lucide-react";
import { getAllAgents, getVersionHistory, testAgent, testAgentWorkflow } from "../../services/agentService";

const AgentTestSandbox = () => {
    const theme    = useTheme();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [agents,       setAgents]       = useState([]);
    const [versions,     setVersions]     = useState([]);
    const [selectedAgent,setSelectedAgent]= useState(searchParams.get("agent") || "");
    const [selectedVer,  setSelectedVer]  = useState("latest");
    const [query,        setQuery]        = useState("");
    const [context,      setContext]      = useState("");
    const [response,     setResponse]     = useState(null);
    const [running,      setRunning]      = useState(false);
    const [copied,       setCopied]       = useState(false);
    const [toast,        setToast]        = useState(null);
    const [testMode,     setTestMode]     = useState("prompt"); // "prompt" | "workflow"
    const [workflowResult, setWorkflowResult] = useState(null);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        getAllAgents().then(r => {
            const list = r?.agents || [];
            setAgents(list);
            if (!selectedAgent && list.length > 0) {
                setSelectedAgent(list[0].agent_id);
            }
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (!selectedAgent) return;
        getVersionHistory(selectedAgent)
            .then(r => setVersions(r?.versions || []))
            .catch(() => {});
    }, [selectedAgent]);

    const handleRun = async () => {
        if (!selectedAgent) { showToast("Please select an agent", "error"); return; }
        if (!query.trim())  { showToast("Please enter a test query", "error"); return; }
        if (agents.length === 0) { showToast("Agents still loading, please wait", "error"); return; }
        const agentExists = agents.find(a => a.agent_id === selectedAgent);
        if (!agentExists) { showToast("Selected agent not found, please reselect", "error"); return; }
        setRunning(true);
        try {
            setResponse(null);
            setWorkflowResult(null);
            const start = Date.now();

            if (testMode === "workflow") {
                const res = await testAgentWorkflow(query);
                setWorkflowResult({ ...res, latency: Date.now() - start });
                return;
            }

            const res = await testAgent(selectedAgent, query, context);
            const elapsed = ((Date.now() - start) / 1000).toFixed(2);
            setResponse({ ...res, elapsed });
        } catch {
            showToast("Test failed", "error");
        } finally {
            setRunning(false);
        }
    };

    const handleCopy = () => {
        if (!response?.response) return;
        navigator.clipboard.writeText(response.response);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!response?.response) return;
        const blob = new Blob([response.response], { type: "text/plain" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href     = url;
        a.download = "agent_response.txt";
        a.click();
        URL.revokeObjectURL(url);
    };

    const selectStyle = {
        width: "100%", padding: "9px 12px", borderRadius: "10px",
        border: `1px solid ${theme.cardBorder}`,
        background: theme.isDark ? "#0d0d1a" : "#F9FAFB",
        color: theme.textPrimary, fontSize: "13px", outline: "none",
        cursor: "pointer"
    };

    const card = {
        background: theme.cardBg, border: `1px solid ${theme.cardBorder}`,
        borderRadius: "16px", padding: "24px"
    };

    const textarea = {
        width: "100%", borderRadius: "10px", padding: "12px",
        border: `1px solid ${theme.cardBorder}`,
        background: theme.isDark ? "#0d0d1a" : "#F9FAFB",
        color: theme.textPrimary, fontSize: "13px", lineHeight: 1.6,
        resize: "vertical", outline: "none", fontFamily: "inherit",
        boxSizing: "border-box"
    };

    return (
        <DashboardLayout>
            <div style={{ minHeight: "100vh", background: theme.pageBg, padding: "24px" }}>

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

                <div style={{ maxWidth: "1400px", margin: "0 auto",
                              display: "flex", flexDirection: "column", gap: "20px" }}>

                    {/* ── HEADER ── */}
                    <div style={{
                        ...card,
                        background: theme.isDark
                            ? "linear-gradient(135deg,#13132a 0%,#1a1040 100%)"
                            : "linear-gradient(135deg,#f5f3ff 0%,#ede9fe 100%)",
                        display: "flex", justifyContent: "space-between",
                        alignItems: "center", flexWrap: "wrap", gap: "16px"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                            <button onClick={() => navigate("/admin/ai-agents")} style={{
                                display: "flex", alignItems: "center", gap: "6px",
                                padding: "8px 14px", borderRadius: "10px",
                                border: `1px solid ${theme.cardBorder}`,
                                background: theme.cardBg, color: theme.textMuted,
                                cursor: "pointer", fontSize: "12px", fontWeight: 600
                            }}>
                                <ArrowLeft size={13} /> Back
                            </button>
                            <div>
                                <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "3px",
                                            textTransform: "uppercase", color: "#7C5AF6", marginBottom: "4px" }}>
                                    AI AGENTS › TEST SANDBOX
                                </p>
                                <h1 style={{ fontSize: "20px", fontWeight: 800,
                                             color: theme.textPrimary, margin: 0 }}>
                                    Agent Testing Sandbox
                                </h1>
                                <p style={{ fontSize: "12px", color: theme.textMuted,
                                            marginTop: "4px", marginBottom: 0 }}>
                                    Test your agents with sample queries before publishing changes
                                </p>
                            </div>
                        </div>

                        {/* Mode Toggle Row */}
                        <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                            {[
                                { id: "prompt",   label: "🧪 Prompt Test",   sub: "Tests prompt in isolation" },
                                { id: "workflow", label: "⚡ Full Workflow",  sub: "Runs real agent pipeline" }
                            ].map(m => (
                                <button key={m.id} onClick={() => setTestMode(m.id)} style={{
                                    padding: "10px 20px", borderRadius: "10px", cursor: "pointer",
                                    border: `2px solid ${testMode === m.id ? "#7C5AF6" : theme.cardBorder}`,
                                    background: testMode === m.id
                                        ? (theme.isDark ? "#7C5AF615" : "#F3F0FF")
                                        : (theme.isDark ? "#13131f" : "#F9FAFB"),
                                    textAlign: "left", transition: "all 0.2s"
                                }}>
                                    <div style={{ fontSize: "12px", fontWeight: 700,
                                        color: testMode === m.id ? "#7C5AF6" : theme.textPrimary }}>
                                        {m.label}
                                    </div>
                                    <div style={{ fontSize: "10px", color: theme.textMuted, marginTop: "2px" }}>
                                        {m.sub}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Agent + Version selectors + Run — only show in prompt mode */}
                        {testMode === "prompt" && (
                            <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
                                <div>
                                    <label style={{ fontSize: "10px", fontWeight: 700, color: theme.textMuted,
                                                   textTransform: "uppercase", letterSpacing: "0.08em",
                                                   display: "block", marginBottom: "4px" }}>
                                        Select Agent
                                    </label>
                                    <select value={selectedAgent}
                                        onChange={e => setSelectedAgent(e.target.value)}
                                        style={{ ...selectStyle, width: "200px" }}>
                                        <option value="">Choose agent...</option>
                                        {agents.map(a => (
                                            <option key={a.agent_id} value={a.agent_id}>
                                                {a.display_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ fontSize: "10px", fontWeight: 700, color: theme.textMuted,
                                                   textTransform: "uppercase", letterSpacing: "0.08em",
                                                   display: "block", marginBottom: "4px" }}>
                                        Select Version
                                    </label>
                                    <select value={selectedVer}
                                        onChange={e => setSelectedVer(e.target.value)}
                                        style={{ ...selectStyle, width: "180px" }}>
                                        <option value="latest">Latest</option>
                                        {versions.map(v => (
                                            <option key={v.version_id} value={v.version_id}>
                                                v{v.version_number} — {new Date(v.created_at).toLocaleDateString()}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button onClick={handleRun} disabled={running} style={{
                                    display: "flex", alignItems: "center", gap: "8px",
                                    padding: "10px 22px", borderRadius: "12px", border: "none",
                                    background: "linear-gradient(135deg,#7C5AF6,#6366F1)",
                                    color: "#fff", cursor: running ? "not-allowed" : "pointer",
                                    fontSize: "13px", fontWeight: 700,
                                    opacity: running ? 0.7 : 1
                                }}>
                                    <Play size={14} />
                                    {running ? "Running..." : "Run Test"}
                                </button>
                            </div>
                        )}

                        {/* Workflow mode — just show run button, no agent selector needed */}
                        {testMode === "workflow" && (
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ fontSize: "12px", color: theme.textMuted }}>
                                    Runs the full agent pipeline with your query — no agent selection needed.
                                </div>
                                <button onClick={handleRun} disabled={running} style={{
                                    display: "flex", alignItems: "center", gap: "8px",
                                    padding: "10px 22px", borderRadius: "12px", border: "none",
                                    background: "linear-gradient(135deg,#10B981,#059669)",
                                    color: "#fff", cursor: running ? "not-allowed" : "pointer",
                                    fontSize: "13px", fontWeight: 700, flexShrink: 0,
                                    opacity: running ? 0.7 : 1
                                }}>
                                    <Play size={14} />
                                    {running ? "Running Pipeline..." : "Run Pipeline"}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ── SPLIT PANEL ── */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

                        {/* LEFT — Input */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                            <div style={card}>
                                <h3 style={{ fontSize: "14px", fontWeight: 700,
                                             color: theme.textPrimary, marginBottom: "4px" }}>
                                    Test Query
                                </h3>
                                <p style={{ fontSize: "12px", color: theme.textMuted, marginBottom: "12px" }}>
                                    Enter a sample query to test the agent response
                                </p>
                                <textarea
                                    rows={8}
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder="e.g. Find best catering services in Delhi for wedding with 500 guests"
                                    style={textarea}
                                />
                                <div style={{ textAlign: "right", marginTop: "6px",
                                              fontSize: "11px", color: theme.textMuted }}>
                                    {query.length}/2000 characters
                                </div>
                            </div>

                            <div style={card}>
                                <h3 style={{ fontSize: "14px", fontWeight: 700,
                                             color: theme.textPrimary, marginBottom: "4px" }}>
                                    Context (Optional)
                                </h3>
                                <p style={{ fontSize: "12px", color: theme.textMuted, marginBottom: "12px" }}>
                                    Add any additional context or parameters
                                </p>
                                <textarea
                                    rows={6}
                                    value={context}
                                    onChange={e => setContext(e.target.value)}
                                    placeholder={`{\n  "event_type": "wedding",\n  "guest_count": 500\n}`}
                                    style={{ ...textarea, fontFamily: "monospace" }}
                                />
                                <div style={{ textAlign: "right", marginTop: "6px",
                                              fontSize: "11px", color: theme.textMuted }}>
                                    {context.length}/2000 characters
                                </div>
                            </div>

                        </div>

                        {/* RIGHT — Response */}
                        <div style={card}>
                            <div style={{ display: "flex", justifyContent: "space-between",
                                          alignItems: "center", marginBottom: "4px" }}>
                                <h3 style={{ fontSize: "14px", fontWeight: 700,
                                             color: theme.textPrimary, margin: 0 }}>
                                    Agent Response
                                </h3>
                            </div>
                            <p style={{ fontSize: "12px", color: theme.textMuted, marginBottom: "14px" }}>
                                Response generated by the agent
                            </p>

                            {/* Workflow Result */}
                            {workflowResult && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

                                    {/* Intent + Filters */}
                                    <div style={{ padding: "14px", borderRadius: "10px",
                                        background: theme?.isDark ? "#0d0d1a" : "#F9FAFB",
                                        border: "1px solid rgba(124,90,246,0.12)" }}>
                                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#7C5AF6",
                                            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
                                            Query Analysis
                                        </div>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                            <span style={{ padding: "4px 10px", borderRadius: "20px",
                                                background: "#7C5AF618", color: "#7C5AF6",
                                                fontSize: "11px", fontWeight: 600 }}>
                                                Intent: {workflowResult.intent || "—"}
                                            </span>
                                            {Object.entries(workflowResult.filters || {}).map(([k, v]) => v && (
                                                <span key={k} style={{ padding: "4px 10px", borderRadius: "20px",
                                                    background: "#10B98118", color: "#10B981",
                                                    fontSize: "11px", fontWeight: 600 }}>
                                                    {k}: {String(v)}
                                                </span>
                                            ))}
                                        </div>
                                        {workflowResult.current_question && (
                                            <div style={{ marginTop: "10px", padding: "8px 12px", borderRadius: "8px",
                                                background: "#F59E0B18", color: "#F59E0B",
                                                fontSize: "12px", fontWeight: 600 }}>
                                                💬 Follow-up: {workflowResult.current_question}
                                            </div>
                                        )}
                                    </div>

                                    {/* AI Response */}
                                    {workflowResult.ai_response && (
                                        <div style={{ padding: "14px", borderRadius: "10px",
                                            background: theme?.isDark ? "#0d0d1a" : "#F9FAFB",
                                            border: "1px solid rgba(124,90,246,0.12)" }}>
                                            <div style={{ fontSize: "11px", fontWeight: 700, color: "#3B82F6",
                                                textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                                                AI Response
                                            </div>
                                            <div style={{ fontSize: "13px", color: theme?.textPrimary, lineHeight: 1.7 }}>
                                                {workflowResult.ai_response}
                                            </div>
                                        </div>
                                    )}

                                    {/* Vendors */}
                                    {workflowResult.vendors?.length > 0 && (
                                        <div style={{ padding: "14px", borderRadius: "10px",
                                            background: theme?.isDark ? "#0d0d1a" : "#F9FAFB",
                                            border: "1px solid rgba(124,90,246,0.12)" }}>
                                            <div style={{ fontSize: "11px", fontWeight: 700, color: "#10B981",
                                                textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
                                                Vendors Found ({workflowResult.vendor_count})
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                {workflowResult.vendors.map((v, i) => (
                                                    <div key={i} style={{ padding: "10px 12px", borderRadius: "8px",
                                                        background: theme?.isDark ? "#13131f" : "#fff",
                                                        border: "1px solid rgba(124,90,246,0.1)",
                                                        display: "flex", justifyContent: "space-between",
                                                        alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                                                        <div>
                                                            <div style={{ fontSize: "13px", fontWeight: 700,
                                                                color: theme?.textPrimary }}>{v.name}</div>
                                                            <div style={{ fontSize: "11px", color: theme?.textMuted, marginTop: "2px" }}>
                                                                {v.category} · {v.city}
                                                            </div>
                                                        </div>
                                                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                                            {v.rating && (
                                                                <span style={{ padding: "3px 8px", borderRadius: "20px",
                                                                    background: "#F59E0B18", color: "#F59E0B",
                                                                    fontSize: "11px", fontWeight: 600 }}>
                                                                    ★ {v.rating}
                                                                </span>
                                                            )}
                                                            {v.price_min && (
                                                                <span style={{ padding: "3px 8px", borderRadius: "20px",
                                                                    background: "#10B98118", color: "#10B981",
                                                                    fontSize: "11px", fontWeight: 600 }}>
                                                                    ₹{Number(v.price_min).toLocaleString()}
                                                                    {v.price_max ? `–₹${Number(v.price_max).toLocaleString()}` : ""}
                                                                </span>
                                                            )}
                                                            {v.is_available === true && (
                                                                <span style={{ padding: "3px 8px", borderRadius: "20px",
                                                                    background: "#10B98118", color: "#10B981",
                                                                    fontSize: "11px", fontWeight: 600 }}>Available</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Workflow Trace */}
                                    <div style={{ padding: "14px", borderRadius: "10px",
                                        background: theme?.isDark ? "#0d0d1a" : "#F9FAFB",
                                        border: "1px solid rgba(124,90,246,0.12)" }}>
                                        <div style={{ fontSize: "11px", fontWeight: 700, color: theme?.textMuted,
                                            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                                            Agent Pipeline · {workflowResult.latency}ms
                                        </div>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                            {(workflowResult.workflow_trace || []).map((t, i) => (
                                                <span key={i} style={{
                                                    padding: "3px 10px", borderRadius: "20px", fontSize: "11px",
                                                    fontWeight: 600,
                                                    background: t.status === "success" ? "#10B98118"
                                                        : t.status === "skipped" ? "#F59E0B18" : "#EF444418",
                                                    color: t.status === "success" ? "#10B981"
                                                        : t.status === "skipped" ? "#F59E0B" : "#EF4444"
                                                }}>
                                                    {t.agent?.replace(/_agent$/, "").replace(/_/g, " ")}
                                                    {t.status === "skipped" ? " (skipped)" : ""}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            )}

                            {/* Status bar */}
                            {response && (
                                <div style={{
                                    display: "flex", alignItems: "center", gap: "16px",
                                    padding: "10px 14px", borderRadius: "10px", marginBottom: "14px",
                                    background: "#10B98118",
                                    flexWrap: "wrap", gap: "12px"
                                }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "5px",
                                                   color: "#10B981", fontSize: "12px", fontWeight: 600 }}>
                                        <CheckCircle2 size={13} /> Test completed successfully
                                    </span>
                                    <span style={{ display: "flex", alignItems: "center", gap: "5px",
                                                   color: theme.textMuted, fontSize: "11px" }}>
                                        <Clock size={11} /> {response.elapsed}s
                                    </span>
                                    {response.model && (
                                        <span style={{ display: "flex", alignItems: "center", gap: "5px",
                                                       color: theme.textMuted, fontSize: "11px" }}>
                                            <Cpu size={11} /> {response.model}
                                        </span>
                                    )}
                                    {response.version && (
                                        <span style={{ display: "flex", alignItems: "center", gap: "5px",
                                                       color: theme.textMuted, fontSize: "11px" }}>
                                            <Hash size={11} /> v{response.version}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Response body */}
                            <div style={{
                                minHeight: "320px", borderRadius: "10px", padding: "16px",
                                border: `1px solid ${theme.cardBorder}`,
                                background: theme.isDark ? "#0d0d1a" : "#F9FAFB",
                                fontSize: "13px", color: theme.textPrimary, lineHeight: 1.7,
                                whiteSpace: "pre-wrap", overflowY: "auto", maxHeight: "460px"
                            }}>
                                {running && (
                                    <div style={{ color: theme.textMuted, fontStyle: "italic" }}>
                                        Running test...
                                    </div>
                                )}
                                {!running && !response && (
                                    <div style={{ color: theme.textMuted, fontStyle: "italic" }}>
                                        Run a test to see the agent response here.
                                    </div>
                                )}
                                {!running && response?.response}
                            </div>

                            {/* Footer buttons */}
                            {response && (
                                <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                                    <button onClick={handleCopy} style={{
                                        flex: 1, display: "flex", alignItems: "center",
                                        justifyContent: "center", gap: "7px",
                                        padding: "10px", borderRadius: "10px",
                                        border: `1px solid ${theme.cardBorder}`,
                                        background: theme.isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6",
                                        color: theme.textPrimary, cursor: "pointer",
                                        fontSize: "12px", fontWeight: 600
                                    }}>
                                        <Copy size={13} />
                                        {copied ? "Copied!" : "Copy Response"}
                                    </button>
                                    <button onClick={handleDownload} style={{
                                        flex: 1, display: "flex", alignItems: "center",
                                        justifyContent: "center", gap: "7px",
                                        padding: "10px", borderRadius: "10px",
                                        border: `1px solid ${theme.cardBorder}`,
                                        background: theme.isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6",
                                        color: theme.textPrimary, cursor: "pointer",
                                        fontSize: "12px", fontWeight: 600
                                    }}>
                                        <Download size={13} /> Download
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AgentTestSandbox;