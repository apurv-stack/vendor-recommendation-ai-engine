import KpiCard from "../common/KpiCard/KpiCard";

const AdminStatsCards = ({
    total = 0,
    verified = 0,
    pending = 0,
    active = 0
}) => {

    const stats = [
        {
            title: "Total Vendors",
            value: total,
            color: "#7C3AED",
            subtitle: `${verified} verified`
        },
        {
            title: "Verified Vendors",
            value: verified,
            color: "#10B981",
            subtitle: "Approved vendors"
        },
        {
            title: "Pending Review",
            value: pending,
            color: "#F59E0B",
            subtitle: "Awaiting verification"
        },
        {
            title: "Active Vendors",
            value: active,
            color: "#3B82F6",
            subtitle: "Currently active"
        }
    ];

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
                marginBottom: "20px"
            }}
        >
            {stats.map((item) => (
                <KpiCard
                    key={item.title}
                    title={item.title}
                    value={item.value}
                    color={item.color}
                    subtitle={item.subtitle}
                />
            ))}
        </div>
    );
};

export default AdminStatsCards;