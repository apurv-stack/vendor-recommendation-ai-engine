import { useState, useEffect } from "react";
import ConfirmModal from "../../components/common/ConfirmModal";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout/DashboardLayout";
import { useTheme } from "../../context/ThemeContext";
import {
    ArrowLeft, BrainCircuit, Save, FlaskConical,
    PowerOff, Power, RotateCcw, Clock, FileText,
    Settings2, ClipboardList, CheckCircle2, AlertCircle
} from "lucide-react";
import {
    getAgentById, getAgentPrompt, updateAgentPrompt,
    getAgentConfiguration, updateAgentConfiguration,
    getVersionHistory, rollbackPrompt, getAuditLogs,
    toggleAgentStatus
} from "../../services/agentService";

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true
    });
};

const TABS = [
    { key: "prompt",  label: "Prompt Configuration", icon: FileText },
    { key: "config",  label: "Agent Configuration",  icon: Settings2 },
    { key: "history", label: "Version History",       icon: Clock },
    { key: "audit",   label: "Audit Logs",            icon: ClipboardList },
];


// ─── Agent Config Form ────────────────────────────────────────────────────────

const Toggle = ({ value, onChange, theme }) => (
    <div
        onClick={() => onChange(!value)}
        style={{
            width: "44px", height: "24px", borderRadius: "12px", cursor: "pointer",
            background: value ? "#7C5AF6" : (theme.isDark ? "#2a2a3a" : "#e5e7eb"),
            position: "relative", transition: "background 0.2s", flexShrink: 0
        }}
    >
        <div style={{
            position: "absolute", top: "3px",
            left: value ? "23px" : "3px",
            width: "18px", height: "18px", borderRadius: "50%",
            background: "#fff", transition: "left 0.2s",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)"
        }} />
    </div>
);

const FieldRow = ({ label, sub, children }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: "16px", padding: "14px 0",
                  borderBottom: "1px solid rgba(124,90,246,0.08)" }}>
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "inherit" }}>{label}</div>
            {sub && <div style={{ fontSize: "11px", color: "inherit", opacity: 0.6, marginTop: "2px" }}>{sub}</div>}
        </div>
        <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
);

const SliderField = ({ label, sub, value, onChange, theme }) => {
    const num = Number(value) || 0;
    return (
        <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(124,90,246,0.08)" }}>
            <style>{`
                .agent-slider { -webkit-appearance: none; appearance: none; width: 100%;
                    height: 6px; border-radius: 3px; outline: none; cursor: pointer; border: none; }
                .agent-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none;
                    width: 18px; height: 18px; border-radius: 50%; background: #7C5AF6;
                    box-shadow: 0 0 0 3px #7C5AF630; cursor: pointer; margin-top: -6px; }
                .agent-slider::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%;
                    background: #7C5AF6; border: none; cursor: pointer; }
                .agent-slider::-webkit-slider-runnable-track { height: 6px; border-radius: 3px; overflow: visible; }
                .agent-slider::-moz-range-track { height: 6px; border-radius: 3px; }
            `}</style>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: theme.textPrimary }}>{label}</div>
                    {sub && <div style={{ fontSize: "11px", color: theme.textMuted, marginTop: "2px" }}>{sub}</div>}
                </div>
                <span style={{
                    padding: "2px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 700,
                    background: "#7C5AF618", color: "#7C5AF6", alignSelf: "flex-start"
                }}>{num}%</span>
            </div>
            <input
                type="range" min={0} max={100} value={num}
                onChange={e => onChange(Number(e.target.value))}
                className="agent-slider"
                style={{
                    background: `linear-gradient(to right, #7C5AF6 ${num}%, ${theme.isDark ? "#2a2a3a" : "#e5e7eb"} ${num}%)`,
                    height: "6px",
                    marginTop: "8px",
                    marginBottom: "4px"
                }}
            />
            <div style={{ display: "flex", justifyContent: "space-between",
                          fontSize: "10px", color: theme.textMuted, marginTop: "6px" }}>
                <span>0%</span><span>50%</span><span>100%</span>
            </div>
        </div>
    );
};

const NumberField = ({ label, sub, value, onChange, theme, min = 1, max = 100 }) => (
    <FieldRow label={label} sub={sub}>
        <input
            type="number" min={min} max={max} value={value || ""}
            onChange={e => onChange(Number(e.target.value))}
            style={{
                width: "80px", padding: "7px 10px", borderRadius: "8px", textAlign: "center",
                border: `1px solid rgba(124,90,246,0.25)`, background: theme.isDark ? "#0d0d1a" : "#F9FAFB",
                color: theme.textPrimary, fontSize: "13px", fontWeight: 600, outline: "none"
            }}
        />
    </FieldRow>
);

const KNOWN_VALUES = {
    valid_cities:      ["delhi", "mumbai", "bangalore", "hyderabad", "chennai", "kolkata",
                        "pune", "ahmedabad", "jaipur", "surat", "gurgaon", "noida",
                        "lucknow", "chandigarh", "indore"],
    valid_categories:  ["catering", "photography", "decoration", "venue", "music",
                        "makeup", "planner", "bartender", "florist", "transportation"],
    extra_cuisines:    ["north indian", "south indian", "chinese", "continental",
                        "mughlai", "italian", "mexican", "thai", "street food", "vegan"],
    extra_events:      ["wedding", "birthday", "corporate", "anniversary", "engagement",
                        "baby shower", "graduation", "festival", "conference", "reception"],
};

