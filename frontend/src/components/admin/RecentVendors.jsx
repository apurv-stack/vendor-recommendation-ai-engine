import Card from "../common/Card/Card";

const RecentVendors = ({ vendors = [] }) => {
    const recent = vendors.slice(0, 8);

    return (
        <Card>
            <h2
                style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    marginBottom: "16px"
                }}
            >
                Recent Vendors
            </h2>

            {recent.map((vendor) => (
                <div
                    key={vendor.vendor_id}
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "10px 0",
                        borderBottom:
                            "1px solid rgba(148,163,184,0.15)"
                    }}
                >
                    <div>
                        <strong>{vendor.name}</strong>

                        <div
                            style={{
                                fontSize: "12px",
                                opacity: 0.7
                            }}
                        >
                            {vendor.city}
                        </div>
                    </div>

                    <div>
                        {vendor.is_verified
                            ? "Verified"
                            : "Pending"}
                    </div>
                </div>
            ))}
        </Card>
    );
};

export default RecentVendors;