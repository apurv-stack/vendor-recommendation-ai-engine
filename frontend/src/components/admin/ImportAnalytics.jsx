import Card from "../common/Card/Card";

const ImportAnalytics = () => {
    return (
        <Card>
            <h2
                style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    marginBottom: "16px"
                }}
            >
                Import Analytics
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
                    <div>Total Imported</div>
                    <h3>10000</h3>
                </Card>

                <Card style={{ padding: "14px" }}>
                    <div>Successful Imports</div>
                    <h3>9850</h3>
                </Card>

                <Card style={{ padding: "14px" }}>
                    <div>Failed Imports</div>
                    <h3>150</h3>
                </Card>

                <Card style={{ padding: "14px" }}>
                    <div>Success Rate</div>
                    <h3>98.5%</h3>
                </Card>
            </div>
        </Card>
    );
};

export default ImportAnalytics;