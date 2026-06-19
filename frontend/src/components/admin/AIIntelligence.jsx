import Card from "../common/Card/Card";
import { useTheme } from "../../context/ThemeContext";
import { Sparkles, Target, Camera, MapPin } from "lucide-react";

const AIIntelligence = ({ vendors = [] }) => {
    const theme = useTheme();

    // Derive "most recommended" category/city from the vendor data we have
    const categoryStats = {};
    const cityStats = {};

    vendors.forEach((vendor) => {
        const cats = vendor.all_categories
            ? vendor.all_categories.split(",").map(c => c.trim()).filter(Boolean)
            : [vendor.category || "Other"];
        cats.forEach(cat => {
            categoryStats[cat] = (categoryStats[cat] || 0) + 1;
        });

        const city = vendor.city || "Unknown";
        cityStats[city] = (cityStats[city] || 0) + 1;
    });

    const total = vendors.length || 1;

    const topCategoryEntry = Object.entries(categoryStats).sort((a, b) => b[1] - a[1])[0];
    const topCityEntry = Object.entries(cityStats).sort((a, b) => b[1] - a[1])[0];

    const topCategory = topCategoryEntry ? topCategoryEntry[0] : "—";
    const topCategoryPct = topCategoryEntry ? ((topCategoryEntry[1] / total) * 100).toFixed(0) : 0;

    const topCity = topCityEntry ? topCityEntry[0] : "—";
    const topCityPct = topCityEntry ? ((topCityEntry[1] / total) * 100).toFixed(0) : 0;

    const items = [
        {
            label: "AI Recommendation Engine",
            value: "Active",
            trend: "Vendor recommendation service enabled",
            trendColor: "#22C55E",
            icon: <Sparkles size={18} />,
            iconColor: "#7C5AF6",
        },
        {
            label: "Recommendation Analytics",
            value: "Coming Soon",
            trend: "Awaiting recommendation history tracking",
            trendColor: theme.textMuted,
            icon: <Target size={18} />,
            iconColor: "#22C55E",
        },
        {
            label: "Most Recommended Category",
            value: topCategory,
            valueCapitalize: true,
            trend: `${topCategoryPct}% of total recs`,
            trendColor: theme.textMuted,
            icon: <Camera size={18} />,
            iconColor: "#3B82F6",
        },
        {
            label: "Most Recommended City",
            value: topCity,
            trend: `${topCityPct}% of total recs`,
            trendColor: theme.textMuted,
            icon: <MapPin size={18} />,
            iconColor: "#F59E0B",
        },
    ];

    return (
        <Card>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: theme.textPrimary, margin: "0 0 16px" }}>
                AI Intelligence Overview
            </h2>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "12px"
            }}>
                {items.map((item) => (
                    <Card
                        key={item.label}
                        style={{
                            padding: "16px",
                            background: theme.panelBg,
                            position: "relative",
                            overflow: "hidden",
                        }}
                    >
                        <div style={{
                            position: "absolute",
                            top: "12px", right: "12px",
                            width: "32px", height: "32px",
                            borderRadius: "10px",
                            background: `${item.iconColor}1F`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: item.iconColor,
                        }}>
                            {item.icon}
                        </div>

                        <p style={{
                            fontSize: "11px", color: theme.textMuted,
                            margin: "0 0 8px", paddingRight: "36px"
                        }}>
                            {item.label}
                        </p>

                        <h3 style={{
                            fontSize: "22px", fontWeight: 800,
                            color: theme.textPrimary, margin: "0 0 6px",
                            textTransform: item.valueCapitalize ? "capitalize" : "none"
                        }}>
                            {item.value}
                        </h3>

                        <p style={{ fontSize: "11px", color: item.trendColor, margin: 0, fontWeight: 600 }}>
                            {item.trend}
                        </p>
                    </Card>
                ))}
            </div>
        </Card>
    );
};

export default AIIntelligence;