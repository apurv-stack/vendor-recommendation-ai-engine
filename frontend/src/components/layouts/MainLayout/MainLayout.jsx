import { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import { useTheme } from "../../../context/ThemeContext";

const MainLayout = ({ children }) => {
    const theme = useTheme();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebar, setMobileSidebar] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

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
        </div>
    );
};

export default MainLayout;