import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Maximize2 } from "lucide-react";
import ChatWindow from "../../../components/chat/ChatWindow";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import { useTheme } from "../../../context/ThemeContext";

const MainLayout = ({ children }) => {
    const theme = useTheme();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebar, setMobileSidebar] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatRefreshKey, setChatRefreshKey] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) setMobileSidebar(false);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleSidebarToggle = () => {
        if (isMobile) {
            setMobileSidebar(previous => !previous);
        } else {
            setSidebarCollapsed(previous => !previous);
        }
    };

    const sidebarWidth = isMobile ? 0 : sidebarCollapsed ? 72 : 200;

    return (
        <div
            style={{
                height: "100vh",
                width: "100vw",
                display: "flex",
                overflow: "hidden",
                background: theme.pageBg
            }}
        >
            {/* MOBILE OVERLAY */}
            {mobileSidebar && (
                <div
                    onClick={() => setMobileSidebar(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.4)",
                        backdropFilter: "blur(4px)",
                        zIndex: 40
                    }}
                />
            )}

            {/* SIDEBAR */}
            <Sidebar
                sidebarOpen={mobileSidebar}
                setSidebarOpen={setMobileSidebar}
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
            />

            {/* MAIN CONTENT AREA */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                    height: "100vh",
                    marginLeft: `${sidebarWidth}px`,
                    transition: "margin-left 0.3s ease"
                }}
            >
                {/* NAVBAR */}
                <Navbar
                    toggleSidebar={handleSidebarToggle}
                    setSidebarOpen={setMobileSidebar}
                    onChatOpen={() => setChatOpen(prev => !prev)}
                />

                {/* PAGE CONTENT */}
                <main
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        overflowX: "hidden",
                        padding: "20px",
                        background: theme.pageBg
                    }}
                >
                    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
                        {children}
                    </div>
                </main>
            </div>
        {/* CHAT DRAWER OVERLAY */}
            {chatOpen && (
                <div
                    onClick={() => setChatOpen(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.4)",
                        backdropFilter: "blur(4px)",
                        zIndex: 45
                    }}
                />
            )}

            {/* CHAT DRAWER */}
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    right: chatOpen ? 0 : "-420px",
                    width: "420px",
                    maxWidth: "100vw",
                    height: "100vh",
                    zIndex: 46,
                    display: "flex",
                    flexDirection: "column",
                    background: "#0d0d1a",
                    borderLeft: "1px solid rgba(124,90,246,0.3)",
                    boxShadow: "-8px 0 40px rgba(0,0,0,0.5)",
                    transition: "right 0.35s cubic-bezier(0.4,0,0.2,1)"
                }}
            >
                {/* DRAWER HEADER */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    borderBottom: "1px solid rgba(124,90,246,0.2)",
                    background: "rgba(124,90,246,0.08)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: "linear-gradient(135deg,#7C5AF6,#5B8DEF)",
                            display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            <MessageSquare size={16} color="#fff" />
                        </div>
                        <div>
                            <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: 0 }}>AI Assistant</p>
                            <p style={{ color: "#22c55e", fontSize: 11, margin: 0 }}>● Online</p>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        {/* Expand to full page */}
                        <button
                            onClick={() => { setChatOpen(false); navigate("/chat"); }}
                            style={{
                                width: 32, height: 32, borderRadius: 8,
                                background: "rgba(124,90,246,0.2)",
                                border: "1px solid rgba(124,90,246,0.4)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", color: "#a78bfa"
                            }}
                            title="Open full chat"
                        >
                            <Maximize2 size={14} color="#a78bfa" />
                        </button>
                        {/* Close */}
                        <button
                            onClick={() => setChatOpen(false)}
                            style={{
                                width: 32, height: 32, borderRadius: 8,
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer"
                            }}
                        >
                            <X size={14} color="#94a3b8" />
                        </button>
                    </div>
                </div>

                {/* CHAT WINDOW */}
                <div style={{ flex: 1, overflow: "hidden" }}>
                    <ChatWindow key={chatRefreshKey} selectedSessionId={null} onSessionCreated={() => {}} isDrawer={true} />
                </div>
            </div>

            {/* FLOATING CHAT BUTTON */}
            {!chatOpen && <button
                onClick={() => { setChatOpen(prev => !prev); setChatRefreshKey(k => k + 1); }}
                style={{
                    position: "fixed",
                    bottom: "28px",
                    right: "28px",
                    height: "52px",
                    width: "52px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #7C5AF6, #5B8DEF)",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(124,90,246,0.45)",
                    zIndex: 50,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease"
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.boxShadow = "0 6px 28px rgba(124,90,246,0.6)";
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(124,90,246,0.45)";
                }}
                title="Open AI Chat"
            >
                <MessageSquare size={22} color="#fff" />
            </button>}
        </div>
    );
};

export default MainLayout;