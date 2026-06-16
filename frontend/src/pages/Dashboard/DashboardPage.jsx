import { useState, useEffect, useMemo } from "react";
import { useTheme } from "../../context/ThemeContext";
import axiosInstance from "../../api/axiosInstance";
import useAuth from "../../hooks/useAuth";

import MainLayout from "../../components/layouts/MainLayout/MainLayout";
import VendorAnalytics from "../../components/vendor/VendorAnalytics/VendorAnalytics";
import Skeleton from "../../components/common/Skeleton/Skeleton";
import Card from "../../components/common/Card/Card";
import KpiCard from "../../components/common/KpiCard/KpiCard";

import {
    Eye, Users, TrendingUp, IndianRupee,
    Sparkles, Eye as EyeIcon, Zap, UserCheck,
    Bookmark
} from "lucide-react";

const DashboardPage = () => {
    const { user } = useAuth();
    const theme = useTheme();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [vendorName, setVendorName] = useState("");
    const [dashboard, setDashboard] = useState({
        views: 0,
        followers: 0,
        engagement: 0,
        growth: 0,
        avgPricing: 0,
        analytics: [],
        notifications: [],
        recentActivity: []
    });

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    }, []);

    const greetingEmoji = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "🌅";
        if (hour < 18) return "👋";
        return "🌙";
    }, []);

    useEffect(() => { fetchDashboard(); }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const [profileResponse, pricingResponse, analyticsResponse, notificationResponse] =
                await Promise.all([
                    axiosInstance.get("/vendors/profile"),
                    axiosInstance.get("/vendors/profile/pricing").catch(() => ({ data: { avg_pricing: 0 } })),
                    axiosInstance.get("/vendors/profile/analytics").catch(() => ({ data: { analytics: [], growth: 0, followers: 0, views: 0, engagement: 0 } })),
                    axiosInstance.get("/vendors/notifications").catch(() => ({ data: { notifications: [] } }))
                ]);

            const vendor = profileResponse.data?.vendor || profileResponse.data?.data?.vendor || {};
            const analytics = analyticsResponse.data || {};
            const pricing = pricingResponse.data || {};
            const notificationData = notificationResponse.data?.notifications || [];

            const avgPricing = pricing.avg_pricing || (
                vendor.price_min && vendor.price_max
                    ? Math.floor((vendor.price_min + vendor.price_max) / 2)
                    : 0
            );

            setVendorName(vendor.name || user?.full_name || "Vendor");
            setDashboard({
                views: analytics.views || 0,
                followers: analytics.followers || 0,
                engagement: analytics.engagement || 0,
                growth: analytics.growth || 0,
                avgPricing,
                analytics: analytics.analytics || [],
                notifications: notificationData,
                recentActivity: analytics.recent_activity || notificationData.slice(0, 5)
            });
        } catch (error) {
            console.log("Dashboard failed", error);
            setError(
                error?.response?.data?.detail ||
                error?.response?.data?.message ||
                "Failed to load dashboard"
            );
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { title: "Views",      value: dashboard.views,                                          icon: <Eye size={20} />,          color: "#60A5FA" },
        { title: "Followers",  value: dashboard.followers,                                      icon: <Users size={20} />,        color: "#8B5CF6" },
        { title: "Engagement", value: `${dashboard.engagement}%`,                               icon: <TrendingUp size={20} />,   color: "#10B981" },
        { title: "Growth",     value: `${dashboard.growth}%`,                                   icon: <TrendingUp size={20} />,   color: "#22C55E" },
        { title: "Pricing",    value: dashboard.avgPricing ? `₹${dashboard.avgPricing}` : "₹0", icon: <IndianRupee size={20} />, color: "#F59E0B" }
    ];

    const profileActivityItems =

        dashboard.notifications.length > 0

            ? dashboard.notifications.slice(0,4).map(item => ({

                label: item.title,

                detail: item.message,

                time: new Date(
                    item.created_at
                ).toLocaleString(),

                icon: <Zap size={16} />,

                color: "#7C5AF6"

            }))

            : [];

    const recentActivityItems =

    dashboard.notifications.length > 0

    ? dashboard.notifications.slice(0,5).map(item => ({

        activity: item.title,

        details: item.message,

        time: new Date(
            item.created_at
        ).toLocaleString(),

        icon: <Zap size={15} />,

        color: "#7C5AF6"

    }))

    : [];

    return (
        <MainLayout>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                {/* PAGE HEADER */}
                <div
                    style={{
                        background: theme.cardBg,
                        border: `1px solid ${theme.cardBorder}`,
                        borderRadius: "18px",
                        padding: "14px 18px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                        flexWrap: "wrap"
                    }}
                >
                    <div>
                        <h1 style={{ fontSize: "clamp(16px, 4vw, 24px)", fontWeight: 700, color: theme.textPrimary, margin: 0, lineHeight: 1.2, wordBreak: "break-word" }}>
                            {greeting}, {vendorName} {greetingEmoji}
                        </h1>
                        <p style={{ color: theme.textMuted, marginTop: "4px", fontSize: "13px" }}>
                            Monitor vendor analytics growth and business intelligence.
                        </p>
                    </div>
                    <button
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 16px",
                            borderRadius: "10px",
                            border: `1px solid rgba(124,90,246,0.3)`,
                            background: "rgba(124,90,246,0.10)",
                            color: "#7C5AF6",
                            fontWeight: 600,
                            fontSize: "12px",
                            cursor: "pointer",
                            whiteSpace: "nowrap"
                        }}
                    >
                        <Sparkles size={16} />
                        AI Insights
                    </button>
                </div>
                
                {error && (
                    <Card>
                        <p
                            style={{
                                color: "#EF4444",
                                fontWeight: 600,
                                fontSize: "13px"
                            }}
                        >
                            {error}
                        </p>
                    </Card>
                )}
                {/* KPI CARDS */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                        gap: "12px"
                    }}
                >
                    {stats.map(card => (
                        <KpiCard
                            key={card.title}
                            title={card.title}
                            value={loading ? <Skeleton /> : card.value}
                            icon={card.icon}
                            color={card.color}
                        />
                    ))}
                </div>

                {/* ANALYTICS + PROFILE ACTIVITY */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                    <VendorAnalytics analytics={dashboard.analytics} />

                    <Card style={{ padding: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                            <h3 style={{ fontWeight: 700, fontSize: "16px", color: theme.textPrimary, margin: 0 }}>
                                Profile Activity
                            </h3>
                            <button style={{ fontSize: "13px", color: "#7C5AF6", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>
                                View All Activity
                            </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {profileActivityItems.map((item, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "12px",
                                        padding: "8px 0",
                                        borderBottom: i < profileActivityItems.length - 1 ? `1px solid ${theme.cardBorder}` : "none"
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "28px",
                                            height: "28px",
                                            borderRadius: "10px",
                                            background: `${item.color}18`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: item.color,
                                            flexShrink: 0,
                                            marginTop: "2px"
                                        }}
                                    >
                                        {item.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600, fontSize: "13px", color: theme.textPrimary, margin: "0 0 2px 0" }}>
                                            {item.label}
                                        </p>
                                        <p style={{ fontSize: "12px", color: theme.textMuted, margin: "0 0 2px 0" }}>
                                            {item.detail}
                                        </p>
                                        <p style={{ fontSize: "11px", color: theme.textFaint, margin: 0 }}>
                                            {item.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* TOP CATEGORIES + AI RECOMMENDATION ENGINE */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                    <Card style={{ padding: "16px" }}>
                        <h3 style={{ fontWeight: 700, fontSize: "16px", color: theme.textPrimary, margin: "0 0 12px 0" }}>
                            Top Categories
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px", padding: "20px 0" }}>
                            <div
                                style={{
                                    width: "70px",
                                    height: "70px",
                                    borderRadius: "50%",
                                    border: `12px solid rgba(124,90,246,0.15)`,
                                    borderTop: `12px solid #7C5AF6`,
                                    borderRight: `12px solid #A78BFA`
                                }}
                            />
                            <p style={{ fontWeight: 600, color: theme.textPrimary, margin: 0 }}>No data available</p>
                            <p style={{ fontSize: "13px", color: theme.textMuted, margin: 0, textAlign: "center" }}>
                                Start exploring vendors to see insights
                            </p>
                        </div>
                    </Card>

                    <Card style={{ padding: "16px", position: "relative", overflow: "hidden" }}>
                        <div
                            style={{
                                position: "absolute",
                                top: 0, right: 0,
                                width: "120px", height: "120px",
                                borderRadius: "50%",
                                background: "rgba(124,90,246,0.12)",
                                filter: "blur(60px)"
                            }}
                        />
                        <div style={{ position: "relative", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                                    <Sparkles size={18} color="#7C5AF6" />
                                    <p style={{ fontWeight: 700, fontSize: "15px", color: "#7C5AF6", margin: 0 }}>
                                        AI Recommendation Engine
                                    </p>
                                </div>
                                <p style={{ fontSize: "14px", color: theme.textMuted, margin: "0 0 20px 0", lineHeight: 1.6 }}>
                                    Get smart vendor recommendations based on your preferences and requirements.
                                </p>
                                <button
                                    style={{
                                        padding: "10px 20px",
                                        borderRadius: "12px",
                                        background: "linear-gradient(135deg, #7C5AF6, #A78BFA)",
                                        color: "#fff",
                                        fontWeight: 600,
                                        fontSize: "13px",
                                        border: "none",
                                        cursor: "pointer"
                                    }}
                                >
                                    Explore Recommendations
                                </button>
                            </div>
                            <div
                                style={{
                                    width: "70px", height: "70px",
                                    borderRadius: "20px",
                                    background: "rgba(124,90,246,0.15)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0
                                }}
                            >
                                <Sparkles size={36} color="#7C5AF6" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* RECENT ACTIVITY TABLE */}
                <Card style={{ padding: "16px" }}>
                    <h3 style={{ fontWeight: 700, fontSize: "16px", color: theme.textPrimary, margin: "0 0 20px 0" }}>
                        Recent Activity
                    </h3>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "2fr 1fr",
                            padding: "8px 12px",
                            borderRadius: "10px",
                            background: theme.panelBg,
                            marginBottom: "8px"
                        }}
                        className="sm:grid-cols-[2fr_2fr_1fr]"
                    >
                        {["Activity", "Details", "Time"].map((h, i) => (
                            <p
                                key={h}
                                className={i === 1 ? "hidden sm:block" : ""}
                                style={{ fontSize: "12px", fontWeight: 600, color: theme.textMuted, margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}
                            >
                                {h}
                            </p>
                        ))}
                    </div>

                    {recentActivityItems.length === 0

                        ?

                        <div
                            style={{
                                padding:"20px",
                                textAlign:"center",
                                color:theme.textMuted
                                }}
                            >
                                No recent activity found
                            </div>

                        :
                    
                        recentActivityItems.map((item, i) => (
                            <div
                                key={i}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "2fr 1fr",
                                    padding: "10px 12px",
                                    borderBottom: i < recentActivityItems.length - 1 ? `1px solid ${theme.cardBorder}` : "none",
                                    alignItems: "center"
                                }}
                                className="sm:grid-cols-[2fr_2fr_1fr]"
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div
                                        style={{
                                        width: "24px", height: "24px",
                                        borderRadius: "8px",
                                        background: `${item.color}18`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: item.color,
                                        flexShrink: 0
                                    }}
                                >
                                    {item.icon}
                                </div>
                                <span style={{ fontSize: "14px", fontWeight: 500, color: theme.textPrimary }}>
                                    {item.activity}
                                </span>
                            </div>
                            <span className="hidden sm:block" style={{ fontSize: "13px", color: theme.textMuted }}>
                                {item.details}
                            </span>
                            <span style={{ fontSize: "13px", color: theme.textFaint }}>
                                {item.time}
                            </span>
                        </div>
                        ))}
                </Card>

            </div>
        </MainLayout>
    );
};

export default DashboardPage;