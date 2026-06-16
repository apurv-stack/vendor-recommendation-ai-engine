import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatWindow from "../../components/chat/ChatWindow";
import ChatHistorySidebar from "../../components/chat/ChatHistorySidebar";
import RightInfoPanel from "../../components/chat/RightInfoPanel";
import Sidebar from "../../components/layouts/Sidebar/Sidebar";

const ChatPageInner = () => {
    const navigate = useNavigate();
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [sidebarRefresh, setSidebarRefresh] = useState(0);
    const [chatSidebarCollapsed, setChatSidebarCollapsed] = useState(false);
    const [appSidebarCollapsed, setAppSidebarCollapsed] = useState(true);
    const [appSidebarOpen, setAppSidebarOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1400);
    const [isNarrow, setIsNarrow] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            setIsDesktop(w > 1400);
            setIsNarrow(w < 768);
            if (w < 768) {
                setChatSidebarCollapsed(true);
                setAppSidebarCollapsed(true);
            }
        };
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
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

            {/* APP SIDEBAR — collapsed icon rail on chat page */}
            {appSidebarOpen && (
                <div
                    onClick={() => setAppSidebarOpen(false)}
                    style={{
                        position: "fixed", inset: 0,
                        background: "rgba(0,0,0,0.4)",
                        backdropFilter: "blur(4px)",
                        zIndex: 49
                    }}
                />
            )}
            {!isNarrow && (
                <div style={{
                    position: "fixed",
                    top: 0, left: 0,
                    height: "100vh",
                    zIndex: 50,
                    transform: "translateX(0)"
                }}>
                    <Sidebar
                        sidebarOpen={true}
                        setSidebarOpen={setAppSidebarOpen}
                        collapsed={appSidebarCollapsed}
                        setCollapsed={setAppSidebarCollapsed}
                    />
                </div>
            )}

            {/* MAIN CHAT AREA — offset by app sidebar width */}
            <div style={{
                marginLeft: isNarrow ? "0px" : appSidebarCollapsed ? "64px" : "200px",
                flex: 1,
                display: "flex",
                height: "100vh",
                overflow: "hidden",
                transition: "margin-left 0.3s ease"
            }}>
                {/* CHAT HISTORY SIDEBAR */}
                {!chatSidebarCollapsed && (
                    <ChatHistorySidebar
                        refreshTrigger={sidebarRefresh}
                        onSessionSelect={handleSessionSelect}
                        onNewChat={handleNewChat}
                        selectedSessionId={selectedSessionId}
                        onCollapse={() => setChatSidebarCollapsed(true)}
                    />
                )}

            {/* CENTER CHAT */}
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                    height: "100vh",
                    overflow: "hidden"
                }}>
                    <ChatWindow
                        key={refreshKey}
                        selectedSessionId={selectedSessionId}
                        onSessionCreated={handleSessionCreated}
                        onToggleSidebar={() => setChatSidebarCollapsed(prev => !prev)}
                    />
                </div>

                {/* RIGHT PANEL */}
                {isDesktop && <RightInfoPanel />}
            </div>
        </div>
    );
};

const ChatPage = () => <ChatPageInner />;

export default ChatPage;