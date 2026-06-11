import { useState, useEffect  } from "react";
import ChatWindow from "../../components/chat/ChatWindow";
import ChatHistorySidebar from "../../components/chat/ChatHistorySidebar";
import RightInfoPanel from "../../components/chat/RightInfoPanel";
import { ThemeProvider } from "../../context/ThemeContext";

const ChatPageInner = () => {
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [sidebarRefresh, setSidebarRefresh] = useState(0);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1400);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth > 1400);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []); 

    const handleSessionSelect = (sessionId) => setSelectedSessionId(sessionId);

    const handleNewChat = () => {
        setSelectedSessionId(null);
        setRefreshKey(prev => prev + 1);
        setSidebarRefresh(prev => prev + 1);
    };

    const handleSessionCreated = () => setSidebarRefresh(prev => prev + 1);

    return (
        <div style={{
            display: "flex",
            height: "100vh",
            width: "100%",
            overflow: "hidden",
            background: "var(--app-bg, #0d0d1a)",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            position: "relative"
        }}>
            {/* LEFT SIDEBAR */}
            {!sidebarCollapsed && (
                <ChatHistorySidebar
                    refreshTrigger={sidebarRefresh}
                    onSessionSelect={handleSessionSelect}
                    onNewChat={handleNewChat}
                    selectedSessionId={selectedSessionId}
                    onCollapse={() => setSidebarCollapsed(true)}
                />
            )}

            {/* COLLAPSED TOGGLE */}
            {sidebarCollapsed && (
                <button
                    onClick={() => setSidebarCollapsed(false)}
                    style={{
                        position: "absolute", left: 12, top: 12, zIndex: 20,
                        width: 32, height: 32, borderRadius: 8,
                        background: "linear-gradient(135deg,rgba(124,90,246,0.3),rgba(167,139,250,0.2))",
                        border: "1px solid rgba(124,90,246,0.5)",
                        color: "#c4b5fd", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, boxShadow: "0 0 10px rgba(124,90,246,0.3)"
                    }}
                >›</button>
            )}

            {/* CENTER CHAT */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                height: "100vh",
                overflow: "hidden",
                background: "transparent"
            }}>
                <ChatWindow
                    key={refreshKey}
                    selectedSessionId={selectedSessionId}
                    onSessionCreated={handleSessionCreated}
                />
            </div>

            {/* RIGHT PANEL */}
            <div className="desktop-right-panel">
                {isDesktop && <RightInfoPanel />}
            </div>
        </div>
    );
};

const ChatPage = () => (
    <ThemeProvider>
        <ChatPageInner />
    </ThemeProvider>
);

export default ChatPage;