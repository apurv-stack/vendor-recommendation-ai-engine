import Card from "../common/Card/Card";

const VerificationQueue = ({
    vendors = [],
    onVerify
}) => {
    const pending =
        vendors.filter(
            (vendor) => !vendor.is_verified
        );

    return (
        <Card>
            <h2
                style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    marginBottom: "16px"
                }}
            >
                Verification Queue
            </h2>

            {pending.slice(0, 8).map((vendor) => (
                <div
                    key={vendor.vendor_id}
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 0",
                        borderBottom:
                            "1px solid rgba(148,163,184,0.15)"
                    }}
                >
                    <div>
                        <strong>{vendor.name}</strong>
                        <div>{vendor.city}</div>
                    </div>

                    <button
                        onClick={() =>
                            onVerify?.(
                                vendor.vendor_id
                            )
                        }
                    >
                        Verify
                    </button>
                </div>
            ))}
        </Card>
    );
};

export default VerificationQueue;