import {
    LayoutDashboard, Building2, User, Bookmark, Settings,
    LogOut, BrainCircuit, ChevronLeft, ChevronRight,
    Sparkles, X, MessageSquare, ShieldCheck, Trash2, RefreshCw 
} from "lucide-react";

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import { useTheme } from "../../../context/ThemeContext";

const Sidebar = ({ sidebarOpen, setSidebarOpen, collapsed, setCollapsed }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();
    const theme = useTheme();

    const iconSize = collapsed ? 20 : 15;
    const [hoveredItem, setHoveredItem] = useState(null);
    const [tooltipY, setTooltipY] = useState(0);

    const isAdmin = user?.role === "admin" || location.pathname.startsWith("/admin");

    const adminMenuItems = [
        { label: "Dashboard",          icon: <LayoutDashboard size={iconSize} />, path: "/admin" },
        { label: "Vendor Management",  icon: <Building2 size={iconSize} />,       path: "/admin/vendors" },
        { label: "Verification Queue", icon: <ShieldCheck size={iconSize} />,     path: "/admin/verification" },
        { label: "Import & Export",    icon: <Bookmark size={iconSize} />,        path: "/admin/import" },
        { label: "AI Agents",          icon: <BrainCircuit size={iconSize} />,    path: "/admin/ai-agents" },
        { label: "Vendor Cleanup",     icon: <Trash2 size={iconSize} />,          path: "/admin/vendor-cleanup" },
        { label: "Vendor Sync",        icon: <RefreshCw size={iconSize} />,       path: "/admin/vendor-sync" },
        { label: "Settings",           icon: <Settings size={iconSize} />,        path: "/settings" },
    ];

    const vendorMenuItems = [
        { label: "Dashboard",          icon: <LayoutDashboard size={iconSize} />, path: "/dashboard" },
        { label: "Vendor Marketplace", icon: <Building2 size={iconSize} />,       path: "/vendors" },
        { label: "Profile",            icon: <User size={iconSize} />,            path: "/profile" },
        { label: "Recommendations",    icon: <BrainCircuit size={iconSize} />,    path: "/recommendations" },
        { label: "Saved Vendors",      icon: <Bookmark size={iconSize} />,        path: "/saved-vendors" },
        { label: "Settings",           icon: <Settings size={iconSize} />,        path: "/settings" },
        { label: "Chat",               icon: <MessageSquare size={iconSize} />,   path: "/chat" },
    ];

    const menuItems = isAdmin ? adminMenuItems : vendorMenuItems;

    const handleNavigate = (path) => {
        navigate(path);
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
            setCollapsed(false);
        } else if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <>
        {collapsed && hoveredItem && window.innerWidth >= 768 && (
            <span style={{
                position: "fixed",
                left: "72px",
                top: `${tooltipY}px`,
                background: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                color: theme.textPrimary,
                padding: "5px 10px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 500,
                whiteSpace: "nowrap",
                pointerEvents: "none",
                zIndex: 9999,
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
            }}>
                {hoveredItem}
            </span>
        )}

        {/* Mobile Overlay */}
        {sidebarOpen && (
            <div
                onClick={() => setSidebarOpen(false)}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.4)",
                    zIndex: 40,
                    backdropFilter: "blur(2px)"
                }}
                className="lg:hidden"
            />
        )}

        <aside
            className={`
                fixed top-0 left-0 h-screen z-50 overflow-hidden transition-all duration-300
                ${collapsed ? "w-[64px]" : "w-[200px]"}
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}
            style={{
                background: theme.sidebarBg,
                borderRight: `1px solid ${theme.cardBorder}`,
                backdropFilter: "blur(20px)",
                boxShadow: theme.isDark
                    ? "0 0 30px rgba(0,0,0,0.35)"
                    : "0 0 20px rgba(15,23,42,0.08)"
            }}
        >
            <div className="h-full flex flex-col">

                {/* HEADER */}
                <div style={{ borderBottom: `1px solid ${theme.cardBorder}`, padding: "10px 10px" }}>
                    <div className="flex items-center justify-between">

                        {!collapsed && (
                            <div className="flex items-center gap-3">
                                <div
                                    style={{
                                        height: "32px",
                                        width: "32px",
                                        borderRadius: "8px",
                                        background: "linear-gradient(135deg, #7C5AF6, #a78bfa)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0
                                    }}
                                >
                                    <Sparkles size={20} color="#fff" />
                                </div>
                                <div>
                                    <h1 style={{ fontWeight: 700, fontSize: "13px", color: theme.textPrimary, lineHeight: 1.2 }}>
                                        Vendor Hub
                                    </h1>
                                    <p style={{ fontSize: "9px", color: theme.textMuted }}>
                                        Enterprise Suite
                                    </p>
                                </div>
                            </div>
                        )}

                        {collapsed && (
                            <div
                                style={{
                                    height: "36px",
                                    width: "36px",
                                    borderRadius: "10px",
                                    background: "linear-gradient(135deg, #7C5AF6, #a78bfa)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto"
                                }}
                            >
                                <Sparkles size={20} color="#fff" />
                            </div>
                        )}

                        {!collapsed && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCollapsed(prev => !prev)}
                                    style={{
                                        background: theme.panelBg,
                                        border: `1px solid ${theme.cardBorder}`,
                                        color: theme.textPrimary,
                                        padding: "6px",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                <div className="lg:hidden">
                                    <button
                                        onClick={() => setSidebarOpen(false)}
                                        style={{
                                            background: theme.panelBg,
                                            border: `1px solid ${theme.cardBorder}`,
                                            color: theme.textPrimary,
                                            padding: "6px",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {collapsed && (
                            <button
                                onClick={() => setCollapsed(prev => !prev)}
                                style={{
                                    position: "absolute",
                                    bottom: "80px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    background: theme.panelBg,
                                    border: `1px solid ${theme.cardBorder}`,
                                    color: theme.textPrimary,
                                    padding: "6px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                            >
                                <ChevronRight size={16} />
                            </button>
                        )}

                    </div>
                </div>

                {/* MENU */}
                <div
                    className="flex-1 overflow-y-auto overflow-x-hidden py-4"
                    style={{ padding: "10px 8px" }}
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        {menuItems.map((item) => {
                            const active = location.pathname === item.path;
                            return (
                                <button
                                    key={item.label}
                                    onClick={() => handleNavigate(item.path)}
                                    onMouseEnter={e => { 
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setTooltipY(rect.top + rect.height / 2 - 14);
                                        setHoveredItem(item.label); 
                                        if (!active) e.currentTarget.style.background = theme.menuHoverBg; 
                                    }}
                                    onMouseLeave={e => { setHoveredItem(null); if (!active) e.currentTarget.style.background = "transparent"; }}
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: collapsed ? "center" : "flex-start",
                                        gap: collapsed ? "0" : "10px",
                                        padding: collapsed ? "8px 0" : "8px 10px",
                                        borderRadius: "12px",
                                        border: "none",
                                        cursor: "pointer",
                                        background: active ? "rgba(124,90,246,0.12)" : "transparent",
                                        color: active ? "#7C5AF6" : theme.textMuted,
                                        fontWeight: active ? 600 : 400,
                                        fontSize: "13px",
                                        transition: "all 0.2s",
                                        position: "relative"
                                    }}
                                >
                                    {/* Active left bar */}
                                    {active && !collapsed && (
                                        <div style={{
                                            position: "absolute",
                                            left: 0,
                                            top: "20%",
                                            height: "60%",
                                            width: "3px",
                                            borderRadius: "0 3px 3px 0",
                                            background: "#7C5AF6"
                                        }} />
                                    )}

                                    <span style={{ color: active ? "#7C5AF6" : theme.textMuted, flexShrink: 0, position: "relative" }}>
                                        {item.icon}
                                    </span>

                                    {!collapsed && (
                                        <span style={{ lineHeight: 1.2, whiteSpace: "nowrap" }}>{item.label}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* FOOTER */}
                <div style={{ borderTop: `1px solid ${theme.cardBorder}`, padding: collapsed ? "10px 8px" : "10px 12px" }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            background: "rgba(239,68,68,0.10)",
                            color: "#EF4444",
                            width: "100%",
                            padding: collapsed ? "10px 0" : "10px 12px",
                            borderRadius: "10px",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: collapsed ? "0" : "10px",
                            fontSize: "13px",
                            fontWeight: 500
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.18)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.10)"}
                    >
                        <LogOut size={collapsed ? 20 : 15} />
                        {!collapsed && "Logout"}
                    </button>
                </div>

            </div>
        </aside>
        </>
    );
};

export default Sidebar;