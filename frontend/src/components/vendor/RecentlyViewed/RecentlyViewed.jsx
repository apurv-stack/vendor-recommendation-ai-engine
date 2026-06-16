import Card from "../../common/Card/Card";
import { useTheme } from "../../../context/ThemeContext";

const RecentlyViewed = ({
    visitors = []
}) => {

    const theme = useTheme();

    const activityData = Array.isArray(visitors)
        ? visitors
        : [];

    return (

        <Card
            className="
                h-full
                relative
                overflow-hidden
            "
        >

            <div
                style={{
                    position: "absolute",
                    top: "-100px",
                    right: "-100px",
                    width: "220px",
                    height: "220px",
                    borderRadius: "999px",
                    background:
                        "rgba(124,90,246,0.08)",
                    filter: "blur(80px)"
                }}
            />

            <div
                style={{
                    position: "relative",
                    zIndex: 2
                }}
            >

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "24px",
                        flexWrap: "wrap",
                        gap: "8px"
                    }}
                >

                    <h3
                        style={{
                            fontSize: "clamp(16px, 3vw, 24px)",
                            fontWeight: 700,
                            color: theme.textPrimary
                        }}
                    >
                        Profile Activity
                    </h3>

                    <button
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "#7C5AF6",
                            fontWeight: 600,
                            cursor: "pointer"
                        }}
                    >
                        View All Activity
                    </button>

                </div>

                {activityData.length === 0 ? (

                    <div
                        style={{
                            minHeight: "220px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: theme.textMuted,
                            fontSize: "14px"
                        }}
                    >
                        No recent activity available
                    </div>

                ) : (

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px"
                        }}
                    >

                        {activityData.map((item, index) => (

                            <div
                                key={item.id || index}
                                style={{
                                    padding: "16px",
                                    borderRadius: "16px",
                                    border:
                                        `1px solid ${theme.cardBorder}`,
                                    background: theme.panelBg
                                }}
                            >

                                <pre
                                    style={{
                                        margin: 0,
                                        color: theme.textPrimary,
                                        fontSize: "13px",
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word"
                                    }}
                                >
                                    {JSON.stringify(
                                        item,
                                        null,
                                        2
                                    )}
                                </pre>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </Card>

    );

};

export default RecentlyViewed;