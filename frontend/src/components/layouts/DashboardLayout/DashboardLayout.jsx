import { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";

const DashboardLayout = ({ children }) => {
    const theme = useTheme();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [mobile, setMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            const mobileScreen = window.innerWidth < 1024;
            setMobile(mobileScreen);
            if (!mobileScreen) setSidebarOpen(false);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => {
        if (mobile) {
            setSidebarOpen(previous => !previous);
        } else {
            setCollapsed(previous => !previous);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                overflow: "hidden",
                background: theme.pageBg
            }}
        >
            {/* MOBILE OVERLAY */}
            {sidebarOpen && mobile && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.4)",
                        backdropFilter: "blur(4px)",
                        zIndex: 40
                    }}
                    className="lg:hidden"
                />
            )}

            {/* SIDEBAR */}
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
            />

            {/* CONTENT */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                    height: "100vh",
                    transition: "margin-left 0.3s ease",
                    marginLeft: mobile ? "0" : collapsed ? "80px" : "240px"
                }}
            >
                {/* NAVBAR */}
                <Navbar
                    toggleSidebar={toggleSidebar}
                    setSidebarOpen={setSidebarOpen}
                />

                {/* MAIN */}
                <main
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        overflowX: "hidden",
                        padding: "clamp(12px, 3vw, 32px)",
                        background: theme.pageBg
                    }}
                >
                    <div style={{ maxWidth: "1650px", margin: "0 auto" }}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;