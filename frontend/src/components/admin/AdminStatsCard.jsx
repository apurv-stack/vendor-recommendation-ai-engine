import KpiCard from "../common/KpiCard/KpiCard";
import {
    Building2, BadgeCheck, ShieldCheck, Activity,
    Users, TrendingUp
} from "lucide-react";

const AdminStatsCards = ({
    total = 0,
    verified = 0,
    pending = 0,
    active = 0,
    registeredUsers = 0,
    activeUsers = 0
}) => {
    const stats = [
        {
            title: "Total Vendors",
            value: total,
            color: "#7C3AED",
            icon: <Building2 size={16} />,
            subtitle: `${verified} verified`
        },
        {
            title: "Verified Vendors",
            value: verified,
            color: "#10B981",
            icon: <BadgeCheck size={16} />,
            subtitle: total ? `${((verified / total) * 100).toFixed(1)}% of total` : "0% of total"
        },
        {
            title: "Active Vendors",
            value: active,
            color: "#3B82F6",
            icon: <Activity size={16} />,
            subtitle: total ? `${((active / total) * 100).toFixed(1)}% of total` : "0% of total"
        },
        {
            title: "Pending Verification",
            value: pending,
            color: "#F59E0B",
            icon: <ShieldCheck size={16} />,
            subtitle: "Need review"
        },
        {
            title: "Registered Users",
            value: registeredUsers,
            color: "#6366F1",
            icon: <Users size={16} />,
            subtitle: "Total signups"
        },
        {
            title: "Active Users",
            value: activeUsers,
            color: "#14B8A6",
            icon: <TrendingUp size={16} />,
            subtitle: "Account active"
        },
    ];

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns:
                    "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "12px",
                marginBottom: "20px"
            }}
        >
            {stats.map((item) => (
                <KpiCard
                    key={item.title}
                    title={item.title}
                    value={item.value}
                    color={item.color}
                    icon={item.icon}
                    subtitle={item.subtitle}
                />
            ))}
        </div>
    );
};

export default AdminStatsCards;