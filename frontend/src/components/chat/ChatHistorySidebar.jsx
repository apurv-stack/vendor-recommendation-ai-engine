import { useEffect, useState, useRef } from "react";
import ConfirmModal from "../common/ConfirmModal";
import InputModal from "../common/InputModal";
import { MessageSquare, Plus, Sparkles, MoreVertical, LogOut, Settings, User, Search, HelpCircle, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getSessions, renameSession, deleteSession } from "../../api/sessionApi";
import { useTheme } from "../../context/ThemeContext";

const ChatHistorySidebar = ({ onSessionSelect, onNewChat, selectedSessionId, refreshTrigger, onCollapse }) => {
    const [sessions, setSessions] = useState([]);
    const [menuOpen, setMenuOpen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [renameModal, setRenameModal] = useState({ open: false, id: null, current: "" });
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
    const [modalLoading, setModalLoading] = useState(false);

    const profileRef = useRef(null);
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const t = useTheme();

    useEffect(() => { loadSessions(); }, [refreshTrigger]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target))
                setProfileOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const loadSessions = async () => {
        try {
            const res = await getSessions();
            setSessions(res.sessions || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleRename = (id, currentTitle) => {
        setRenameModal({ open: true, id, current: currentTitle || "" });
    };

    const confirmRename = async (newTitle) => {
        if (!newTitle?.trim()) return;
        setModalLoading(true);
        try {
            await renameSession(renameModal.id, newTitle.trim());
            await loadSessions();
        } catch (e) { console.error(e); }
        finally {
            setModalLoading(false);
            setRenameModal({ open: false, id: null, current: "" });
        }
    };

    const handleDelete = (id) => {
        setDeleteModal({ open: true, id });
    };

    const confirmDelete = async () => {
        setModalLoading(true);
        try {
            await deleteSession(deleteModal.id);
            await loadSessions();
        } catch (e) { console.error(e); }
        finally {
            setModalLoading(false);
            setDeleteModal({ open: false, id: null });
        }
    };

    const handleLogout = async () => { await logout(); navigate("/login"); };

    const acronym = (user?.full_name || user?.username || "U")
        .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

    const filteredSessions = sessions.filter(s =>
        (s.title || s.preview || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{
            display: "flex", flexDirection: "column",
            height: "100%", width: "clamp(200px, 22vw, 268px)", flexShrink: 0,
            background: t.sidebarBg,
            borderRight: `1px solid ${t.sidebarBorder}`,
            overflow: "hidden",
            transition: "background 0.3s, border-color 0.3s"
        }}>
            {/* ── HEADER ── */}
            <div style={{ flexShrink: 0, padding: "20px 16px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: "linear-gradient(135deg,#7c5af6,#a78bfa)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 0 16px rgba(124,90,246,0.5)"
                        }}>
                            <Sparkles size={16} color="#fff" />
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: t.textPrimary }}>
                                VendorDiscovery AI
                            </div>
                        </div>
                    </div>
                    <button onClick={onCollapse} style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: "linear-gradient(135deg,rgba(124,90,246,0.3),rgba(167,139,250,0.2))",
                        border: "1px solid rgba(124,90,246,0.5)",
                        color: "#c4b5fd", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700,
                        boxShadow: "0 0 10px rgba(124,90,246,0.3)",
                        transition: "all 0.2s"
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,90,246,0.5)"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg,rgba(124,90,246,0.3),rgba(167,139,250,0.2))"; e.currentTarget.style.color = "#c4b5fd"; }}
                    >‹</button>
                </div>
            </div>

            {/* ── NEW CHAT ── */}
            <div style={{ flexShrink: 0, padding: "0 12px 12px" }}>
                <button onClick={onNewChat} style={{
                    width: "100%", borderRadius: 10, padding: "10px 14px",
                    background: "linear-gradient(135deg,#7c5af6,#a78bfa)",
                    color: "#fff", fontSize: 13, fontWeight: 600,
                    border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    boxShadow: "0 0 20px rgba(124,90,246,0.4)"
                }}>
                    <Plus size={14} /> New Chat
                </button>
            </div>

            {/* ── SEARCH ── */}
            <div style={{ flexShrink: 0, padding: "0 12px 12px" }}>
                <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: t.searchBg,
                    border: `1px solid ${t.searchBorder}`,
                    borderRadius: 8, padding: "7px 10px",
                    transition: "background 0.3s"
                }}>
                    <Search size={13} color={t.textMuted} />
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search conversations"
                        style={{
                            background: "transparent", border: "none", outline: "none",
                            color: t.inputText, fontSize: 12, width: "100%",
                            fontFamily: "inherit"
                        }}
                    />
                </div>
            </div>

            {/* ── SECTION LABEL ── */}
            <div style={{ flexShrink: 0, padding: "0 16px 6px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: t.isDark ? "#94A3B8" : "#64748B", letterSpacing: "1px", textTransform: "uppercase" }}>
                    Recent Conversations
                </div>
            </div>

            {/* ── SESSION LIST ── */}
            <div className="sb-list" style={{
                flex: 1, overflowY: "auto", padding: "0 8px",
                scrollbarWidth: "thin", scrollbarColor: `${t.scrollThumb} ${t.scrollTrack}`
            }}>
                <style>{`
                    .sb-list::-webkit-scrollbar { width: 3px; }
                    .sb-list::-webkit-scrollbar-track { background: ${t.scrollTrack}; }
                    .sb-list::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 4px; }
                    .session-row:hover .menu-btn { opacity: 1 !important; }
                `}</style>

                {loading ? (
                    <div style={{ padding: "12px 8px", fontSize: 12, color: t.textFaint }}>Loading...</div>
                ) : filteredSessions.length === 0 ? (
                    <div style={{ padding: "40px 16px", textAlign: "center" }}>
                        <MessageSquare size={24} color={t.textFaint} style={{ margin: "0 auto 8px" }} />
                        <div style={{ fontSize: 13, color: t.textFaint }}>No conversations yet</div>
                    </div>
                ) : (
                    filteredSessions.map(session => (
                        <div key={session.session_id} className="session-row"
                            style={{ position: "relative", marginBottom: 2 }}>
                            <button
                                onClick={() => onSessionSelect(session.session_id)}
                                style={{
                                    width: "100%", textAlign: "left",
                                    padding: "9px 10px", borderRadius: 8,
                                    border: "none", cursor: "pointer",
                                    background: selectedSessionId === session.session_id
                                        ? (t.isDark
                                            ? "linear-gradient(90deg, rgba(124,90,246,.25), rgba(124,90,246,.08))"
                                            : "rgba(124,90,246,.10)")
                                        : "transparent",
                                    borderLeft: selectedSessionId === session.session_id
                                        ? "3px solid #7c5af6"
                                        : "3px solid transparent",
                                    boxShadow: selectedSessionId === session.session_id
                                        ? (t.isDark
                                            ? "0 0 20px rgba(124,90,246,.15)"
                                            : "0 0 15px rgba(124,90,246,.10)")
                                        : "none",
                                    transition: "all 0.15s", fontFamily: "inherit"
                                }}
                                onMouseEnter={e => {
                                    if (selectedSessionId !== session.session_id)
                                        e.currentTarget.style.background = t.isDark
                                            ? "rgba(124,90,246,.08)"
                                            : "rgba(124,90,246,.05)";
                                }}
                                onMouseLeave={e => {
                                    if (selectedSessionId !== session.session_id)
                                        e.currentTarget.style.background = "transparent";
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 20 }}>
                                    <MessageSquare size={12}
                                        color={selectedSessionId === session.session_id ? "#C4B5FD" : t.textMuted}
                                        style={{ flexShrink: 0 }} />
                                    <span style={{
                                        fontSize: 13, fontWeight: 500,
                                        color:
                                            selectedSessionId === session.session_id
                                                ? (t.isDark ? "#FFFFFF" : "#4C1D95")
                                                : t.textPrimary,
                                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                                    }}>
                                        {session.title || session.preview || "New Conversation"}
                                    </span>
                                </div>
                                {session.updated_at && (
                                    <div style={{ fontSize: 11, color: selectedSessionId === session.session_id ? (t.isDark ? "rgba(255,255,255,0.75)" : "#6D28D9") : t.textFaint, marginTop: 3, paddingLeft: 20 }}>
                                        {new Date(session.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                    </div>
                                )}
                            </button>

                            {/* 3-dot menu */}
                            <button
                                className="menu-btn"
                                onClick={() => setMenuOpen(menuOpen === session.session_id ? null : session.session_id)}
                                style={{
                                    position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)",
                                    padding: 4, borderRadius: 6, border: "none",
                                    background: "transparent", color: t.textMuted,
                                    cursor: "pointer", opacity: 0, transition: "opacity 0.15s"
                                }}
                            >
                                <MoreVertical size={13} />
                            </button>

                            {menuOpen === session.session_id && (
                                <div style={{
                                    position: "absolute", right: 0, top: 36,
                                    background: t.menuBg, border: `1px solid ${t.menuBorder}`,
                                    borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                                    zIndex: 50, overflow: "hidden", minWidth: 120
                                }}>
                                    {[
                                        { label: "Rename", color: t.dropdownItemText, fn: () => { handleRename(session.session_id, session.title); setMenuOpen(null); } },
                                        { label: "Delete", color: "#f87171", fn: () => { handleDelete(session.session_id); setMenuOpen(null); } }
                                    ].map(({ label, color, fn }) => (
                                        <button key={label} onClick={fn} style={{
                                            display: "block", width: "100%", padding: "9px 14px",
                                            fontSize: 12, color, background: "transparent",
                                            border: "none", textAlign: "left", cursor: "pointer",
                                            fontFamily: "inherit"
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.background = t.menuHoverBg}
                                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                        >{label}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* ── PROFILE — fixed at bottom, dropdown opens ABOVE ── */}
            {/* DASHBOARD BUTTON — mobile only */}
            <style>{`
                @media (min-width: 768px) { .dashboard-mobile-btn { display: none !important; } }
            `}</style>
            <div className="dashboard-mobile-btn" style={{ flexShrink: 0, padding: "6px 8px" }}>
                <button
                    onClick={() =>
                        navigate(
                            user?.role === "admin"
                                ? "/admin"
                                : "/dashboard"
                        )
                    }
                    style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 14px", borderRadius: 10,
                        background: "rgba(124,90,246,0.08)",
                        border: "1px solid rgba(124,90,246,0.2)",
                        color: "#7c5af6", fontSize: 13, fontWeight: 600,
                        cursor: "pointer", fontFamily: "inherit"
                    }}
                >
                    <LayoutDashboard size={15} color="#7c5af6" />
                    Go to Dashboard
                </button>
            </div>
            <div style={{
                flexShrink: 0,
                borderTop: `1px solid ${t.divider}`,
                padding: "10px 8px",
                position: "relative"   /* ← KEY: makes dropdown position relative to this */
            }} ref={profileRef}>

                {/* DROPDOWN — rendered inside relative wrapper, opens upward */}
                {profileOpen && (
                    <div style={{
                        position: "absolute",
                        bottom: "calc(100% + 4px)",  /* sits above the profile button */
                        left: 8, right: 8,
                        background: t.menuBg,
                        border: `1px solid ${t.menuBorder}`,
                        borderRadius: 14,
                        boxShadow: t.isDark
                            ? "0 -8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,90,246,0.1)"
                            : "0 -8px 32px rgba(124,90,246,0.12)",
                        overflow: "hidden",
                        zIndex: 999
                    }}>
                        {/* Signed in as */}
                        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${t.divider}` }}>
                            <div style={{ fontSize: 10, color: t.dropdownSignedText }}>Signed in as</div>
                            <div style={{
                                fontSize: 12, fontWeight: 600, color: t.dropdownEmailText,
                                marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                            }}>
                                {user?.email || user?.username}
                            </div>
                        </div>

                        {[
                            { icon: <User size={13} color="#7c5af6" />, label: "Profile", path: user?.role === "admin" ? "/admin" : "/profile"},
                            { icon: <Settings size={13} color="#7c5af6" />, label: "Settings", path: "/settings" },
                            { icon: <HelpCircle size={13} color="#7c5af6" />, label: "Help & Support", path: "/help" },
                        ].map(({ icon, label, path }) => (
                            <button key={label}
                                onClick={() => { navigate(path); setProfileOpen(false); }}
                                style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    width: "100%", padding: "10px 14px",
                                    fontSize: 12, fontWeight: 500,
                                    color: t.dropdownItemText,
                                    background: "transparent", border: "none",
                                    textAlign: "left", cursor: "pointer", fontFamily: "inherit"
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = t.menuHoverBg}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >{icon}{label}</button>
                        ))}

                        <div style={{ height: 1, background: t.divider, margin: "2px 10px" }} />

                        <button onClick={handleLogout}
                            style={{
                                display: "flex", alignItems: "center", gap: 10,
                                width: "100%", padding: "10px 14px",
                                fontSize: 12, fontWeight: 500,
                                color: "#f87171", background: "transparent",
                                border: "none", textAlign: "left", cursor: "pointer", fontFamily: "inherit"
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = t.menuHoverBg}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                            <LogOut size={13} />Logout
                        </button>
                    </div>
                )}

                {/* PROFILE BUTTON */}
                <button
                    onClick={() => setProfileOpen(p => !p)}
                    style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 10px", borderRadius: 10,
                        border: profileOpen ? "1px solid rgba(124,90,246,0.35)" : "1px solid transparent",
                        background: profileOpen ? "rgba(124,90,246,0.08)" : "transparent",
                        cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit"
                    }}
                    onMouseEnter={e => { if (!profileOpen) e.currentTarget.style.background = t.sessionHoverBg; }}
                    onMouseLeave={e => { if (!profileOpen) e.currentTarget.style.background = "transparent"; }}
                >
                    <div style={{
                        width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                        background: "linear-gradient(135deg,#7c5af6,#a78bfa)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: 13, fontWeight: 700,
                        boxShadow: "0 0 10px rgba(124,90,246,0.4)",
                        position: "relative"
                    }}>
                        {acronym}
                        <div style={{
                            position: "absolute", bottom: 1, right: 1,
                            width: 8, height: 8, borderRadius: "50%",
                            background: "#22c55e", border: `1.5px solid ${t.onlineDotBorder}`
                        }} />
                    </div>
                    <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                        <div style={{
                            fontSize: 13, fontWeight: 600, color: t.profileNameText,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                        }}>
                            {user?.full_name || user?.username || "User"}
                        </div>
                        <div style={{
                            fontSize: 11, color: t.profileEmailText,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                        }}>
                            {user?.email || ""}
                        </div>
                    </div>
                    <span style={{
                        color: profileOpen ? "#a78bfa" : t.profileArrowText,
                        fontSize: 14, flexShrink: 0,
                        transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s, color 0.2s",
                        display: "inline-block"
                    }}>⌄</span>
                </button>

                <ConfirmModal
                    isOpen={deleteModal.open}
                    title="Delete Chat"
                    message="Are you sure you want to delete this chat? This action cannot be undone."
                    confirmText="Delete"
                    confirmColor="#EF4444"
                    loading={modalLoading}
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteModal({ open: false, id: null })}
                />
                <InputModal
                    isOpen={renameModal.open}
                    title="Rename Chat"
                    label="New title"
                    placeholder="Enter new chat title"
                    defaultValue={renameModal.current}
                    confirmText="Save"
                    loading={modalLoading}
                    onConfirm={confirmRename}
                    onCancel={() => setRenameModal({ open: false, id: null, current: "" })}
                />
            </div>
        </div>
    );
};

export default ChatHistorySidebar;