const TagInput = ({ label, sub, values, onChange, theme, placeholder, fieldKey }) => {
    const [input, setInput] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const suggestions = (KNOWN_VALUES[fieldKey] || []).filter(
        s => !values.includes(s) && (input === "" || s.includes(input.toLowerCase()))
    );

    const add = (val) => {
        const v = (val || input).trim().toLowerCase();
        if (v && !values.includes(v)) onChange([...values, v]);
        setInput("");
        setShowDropdown(false);
    };

    return (
        <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(124,90,246,0.08)" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: theme.textPrimary }}>{label}</div>
            {sub && <div style={{ fontSize: "11px", color: theme.textMuted, marginTop: "2px", marginBottom: "10px" }}>{sub}</div>}
            <div style={{ position: "relative", display: "flex", gap: "6px", marginBottom: "8px" }}>
                <input
                    value={input}
                    onChange={e => { setInput(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
                    placeholder={placeholder || "Type or select from dropdown"}
                    style={{
                        flex: 1, padding: "7px 10px", borderRadius: "8px",
                        border: `1px solid rgba(124,90,246,0.25)`,
                        background: theme.isDark ? "#0d0d1a" : "#F9FAFB",
                        color: theme.textPrimary, fontSize: "13px", outline: "none"
                    }}
                />
                <button onClick={() => add()} style={{
                    padding: "7px 14px", borderRadius: "8px", border: "none",
                    background: "#7C5AF618", color: "#7C5AF6",
                    fontSize: "12px", fontWeight: 600, cursor: "pointer"
                }}>Add</button>
                {showDropdown && suggestions.length > 0 && (
                    <div style={{
                        position: "absolute", top: "100%", left: 0, right: "60px",
                        zIndex: 100, borderRadius: "10px", overflow: "hidden",
                        border: `1px solid rgba(124,90,246,0.2)`,
                        background: theme.isDark ? "#1a1a2e" : "#fff",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                        maxHeight: "200px", overflowY: "auto"
                    }}>
                        {suggestions.map(s => (
                            <div key={s}
                                onMouseDown={() => add(s)}
                                style={{
                                    padding: "9px 14px", fontSize: "13px", cursor: "pointer",
                                    color: theme.textPrimary,
                                    borderBottom: `1px solid rgba(124,90,246,0.06)`,
                                    transition: "background 0.15s"
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "#7C5AF615"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >{s}</div>
                        ))}
                    </div>
                )}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {values.map(v => (
                    <span key={v} style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        padding: "4px 10px", borderRadius: "20px",
                        background: "#7C5AF618", color: "#7C5AF6",
                        fontSize: "11px", fontWeight: 600
                    }}>
                        {v}
                        <span onClick={() => onChange(values.filter(x => x !== v))}
                            style={{ cursor: "pointer", opacity: 0.7, fontWeight: 800 }}>×</span>
                    </span>
                ))}
                {values.length === 0 && (
                    <span style={{ fontSize: "12px", color: theme.textMuted }}>None added yet</span>
                )}
            </div>
        </div>
    );
};
const KeyValueInput = ({ label, sub, values, onChange, theme, keyPlaceholder, valuePlaceholder }) => {
    const [kInput, setKInput] = useState("");
    const [vInput, setVInput] = useState("");
    const entries = Object.entries(values || {});
    const add = () => {
        const k = kInput.trim().toLowerCase();
        const v = vInput.trim();
        if (k && v) { onChange({ ...values, [k]: v }); setKInput(""); setVInput(""); }
    };
    return (
        <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(124,90,246,0.08)" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: theme.textPrimary }}>{label}</div>
            {sub && <div style={{ fontSize: "11px", color: theme.textMuted, marginTop: "2px", marginBottom: "10px" }}>{sub}</div>}
            <div style={{ display: "flex", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
                <input value={kInput} onChange={e => setKInput(e.target.value)}
                    placeholder={keyPlaceholder || "Key"}
                    style={{
                        flex: 1, minWidth: "100px", padding: "7px 10px", borderRadius: "8px",
                        border: `1px solid rgba(124,90,246,0.25)`,
                        background: theme.isDark ? "#0d0d1a" : "#F9FAFB",
                        color: theme.textPrimary, fontSize: "13px", outline: "none"
                    }}
                />
                <input value={vInput} onChange={e => setVInput(e.target.value)}
                    placeholder={valuePlaceholder || "Value"}
                    style={{
                        flex: 2, minWidth: "140px", padding: "7px 10px", borderRadius: "8px",
                        border: `1px solid rgba(124,90,246,0.25)`,
                        background: theme.isDark ? "#0d0d1a" : "#F9FAFB",
                        color: theme.textPrimary, fontSize: "13px", outline: "none"
                    }}
                />
                <button onClick={add} style={{
                    padding: "7px 14px", borderRadius: "8px", border: "none",
                    background: "#7C5AF618", color: "#7C5AF6",
                    fontSize: "12px", fontWeight: 600, cursor: "pointer"
                }}>Add</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {entries.map(([k, v]) => (
                    <div key={k} style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "8px 10px", borderRadius: "8px",
                        background: theme.isDark ? "#0d0d1a" : "#F9FAFB",
                        border: `1px solid rgba(124,90,246,0.12)`
                    }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#7C5AF6", minWidth: "80px" }}>{k}</span>
                        <span style={{ fontSize: "11px", color: theme.textMuted, flex: 1 }}>→</span>
                        <span style={{ fontSize: "12px", color: theme.textPrimary, flex: 3 }}>{v}</span>
                        <span onClick={() => { const n = { ...values }; delete n[k]; onChange(n); }}
                            style={{ cursor: "pointer", color: "#EF4444", fontSize: "14px", fontWeight: 800 }}>×</span>
                    </div>
                ))}
                {entries.length === 0 && (
                    <span style={{ fontSize: "12px", color: theme.textMuted }}>None added yet</span>
                )}
            </div>
        </div>
    );
};

const SectionHeader = ({ title, theme }) => (
    <div style={{
        padding: "10px 14px", borderRadius: "8px", marginBottom: "4px", marginTop: "8px",
        background: "linear-gradient(135deg,#7C5AF608,#6366F108)",
        borderLeft: "3px solid #7C5AF6"
    }}>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#7C5AF6",
                       textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</span>
    </div>
);

const AgentConfigForm = ({ agentName, configJson, setConfigJson, theme, card }) => {
    const [cfg, setCfg] = useState(() => {
        try { return JSON.parse(configJson); } catch { return {}; }
    });

    useEffect(() => {
        try { setCfg(JSON.parse(configJson)); } catch {}
    }, [configJson]);

    const update = (key, value) => {
        const next = { ...cfg, [key]: value };
        setCfg(next);
        setConfigJson(JSON.stringify(next, null, 2));
    };

    const agentKey = (agentName || "").toLowerCase().replace(/ /g, "_");

    // ── Prompt-only agents ────────────────────────────────────────────────
    const promptOnlyAgents = [
        "response_agent", "error_agent"
    ];
    if (promptOnlyAgents.includes(agentKey)) {
        return (
            <div style={card}>
                <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", padding: "48px 24px", gap: "14px", textAlign: "center"
                }}>
                    <div style={{
                        width: "56px", height: "56px", borderRadius: "16px",
                        background: "linear-gradient(135deg,#7C5AF618,#6366F118)",
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                        <BrainCircuit size={26} color="#7C5AF6" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: "15px", fontWeight: 700,
                                     color: theme.textPrimary, margin: 0 }}>
                            Prompt-Controlled Agent
                        </h3>
                        <p style={{ fontSize: "13px", color: theme.textMuted,
                                    marginTop: "6px", maxWidth: "340px", lineHeight: 1.6 }}>
                            This agent's behavior is fully controlled via Prompt Configuration.
                            Switch to the <strong style={{ color: "#7C5AF6" }}>Prompt Configuration</strong> tab
                            to adjust its instructions, tone, and business rules.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ── Ranking Agent ─────────────────────────────────────────────────────
    if (agentKey === "ranking_agent") {
        const CATEGORIES = ["photography", "catering", "venue", "decoration", "music", "makeup", "planner"];
        const [catOpen, setCatOpen] = useState(false);

        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={card}>
                    <SectionHeader title="Weight Configuration" theme={theme} />
                    <p style={{ fontSize: "12px", color: theme.textMuted, margin: "8px 0 4px" }}>
                        Weights determine how vendors are ranked. Total does not need to equal 100.
                    </p>
                    {[
                        { key: "rating_weight",       label: "Rating Weight",       sub: "How much vendor ratings affect ranking" },
                        { key: "review_weight",        label: "Review Weight",       sub: "How much review count affects ranking" },
                        { key: "budget_weight",        label: "Budget Weight",       sub: "How much budget match affects ranking" },
                        { key: "availability_weight",  label: "Availability Weight", sub: "How much vendor availability affects ranking" },
                    ].map(f => (
                        <SliderField key={f.key} label={f.label} sub={f.sub}
                            value={cfg[f.key] ?? 25} theme={theme}
                            onChange={v => update(f.key, v)} />
                    ))}
                    <FieldRow label="Availability Priority"
                        sub="When ON, available vendors always rank above unavailable ones regardless of score">
                        <Toggle value={!!cfg.availability_priority} theme={theme}
                            onChange={v => update("availability_priority", v)} />
                    </FieldRow>
                    <NumberField label="Max Results" sub="Maximum vendors returned after ranking"
                        value={cfg.max_results ?? 10} min={1} max={50} theme={theme}
                        onChange={v => update("max_results", v)} />
                </div>

                <div style={card}>
                    <div style={{ display: "flex", alignItems: "center",
                                  justifyContent: "space-between", marginBottom: "4px" }}>
                        <SectionHeader title="Per-Category Weight Overrides" theme={theme} />
                        <button onClick={() => setCatOpen(o => !o)} style={{
                            padding: "5px 12px", borderRadius: "8px", border: "none",
                            background: "#7C5AF618", color: "#7C5AF6",
                            fontSize: "11px", fontWeight: 600, cursor: "pointer"
                        }}>{catOpen ? "Collapse" : "Expand"}</button>
                    </div>
                    <p style={{ fontSize: "12px", color: theme.textMuted, margin: "0 0 8px" }}>
                        Override global weights for specific categories. Leave empty to use global weights.
                    </p>
                    {catOpen && CATEGORIES.map(cat => {
                        const overrideKey = `${cat}_weights`;
                        const overrides = cfg[overrideKey] || {};
                        return (
                            <div key={cat} style={{
                                marginBottom: "16px", padding: "14px",
                                borderRadius: "10px", border: `1px solid rgba(124,90,246,0.15)`,
                                background: theme.isDark ? "#0d0d1a" : "#FAFAFA"
                            }}>
                                <div style={{ fontSize: "13px", fontWeight: 700,
                                              color: theme.textPrimary, marginBottom: "10px",
                                              textTransform: "capitalize" }}>{cat}</div>
                                {["rating", "review", "budget", "availability"].map(w => (
                                    <SliderField key={w}
                                        label={`${w.charAt(0).toUpperCase() + w.slice(1)} Weight`}
                                        value={overrides[w] ?? (cfg[`${w}_weight`] ?? 25)}
                                        theme={theme}
                                        onChange={v => update(overrideKey, { ...overrides, [w]: v })}
                                    />
                                ))}
                            </div>
                        );
                    })}
                    {!catOpen && (
                        <p style={{ fontSize: "12px", color: theme.textMuted, padding: "8px 0" }}>
                            Click Expand to configure per-category overrides for{" "}
                            {CATEGORIES.join(", ")}.
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // ── Comparison Agent ──────────────────────────────────────────────────
    if (agentKey === "comparison_agent") {
        return (
            <div style={card}>
                <SectionHeader title="Comparison Display Settings" theme={theme} />
                <p style={{ fontSize: "12px", color: theme.textMuted, margin: "8px 0 4px" }}>
                    Control which fields are shown when comparing two vendors side by side.
                </p>
                {[
                    { key: "show_price",    label: "Show Price",    sub: "Display price range for each vendor" },
                    { key: "show_rating",   label: "Show Rating",   sub: "Display star rating and review count" },
                    { key: "show_reviews",  label: "Show Reviews",  sub: "Display review count separately" },
                    { key: "show_verified", label: "Show Verified", sub: "Show verified badge status" },
                    { key: "show_city",     label: "Show City",     sub: "Display vendor city/location" },
                ].map(f => (
                    <FieldRow key={f.key} label={f.label} sub={f.sub}>
                        <Toggle value={cfg[f.key] !== false} theme={theme}
                            onChange={v => update(f.key, v)} />
                    </FieldRow>
                ))}
            </div>
        );
    }

    // ── Discovery Agent ───────────────────────────────────────────────────
    if (agentKey === "discovery_agent") {
        return (
            <div style={card}>
                <SectionHeader title="Discovery Settings" theme={theme} />
                <p style={{ fontSize: "12px", color: theme.textMuted, margin: "8px 0 4px" }}>
                    Control how vendors are discovered and filtered.
                </p>
                <NumberField label="Max Results" sub="Maximum vendors fetched from database per query"
                    value={cfg.max_results ?? 20} min={1} max={100} theme={theme}
                    onChange={v => update("max_results", v)} />
                <FieldRow label="Allow Out of Budget"
                    sub="When ON, vendors slightly over budget are still shown">
                    <Toggle value={cfg.allow_out_of_budget !== false} theme={theme}
                        onChange={v => update("allow_out_of_budget", v)} />
                </FieldRow>
            </div>
        );
    }

    // ── Context Agent ─────────────────────────────────────────────────────
    if (agentKey === "context_agent") {
        return (
            <div style={card}>
                <SectionHeader title="Context Memory Settings" theme={theme} />
                <p style={{ fontSize: "12px", color: theme.textMuted, margin: "8px 0 4px" }}>
                    Control how much conversation history and vendor memory is retained.
                </p>
                <NumberField label="Max History" sub="Number of past messages to include in context"
                    value={cfg.max_history ?? 5} min={1} max={50} theme={theme}
                    onChange={v => update("max_history", v)} />
                <NumberField label="Max Vendor Memory" sub="Number of previously seen vendors to remember"
                    value={cfg.max_vendor_memory ?? 3} min={1} max={20} theme={theme}
                    onChange={v => update("max_vendor_memory", v)} />
                <NumberField label="Max Vendors in Context" sub="Maximum vendors included per context build"
                    value={cfg.max_vendors ?? 5} min={1} max={30} theme={theme}
                    onChange={v => update("max_vendors", v)} />
                <NumberField label="Max Categories in Context" sub="Maximum categories included per context build"
                    value={cfg.max_categories ?? 10} min={1} max={20} theme={theme}
                    onChange={v => update("max_categories", v)} />
            </div>
        );
    }

    // ── Query Analysis Agent ──────────────────────────────────────────────
    if (agentKey === "query_analysis_agent") {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                <div style={card}>
                    <SectionHeader title="City & Category Rules" theme={theme} />
                    <TagInput label="Valid Cities"
                        sub="Cities the system accepts. If empty, all cities from the default list are used."
                        values={cfg.valid_cities || []} theme={theme}
                        placeholder="e.g. mumbai"
                        fieldKey="valid_cities"
                        onChange={v => update("valid_cities", v)} />
                    <TagInput label="Valid Categories"
                        sub="Categories the system accepts. If empty, all default categories are used."
                        values={cfg.valid_categories || []} theme={theme}
                        placeholder="e.g. catering"
                        fieldKey="valid_categories"
                        onChange={v => update("valid_categories", v)} />
                </div>

                <div style={card}>
                    <SectionHeader title="City & Category Extensions" theme={theme} />
                    <KeyValueInput
                        label="Extra Cities (Aliases)"
                        sub="Map shorthand or alternate spellings to canonical city names"
                        values={cfg.extra_cities || {}} theme={theme}
                        keyPlaceholder="alias (e.g. ggn)"
                        valuePlaceholder="canonical (e.g. gurgaon)"
                        onChange={v => update("extra_cities", v)} />
                    <KeyValueInput
                        label="Extra Categories"
                        sub="Add new categories with comma-separated detection terms"
                        values={cfg.extra_categories || {}} theme={theme}
                        keyPlaceholder="category name"
                        valuePlaceholder="terms (e.g. bartender, bar service)"
                        onChange={v => update("extra_categories", v)} />
                    <TagInput label="Extra Cuisines"
                        sub="Additional cuisine types to detect in queries"
                        values={cfg.extra_cuisines || []} theme={theme}
                        placeholder="e.g. continental"
                        fieldKey="extra_cuisines"
                        onChange={v => update("extra_cuisines", v)} />
                    <TagInput label="Extra Events"
                        sub="Additional event types to detect in queries"
                        values={cfg.extra_events || []} theme={theme}
                        placeholder="e.g. anniversary"
                        fieldKey="extra_events"
                        onChange={v => update("extra_events", v)} />
                </div>

                <div style={card}>
                    <SectionHeader title="Custom Follow-up Questions" theme={theme} />
                    <p style={{ fontSize: "12px", color: theme.textMuted, margin: "8px 0 12px" }}>
                        Override the default follow-up questions for missing fields.
                    </p>
                    <KeyValueInput
                        label="Field → Question"
                        sub="Key = field name (e.g. budget, city, category). Value = question to ask user."
                        values={cfg.followup_questions || {}} theme={theme}
                        keyPlaceholder="field (e.g. budget)"
                        valuePlaceholder="question text"
                        onChange={v => update("followup_questions", v)} />
                </div>

                <div style={card}>
                    <SectionHeader title="Required Fields per Category" theme={theme} />
                    <p style={{ fontSize: "12px", color: theme.textMuted, margin: "8px 0 12px" }}>
                        Override which fields are required before a search is executed for each category.
                        Key = category name, Value = comma-separated required fields.
                    </p>
                    <KeyValueInput
                        label="Category → Required Fields"
                        values={
                            Object.fromEntries(
                                Object.entries(cfg.required_fields || {}).map(([k, v]) =>
                                    [k, Array.isArray(v) ? v.join(", ") : v]
                                )
                            )
                        }
                        theme={theme}
                        keyPlaceholder="category (e.g. catering)"
                        valuePlaceholder="fields (e.g. city, budget, guest_count)"
                        onChange={v => {
                            const parsed = Object.fromEntries(
                                Object.entries(v).map(([k, val]) =>
                                    [k, val.split(",").map(s => s.trim()).filter(Boolean)]
                                )
                            );
                            update("required_fields", parsed);
                        }} />
                </div>

            </div>
        );
    }

    // ── Supervisor Agent ──────────────────────────────────────────────────
    if (agentKey === "supervisor_agent") {
        return (
            <div style={card}>
                <SectionHeader title="Supervisor Settings" theme={theme} />
                <p style={{ fontSize: "12px", color: theme.textMuted, margin: "8px 0 16px" }}>
                    Controls how the supervisor routes ambiguous or unrecognised queries.
                </p>
                <FieldRow
                    label="Default Intent Fallback"
                    sub="Intent used when the system cannot classify a user query">
                    <input
                        value={cfg.default_intent || "generic_platform_query"}
                        onChange={e => update("default_intent", e.target.value)}
                        style={{
                            width: "220px", padding: "7px 10px", borderRadius: "8px",
                            border: `1px solid rgba(124,90,246,0.25)`,
                            background: theme.isDark ? "#0d0d1a" : "#F9FAFB",
                            color: theme.textPrimary, fontSize: "13px", outline: "none"
                        }}
                    />
                </FieldRow>
            </div>
        );
    }

    // ── Tool Calling Agent ────────────────────────────────────────────────
    if (agentKey === "tool_calling_agent") {
        return (
            <div style={card}>
                <SectionHeader title="Cache Settings" theme={theme} />
                <p style={{ fontSize: "12px", color: theme.textMuted, margin: "8px 0 16px" }}>
                    Controls how long tool call results are cached. Set to 0 to disable caching entirely.
                </p>
                <NumberField
                    label="Cache TTL (seconds)"
                    sub="How long vendor search results are cached. 0 = no cache, 300 = 5 minutes."
                    value={cfg.cache_ttl_seconds ?? 300}
                    min={0}
                    max={86400}
                    theme={theme}
                    onChange={v => update("cache_ttl_seconds", v)}
                />
            </div>
        );
    }

    // ── Fallback — unknown agent ──────────────────────────────────────────
    return (
        <div style={card}>
            <SectionHeader title="Agent Configuration" theme={theme} />
            <p style={{ fontSize: "13px", color: theme.textMuted, padding: "12px 0" }}>
                No configurable fields are defined for this agent.
                Use the Prompt Configuration tab to control its behavior.
            </p>
        </div>
    );
};
// ─── Component ───────────────────────────────────────────────────────────────

const AgentConfigPage = () => {
    const theme    = useTheme();
    const navigate = useNavigate();
    const { agentId } = useParams();

    const [activeTab, setActiveTab] = useState("prompt");
    const [agent,     setAgent]     = useState(null);
    const [prompt,    setPrompt]    = useState({
        base_prompt: "", role_instructions: "",
        behavior_guidelines: "", formatting_rules: "",
        business_rules: "", change_notes: ""
    });
    const [configJson,  setConfigJson]  = useState("{}");
    const [configError, setConfigError] = useState("");
    const [versions,    setVersions]    = useState([]);
    const [auditLogs,   setAuditLogs]   = useState([]);
    const [expandedLog, setExpandedLog] = useState(null);
    const [expandedVersion, setExpandedVersion] = useState(null);
    const [rollbackModal, setRollbackModal] = useState({ open: false, versionId: null, versionNum: null });
    const [rollbackLoading, setRollbackLoading] = useState(false);
    const [loading,     setLoading]     = useState(true);
    const [saving,      setSaving]      = useState(false);
    const [toast,       setToast]       = useState(null);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
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

    // ── Fetch ────────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!agentId) return;
        const load = async () => {
            try {
                setLoading(true);
                const [agentRes, promptRes, configRes, versionsRes, auditRes] = await Promise.allSettled([
                    getAgentById(agentId),
                    getAgentPrompt(agentId),
                    getAgentConfiguration(agentId),
                    getVersionHistory(agentId),
                    getAuditLogs(agentId),
                ]);
                if (agentRes.status   === "fulfilled") setAgent(agentRes.value?.agent || agentRes.value);
                if (promptRes.status  === "fulfilled") {
                    const p = promptRes.value?.prompt || {};
                    setPrompt({
                        base_prompt:          p.base_prompt          || "",
                        role_instructions:    p.role_instructions    || "",
                        behavior_guidelines:  p.behavior_guidelines  || "",
                        formatting_rules:     p.formatting_rules     || "",
                        business_rules:       p.business_rules       || "",
                        change_notes:         ""
                    });
                }
                if (configRes.status  === "fulfilled") {
                    const cfg = configRes.value?.configuration || configRes.value?.config || {};
                    setConfigJson(JSON.stringify(cfg, null, 2));
                }
                if (versionsRes.status === "fulfilled") setVersions(versionsRes.value?.versions || []);
                if (auditRes.status   === "fulfilled") setAuditLogs(auditRes.value?.logs || []);
            } catch {
                showToast("Failed to load agent data", "error");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [agentId]);

    // ── Actions ──────────────────────────────────────────────────────────────

    const handleSavePrompt = async () => {
        try {
            setSaving(true);
            await updateAgentPrompt(agentId, prompt);
            showToast("Prompt saved successfully");
            const res = await getVersionHistory(agentId);
            setVersions(res?.versions || []);
        } catch {
            showToast("Failed to save prompt", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveConfig = async () => {
        setSaving(true);
        try {
            let parsed;
            try {
                parsed = JSON.parse(configJson);
            } catch {
                showToast("Configuration format error — please try again", "error");
                setSaving(false);
                return;
            }
            await updateAgentConfiguration(agentId, { configuration: parsed });
            showToast("Configuration saved successfully");
            const res = await getAgentConfiguration(agentId);
            const cfg = res?.configuration || res?.config || {};
            setConfigJson(JSON.stringify(cfg, null, 2));
        } catch {
            showToast("Failed to save configuration", "error");
        } finally {
            setSaving(false);
        }
    };

    const openRollback = (versionId, versionNum) => {
        setRollbackModal({ open: true, versionId, versionNum });
    };

    const handleRollback = async () => {
        setRollbackLoading(true);
        try {
            await rollbackPrompt(agentId, rollbackModal.versionId);
            showToast("Rolled back successfully");
            const [pr, vr] = await Promise.all([getAgentPrompt(agentId), getVersionHistory(agentId)]);
            const p = pr?.prompt || {};
            setPrompt({ ...p, change_notes: "" });
            setVersions(vr?.versions || []);
        } catch {
            showToast("Rollback failed", "error");
        } finally {
            setRollbackLoading(false);
            setRollbackModal({ open: false, versionId: null, versionNum: null });
        }
    };

    const handleToggleStatus = async () => {
        try {
            const newStatus = !agent?.status;
            await toggleAgentStatus(agentId, newStatus);
            setAgent(prev => ({ ...prev, status: newStatus }));
            showToast(`Agent ${newStatus ? "activated" : "deactivated"}`);
        } catch {
            showToast("Failed to update status", "error");
        }
    };

    // ── Styles ───────────────────────────────────────────────────────────────

    const card = {
        background: theme.cardBg, border: `1px solid ${theme.cardBorder}`,
        borderRadius: "16px", padding: "24px"
    };

    const label = {
        display: "block", fontSize: "12px", fontWeight: 700,
        color: theme.textMuted, marginBottom: "6px", letterSpacing: "0.05em"
    };

    const textarea = {
        width: "100%", borderRadius: "10px", padding: "12px",
        border: `1px solid ${theme.cardBorder}`, background: theme.isDark ? "#0d0d1a" : "#F9FAFB",
        color: theme.textPrimary, fontSize: "13px", lineHeight: 1.6,
        resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box"
    };

    const charCount = (str, max) => (
        <span style={{ fontSize: "11px", color: theme.textMuted }}>
            {(str || "").length}/{max} characters
        </span>
    );

    // ── Loading ──────────────────────────────────────────────────────────────

    if (loading) return (
        <DashboardLayout>
            <div style={{ minHeight: "70vh", display: "flex", alignItems: "center",
                          justifyContent: "center", color: theme.textMuted, fontSize: "14px" }}>
                Loading agent...
            </div>
        </DashboardLayout>
    );

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <DashboardLayout>
            <div style={{ minHeight: "100vh", background: theme.pageBg, padding: isMobile ? "12px" : "24px" }}>

                {/* TOAST */}
                {toast && (
                    <div style={{
                        position: "fixed", top: "20px", right: "20px", zIndex: 9999,
                        padding: "12px 20px", borderRadius: "12px",
                        background: toast.type === "error" ? "#EF4444" : "#10B981",
                        color: "#fff", fontSize: "13px", fontWeight: 600,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        display: "flex", alignItems: "center", gap: "8px"
                    }}>
                        {toast.type === "error"
                            ? <AlertCircle size={15} />
                            : <CheckCircle2 size={15} />}
                        {toast.message}
                    </div>
                )}

                <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex",
                              flexDirection: "column", gap: isMobile ? "12px" : "20px", width: "100%" }}>

                    {/* ── BREADCRUMB / HEADER ── */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px",
                                  justifyContent: "space-between", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <button onClick={() => navigate("/admin/ai-agents")} style={{
                                display: "flex", alignItems: "center", gap: "6px",
                                padding: "8px 14px", borderRadius: "10px",
                                border: `1px solid ${theme.cardBorder}`,
                                background: theme.cardBg, color: theme.textMuted,
                                cursor: "pointer", fontSize: "12px", fontWeight: 600
                            }}>
                                <ArrowLeft size={13} /> Back to Agents
                            </button>
                            <div>
                                <p style={{ fontSize: "10px", color: theme.textMuted, letterSpacing: "2px",
                                            textTransform: "uppercase", marginBottom: "2px" }}>
                                    AI AGENTS › {agent?.display_name?.toUpperCase()}
                                </p>
                                <h1 style={{ fontSize: "20px", fontWeight: 800, color: theme.textPrimary, margin: 0 }}>
                                    {agent?.display_name} Configuration
                                </h1>
                            </div>
                        </div>
                        <p style={{ fontSize: "13px", color: theme.textMuted, margin: 0 }}>
                            Edit prompts, configurations and behavior settings
                        </p>
                    </div>

                    {/* ── TABS ── */}
                    <div style={{ display: "flex", gap: "4px", background: theme.cardBg,
                                  border: `1px solid ${theme.cardBorder}`, borderRadius: "14px",
                                  padding: "5px" }}>
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            const active = activeTab === tab.key;
                            return (
                                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                                    gap: "7px", padding: "9px 12px", borderRadius: "10px", border: "none",
                                    cursor: "pointer", fontSize: "12px", fontWeight: active ? 700 : 500,
                                    background: active
                                        ? "linear-gradient(135deg,#7C5AF6,#6366F1)"
                                        : "transparent",
                                    color: active ? "#fff" : theme.textMuted,
                                    transition: "all 0.2s", whiteSpace: "nowrap"
                                }}>
                                    <Icon size={13} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* ── MAIN CONTENT ── */}
                    <div style={{ display: "grid", gridTemplateColumns: isTablet || isMobile ? "1fr" : "1fr 280px", gap: "20px",
                                  alignItems: "start" }}>

                        {/* LEFT — Tab Content */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                            {/* ── PROMPT TAB ── */}
                            {activeTab === "prompt" && (<>

                                {[
                                    { key: "base_prompt",         label: "Base Prompt",           sub: "The main system prompt that defines the agent's behavior",    rows: 6,  max: 4000 },
                                    { key: "role_instructions",   label: "Role Instructions",     sub: "Define the specific role and responsibilities of this agent",  rows: 5,  max: 4000 },
                                    { key: "behavior_guidelines", label: "Behavioral Guidelines", sub: "Define how the agent should behave in different scenarios",    rows: 5,  max: 4000 },
                                    { key: "formatting_rules",    label: "Formatting Rules",      sub: "Specify how the agent should format its responses",            rows: 4,  max: 2000 },
                                    { key: "business_rules",      label: "Business Rules",        sub: "Define business-specific constraints and policies",            rows: 4,  max: 2000 },
                                ].map(field => (
                                    <div key={field.key} style={card}>
                                        <div style={{ marginBottom: "12px" }}>
                                            <h3 style={{ fontSize: "14px", fontWeight: 700,
                                                          color: theme.textPrimary, margin: 0 }}>
                                                {field.label}
                                            </h3>
                                            <p style={{ fontSize: "12px", color: theme.textMuted,
                                                        marginTop: "3px", marginBottom: 0 }}>
                                                {field.sub}
                                            </p>
                                        </div>
                                        <textarea
                                            rows={field.rows}
                                            value={prompt[field.key]}
                                            onChange={e => setPrompt(p => ({ ...p, [field.key]: e.target.value }))}
                                            placeholder={`Enter ${field.label.toLowerCase()}...`}
                                            style={textarea}
                                        />
                                        <div style={{ textAlign: "right", marginTop: "6px" }}>
                                            {charCount(prompt[field.key], field.max)}
                                        </div>
                                    </div>
                                ))}

                                {/* Change Notes */}
                                <div style={card}>
                                    <h3 style={{ fontSize: "14px", fontWeight: 700,
                                                 color: theme.textPrimary, marginBottom: "6px" }}>
                                        Change Notes
                                    </h3>
                                    <textarea
                                        rows={3}
                                        value={prompt.change_notes}
                                        onChange={e => setPrompt(p => ({ ...p, change_notes: e.target.value }))}
                                        placeholder="Describe what you changed and why..."
                                        style={textarea}
                                    />
                                </div>
                            </>)}

                            {/* ── CONFIG TAB ── */}
                            {activeTab === "config" && (
                                <AgentConfigForm
                                    agentName={agent?.agent_name || agent?.name || ""}
                                    configJson={configJson}
                                    setConfigJson={setConfigJson}
                                    theme={theme}
                                    card={card}
                                />  
                            )}

                            {/* ── VERSION HISTORY TAB ── */}
                            {activeTab === "history" && (
                                <div style={card}>
                                    <h3 style={{ fontSize: "14px", fontWeight: 700,
                                                 color: theme.textPrimary, marginBottom: "16px" }}>
                                        Version History
                                    </h3>
                                    {versions.length === 0 ? (
                                        <p style={{ color: theme.textMuted, fontSize: "13px" }}>
                                            No versions found.
                                        </p>
                                    ) : (
                                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                            <thead>
                                                <tr>
                                                    {["Version", "Modified By", "Date", "Notes", "Action"].map(h => (
                                                        <th key={h} style={{
                                                            padding: "10px 12px", fontSize: "11px", fontWeight: 700,
                                                            letterSpacing: "0.08em", textTransform: "uppercase",
                                                            color: theme.textMuted,
                                                            borderBottom: `1px solid ${theme.cardBorder}`,
                                                            textAlign: "left"
                                                        }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {versions.map((v, i) => (
                                                    <tr key={v.version_id || i}>
                                                        {[
                                                            <span style={{
                                                                padding: "3px 8px", borderRadius: "6px",
                                                                background: "#7C5AF618", color: "#7C5AF6",
                                                                fontSize: "11px", fontWeight: 700
                                                            }}>v{v.version_number}</span>,
                                                            v.modified_by || "Admin",
                                                            formatDate(v.created_at),
                                                            <span style={{ color: theme.textMuted, fontSize: "12px" }}>
                                                                {(() => {
                                                                    const notes = v.change_notes || "";
                                                                    if (!notes || notes === "—") return "—";
                                                                    // Strip [CONFIG] prefix and JSON — show clean label
                                                                    if (notes.startsWith("[CONFIG]")) {
                                                                        try {
                                                                            const json = JSON.parse(notes.replace("[CONFIG]", "").trim());
                                                                            const keys = Object.keys(json);
                                                                            if (keys.length === 0) return "Configuration updated";
                                                                            const formatKey = k => k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                                                                            return (
                                                                                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                                                                                    <span style={{ fontWeight: 600, color: "#10B981", fontSize: "11px" }}>Configuration Updated</span>
                                                                                    {(expandedVersion === (v.version_id || i) ? keys : keys.slice(0, 3)).map(k => (
                                                                        <span key={k} style={{ fontSize: "11px" }}>
                                                                            {formatKey(k)}: <strong>{String(json[k])}</strong>
                                                                        </span>
                                                                    ))}
                                                                    {keys.length > 3 && (
                                                                        <span
                                                                            onClick={() => setExpandedVersion(
                                                                                expandedVersion === (v.version_id || i) ? null : (v.version_id || i)
                                                                            )}
                                                                            style={{
                                                                                fontSize: "11px", color: "#7C5AF6",
                                                                                cursor: "pointer", fontWeight: 600,
                                                                                textDecoration: "underline"
                                                                            }}>
                                                                            {expandedVersion === (v.version_id || i)
                                                                                ? "▲ Show less"
                                                                                : `+${keys.length - 3} more`}
                                                                        </span>
                                                                    )}
                                                                                </div>
                                                                            );
                                                                        } catch {
                                                                            return "Configuration updated";
                                                                        }
                                                                    }
                                                                    return notes;
                                                                })()}
                                                            </span>,
                                                            <button onClick={() => openRollback(v.version_id, v.version_number)}
                                                                style={{
                                                                    display: "flex", alignItems: "center", gap: "5px",
                                                                    padding: "5px 10px", borderRadius: "8px",
                                                                    background: "#F59E0B18", color: "#F59E0B",
                                                                    border: "none", cursor: "pointer",
                                                                    fontSize: "11px", fontWeight: 600
                                                                }}>
                                                                <RotateCcw size={11} /> Rollback
                                                            </button>
                                                        ].map((cell, ci) => (
                                                            <td key={ci} style={{
                                                                padding: "12px",
                                                                borderBottom: `1px solid ${theme.cardBorder}`,
                                                                fontSize: "13px", color: theme.textPrimary,
                                                                verticalAlign: "middle"
                                                            }}>{cell}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}

                            {/* ── AUDIT LOGS TAB ── */}
                            {activeTab === "audit" && (
                                <div style={card}>
                                    <h3 style={{ fontSize: "14px", fontWeight: 700,
                                                 color: theme.textPrimary, marginBottom: "16px" }}>
                                        Audit Logs
                                    </h3>
                                    {auditLogs.length === 0 ? (
                                        <p style={{ color: theme.textMuted, fontSize: "13px" }}>
                                            No audit logs found.
                                        </p>
                                    ) : (
                                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                            <thead>
                                                <tr>
                                                    {["Action", "Modified By", "Date", "Details"].map(h => (
                                                        <th key={h} style={{
                                                            padding: "10px 12px", fontSize: "11px", fontWeight: 700,
                                                            letterSpacing: "0.08em", textTransform: "uppercase",
                                                            color: theme.textMuted,
                                                            borderBottom: `1px solid ${theme.cardBorder}`,
                                                            textAlign: "left"
                                                        }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {auditLogs.map((log, i) => {
                                                    const isExpanded = expandedLog === (log.log_id || i);
                                                    const o = log.old_value;
                                                    const n = log.new_value;

                                                    const ACTION_META = {
                                                        prompt_updated:        { label: "Prompt Updated",    bg: "#3B82F618", color: "#3B82F6" },
                                                        prompt_rollback:       { label: "Prompt Rollback",   bg: "#F59E0B18", color: "#F59E0B" },
                                                        configuration_updated: { label: "Config Updated",    bg: "#10B98118", color: "#10B981" },
                                                        config_updated:        { label: "Config Updated",    bg: "#10B98118", color: "#10B981" },
                                                        status_changed:        { label: "Status Changed",    bg: "#8B5CF618", color: "#8B5CF6" },
                                                    };
                                                    const meta = ACTION_META[log.action] || { label: log.action, bg: "#6366F118", color: "#6366F1" };

                                                    const formatFieldName = (k) => k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                                                    const formatFieldVal = (v) => {
                                                        if (v === true)  return <span style={{ color: "#10B981", fontWeight: 700, fontSize: "11px" }}>Enabled</span>;
                                                        if (v === false) return <span style={{ color: "#EF4444", fontWeight: 700, fontSize: "11px" }}>Disabled</span>;
                                                        if (v === null || v === undefined) return <span style={{ color: "#9CA3AF", fontSize: "11px" }}>—</span>;
                                                        return <span style={{ fontWeight: 600, fontSize: "11px" }}>{String(v)}</span>;
                                                    };

                                                    const renderDetails = () => {
                                                        // Prompt rollback
                                                        if (log.action === "prompt_rollback") {
                                                            const ver = n?.rolled_back_to_version;
                                                            return (
                                                                <span style={{ fontSize: "12px", color: "#F59E0B", fontWeight: 600 }}>
                                                                    Rolled back{ver ? ` to Version ${ver}` : " to previous version"}
                                                                </span>
                                                            );
                                                        }

                                                        // Prompt updated
                                                        if (log.action === "prompt_updated") {
                                                            const oldText = typeof o === "object" ? (o?.base_prompt || "") : String(o || "");
                                                            const newText = typeof n === "object" ? (n?.base_prompt || "") : String(n || "");
                                                            return (
                                                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                                                    <span style={{ fontSize: "12px", color: theme.textMuted }}>
                                                                        Base Prompt changed
                                                                    </span>
                                                                    <button
                                                                        onClick={() => setExpandedLog(isExpanded ? null : (log.log_id || i))}
                                                                        style={{
                                                                            display: "inline-flex", alignItems: "center", gap: "4px",
                                                                            padding: "3px 10px", borderRadius: "6px", border: "none",
                                                                            background: "#3B82F618", color: "#3B82F6",
                                                                            fontSize: "11px", fontWeight: 600, cursor: "pointer",
                                                                            width: "fit-content"
                                                                        }}>
                                                                        {isExpanded ? "▲ Hide" : "▼ View Changes"}
                                                                    </button>
                                                                    {isExpanded && (
                                                                        <div style={{
                                                                            marginTop: "8px", borderRadius: "10px",
                                                                            overflow: "hidden",
                                                                            border: `1px solid ${theme.isDark ? "#1e2235" : "#E5E7EB"}`,
                                                                        }}>
                                                                            <div style={{
                                                                                padding: "10px 14px",
                                                                                background: theme.isDark ? "#1a0d0d" : "#FEF2F2",
                                                                                borderBottom: `1px solid ${theme.isDark ? "#2a1a1a" : "#FECACA"}`
                                                                            }}>
                                                                                <div style={{ fontSize: "10px", fontWeight: 800, color: "#EF4444", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                                                                    ✕ Before
                                                                                </div>
                                                                                <div style={{
                                                                                    fontSize: "11px", color: theme.isDark ? "#FCA5A5" : "#7F1D1D",
                                                                                    lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word",
                                                                                    maxHeight: "160px", overflowY: "auto",
                                                                                    paddingRight: "4px"
                                                                                }}>
                                                                                    {String(oldText || "—")}
                                                                                </div>
                                                                            </div>
                                                                            <div style={{
                                                                                padding: "10px 14px",
                                                                                background: theme.isDark ? "#0d1a0d" : "#F0FDF4",
                                                                            }}>
                                                                                <div style={{ fontSize: "10px", fontWeight: 800, color: "#10B981", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                                                                    ✓ After
                                                                                </div>
                                                                                <div style={{
                                                                                    fontSize: "11px", color: theme.isDark ? "#6EE7B7" : "#064E3B",
                                                                                    lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word",
                                                                                    maxHeight: "160px", overflowY: "auto",
                                                                                    paddingRight: "4px"
                                                                                }}>
                                                                                    {String(newText || "—")}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        }

                                                        // Configuration updated
                                                        if (log.action === "configuration_updated" || log.action === "config_updated" || log.action === "configuration_changed") {
                                                            // Unwrap nested configuration key if present
                                                            const unwrap = (val) => {
                                                                if (!val || typeof val !== "object") return {};
                                                                if (val.configuration && typeof val.configuration === "object") return val.configuration;
                                                                return val;
                                                            };
                                                            const oldCfg = unwrap(o);
                                                            const newCfg = unwrap(n);
                                                            const allKeys = new Set([...Object.keys(oldCfg), ...Object.keys(newCfg)]);
                                                            const changed = [...allKeys].filter(k => JSON.stringify(oldCfg[k]) !== JSON.stringify(newCfg[k]));
                                                            return (
                                                                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                                                    {changed.length === 0 && <span style={{ fontSize: "11px", color: theme.textMuted }}>No changes detected</span>}
                                                                    {changed.map(k => (
                                                                        <div key={k} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
                                                                            <span style={{ color: theme.textMuted, minWidth: "110px" }}>{formatFieldName(k)}</span>
                                                                            {formatFieldVal(oldCfg[k])}
                                                                            <span style={{ color: theme.textMuted }}>→</span>
                                                                            {formatFieldVal(newCfg[k])}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            );
                                                        }

                                                        // Status changed
                                                        if (log.action === "status_changed") {
                                                            const os = o?.status; const ns = n?.status;
                                                            return (
                                                                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
                                                                    <span style={{ color: theme.textMuted }}>Status</span>
                                                                    <span style={{ fontWeight: 700, color: os === "active" ? "#10B981" : "#EF4444" }}>{os}</span>
                                                                    <span style={{ color: theme.textMuted }}>→</span>
                                                                    <span style={{ fontWeight: 700, color: ns === "active" ? "#10B981" : "#EF4444" }}>{ns}</span>
                                                                </div>
                                                            );
                                                        }

                                                        return <span style={{ color: theme.textMuted, fontSize: "12px" }}>—</span>;
                                                    };

                                                    return (
                                                        <tr key={log.log_id || i}>
                                                            {[
                                                                <span style={{
                                                                    padding: "4px 10px", borderRadius: "20px",
                                                                    background: meta.bg, color: meta.color,
                                                                    fontSize: "11px", fontWeight: 700,
                                                                    whiteSpace: "nowrap"
                                                                }}>{meta.label}</span>,
                                                                <span style={{ fontSize: "12px" }}>{log.modified_by || "Admin"}</span>,
                                                                <span style={{ fontSize: "12px", whiteSpace: "nowrap" }}>{formatDate(log.modified_at || log.created_at)}</span>,
                                                                renderDetails()
                                                            ].map((cell, ci) => (
                                                                <td key={ci} style={{
                                                                    padding: "12px 14px",
                                                                    borderBottom: `1px solid ${theme.cardBorder}`,
                                                                    fontSize: "13px", color: theme.textPrimary,
                                                                    verticalAlign: "top"
                                                                }}>{cell}</td>
                                                            ))}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}

                        </div>

                        {/* RIGHT — Agent Info Panel */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px",
                                      position: "sticky", top: "24px" }}>

                            {/* Agent Info Card */}
                            <div style={card}>
                                <h3 style={{ fontSize: "13px", fontWeight: 700, color: theme.textPrimary,
                                             marginBottom: "16px" }}>
                                    Agent Information
                                </h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {[
                                        { label: "Agent Name",  value: agent?.display_name },
                                        { label: "Status",      value: (
                                            <span style={{
                                                display: "inline-flex", alignItems: "center", gap: "5px",
                                                padding: "3px 8px", borderRadius: "20px", fontSize: "11px",
                                                fontWeight: 700,
                                                background: agent?.status ? "#10B98118" : "#EF444418",
                                                color: agent?.status ? "#10B981" : "#EF4444"
                                            }}>
                                                <span style={{ width: "5px", height: "5px", borderRadius: "50%",
                                                    background: agent?.status ? "#10B981" : "#EF4444" }} />
                                                {agent?.status ? "Active" : "Inactive"}
                                            </span>
                                        )},
                                        { label: "Created At",    value: formatDate(agent?.created_at) },
                                        { label: "Last Updated",  value: formatDate(agent?.updated_at) },
                                        { label: "Total Versions", value: versions?.length || "—" },
                                        { label: "Created By",    value: agent?.created_by || "Admin User" },
                                    ].map(row => (
                                        <div key={row.label}>
                                            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em",
                                                          textTransform: "uppercase", color: theme.textMuted,
                                                          marginBottom: "3px" }}>
                                                {row.label}
                                            </div>
                                            <div style={{ fontSize: "13px", color: theme.textPrimary, fontWeight: 500 }}>
                                                {row.value || "—"}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions Card */}
                            <div style={card}>
                                <h3 style={{ fontSize: "13px", fontWeight: 700, color: theme.textPrimary,
                                             marginBottom: "14px" }}>
                                    Actions
                                </h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

                                    {/* Save */}
                                    <button
                                        onClick={activeTab === "config" ? handleSaveConfig : handleSavePrompt}
                                        disabled={saving}
                                        style={{
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            gap: "8px", padding: "11px", borderRadius: "10px", border: "none",
                                            background: "linear-gradient(135deg,#7C5AF6,#6366F1)",
                                            color: "#fff", cursor: saving ? "not-allowed" : "pointer",
                                            fontSize: "13px", fontWeight: 600,
                                            opacity: saving ? 0.7 : 1
                                        }}>
                                        <Save size={14} />
                                        {saving ? "Saving..." : "Save Changes"}
                                    </button>

                                    {/* Test in Sandbox */}
                                    <button
                                        onClick={() => navigate(`/admin/ai-agents/test?agent=${agentId}`)}
                                        style={{
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            gap: "8px", padding: "11px", borderRadius: "10px",
                                            border: `1px solid ${theme.cardBorder}`,
                                            background: theme.isDark ? "rgba(255,255,255,0.05)" : "#F9FAFB",
                                            color: theme.textPrimary, cursor: "pointer",
                                            fontSize: "13px", fontWeight: 600
                                        }}>
                                        <FlaskConical size={14} />
                                        Test in Sandbox
                                    </button>

                                    {/* Activate / Deactivate */}
                                    <button
                                        onClick={handleToggleStatus}
                                        style={{
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            gap: "8px", padding: "11px", borderRadius: "10px", border: "none",
                                            background: agent?.status ? "#EF444418" : "#10B98118",
                                            color: agent?.status ? "#EF4444" : "#10B981",
                                            cursor: "pointer", fontSize: "13px", fontWeight: 600
                                        }}>
                                        {agent?.status
                                            ? <><PowerOff size={14} /> Deactivate Agent</>
                                            : <><Power size={14} /> Activate Agent</>}
                                    </button>

                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <ConfirmModal
                isOpen={rollbackModal.open}
                title="Rollback Prompt"
                message={`Are you sure you want to roll back to Version ${rollbackModal.versionNum}? The current prompt will be replaced.`}
                confirmText="Rollback"
                confirmColor="#F59E0B"
                loading={rollbackLoading}
                onConfirm={handleRollback}
                onCancel={() => setRollbackModal({ open: false, versionId: null, versionNum: null })}
            />
        </DashboardLayout>
    );
};

export default AgentConfigPage;