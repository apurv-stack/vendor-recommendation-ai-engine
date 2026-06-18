import Card from "../common/Card/Card";

const AIIntelligence = ({ vendors = [] }) => {
    const avgRating =
        vendors.length > 0
            ? (
                  vendors.reduce(
                      (sum, v) => sum + (v.avg_rating || 0),
                      0
                  ) / vendors.length
              ).toFixed(1)
            : "0";

    return (
        <Card>
            <h2
                style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    marginBottom: "16px"
                }}
            >
                AI Intelligence Overview
            </h2>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit,minmax(180px,1fr))",
                    gap: "12px"
                }}
            >
                <Card style={{ padding: "14px" }}>
                    <div>Recommendation Requests</div>
                    <h3>{vendors.length * 9}</h3>
                </Card>

                <Card style={{ padding: "14px" }}>
                    <div>Average Rating</div>
                    <h3>{avgRating}</h3>
                </Card>

                <Card style={{ padding: "14px" }}>
                    <div>Recommendation Accuracy</div>
                    <h3>87%</h3>
                </Card>

                <Card style={{ padding: "14px" }}>
                    <div>AI Sessions</div>
                    <h3>{vendors.length * 3}</h3>
                </Card>
            </div>
        </Card>
    );
};

export default AIIntelligence;