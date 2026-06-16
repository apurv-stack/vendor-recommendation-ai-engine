import {
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip
} from "recharts";

import Card from "../../common/Card/Card";
import { useTheme } from "../../../context/ThemeContext";

const VendorAnalytics = ({
    analytics = []
}) => {

    const theme = useTheme();

    const safeAnalytics =
        Array.isArray(analytics)
            ? analytics.map(item => ({
                day:
                    item.day ||
                    item.date ||
                    "Unknown",

                views: Number(
                    item.views ??
                    item.total_views ??
                    item.count ??
                    0
                ),

                growth: Number(
                    item.growth ?? 0
                ),

                engagement: Number(
                    item.engagement ?? 0
                )
            }))
            : [];

    return (

        <Card
            className="
                relative
                overflow-hidden
            "
        >

            {/* Background Glow */}

            <div
                style={{
                    position: "absolute",
                    top: "-120px",
                    right: "-120px",
                    width: "260px",
                    height: "260px",
                    borderRadius: "999px",
                    background:
                        "rgba(124,90,246,0.12)",
                    filter: "blur(80px)"
                }}
            />

            {/* Header */}

            <div
                style={{
                    position: "relative",
                    zIndex: 2,
                    marginBottom: "10px"
                }}
            >

                <p
                    style={{
                        textTransform: "uppercase",
                        letterSpacing: "1.5px",
                        fontSize: "10px",
                        fontWeight: 600,
                        color: "#7C5AF6",
                        marginBottom: "4px"
                    }}
                >
                    Analytics Intelligence
                </p>

                <h2
                    style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: theme.textPrimary,
                        marginBottom: "4px"
                    }}
                >
                    Analytics Overview
                </h2>

                <p
                    style={{
                        color: theme.textMuted,
                        fontSize: "12px"
                    }}
                >
                    Vendor performance analytics
                </p>

            </div>

            {/* Legend */}

            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginBottom: "8px"
                }}
            >

                {[
                    {
                        label: "Views",
                        color: "#7C5AF6"
                    },
                    {
                        label: "Growth",
                        color: "#22C55E"
                    },
                    {
                        label: "Engagement",
                        color: "#F472B6"
                    }
                ].map(item => (

                    <div
                        key={item.label}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            color: theme.textMuted,
                            fontSize: "10px"
                        }}
                    >

                        <div
                            style={{
                                width: "7px",
                                height: "7px",
                                borderRadius: "50%",
                                background:
                                    item.color
                            }}
                        />

                        {item.label}

                    </div>

                ))}

            </div>

            {/* Chart */}

            <div
                style={{
                    minHeight:
                        safeAnalytics.length === 0
                            ? "80px"
                            : "200px",
                    height:
                        safeAnalytics.length === 0
                            ? "80px"
                            : "200px",
                    width: "100%",
                    position: "relative",
                    zIndex: 2
                }}
            >

                {safeAnalytics.length === 0 ? (

                    <div
                        style={{
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: theme.textMuted,
                            fontSize: "10px"
                        }}
                    >
                        No analytics data available
                    </div>

                ) : (

                    <ResponsiveContainer
                        width="100%"
                        height={200}
                    >

                        <AreaChart
                            data={safeAnalytics}
                            margin={{
                                top: 10,
                                right: 10,
                                left: -20,
                                bottom: 0
                            }}
                        >

                            <defs>

                                <linearGradient
                                    id="viewsGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#7C5AF6"
                                        stopOpacity={0.35}
                                    />

                                    <stop
                                        offset="100%"
                                        stopColor="#7C5AF6"
                                        stopOpacity={0}
                                    />
                                </linearGradient>

                                <linearGradient
                                    id="growthGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#22C55E"
                                        stopOpacity={0.35}
                                    />

                                    <stop
                                        offset="100%"
                                        stopColor="#22C55E"
                                        stopOpacity={0}
                                    />
                                </linearGradient>

                                <linearGradient
                                    id="engagementGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#F472B6"
                                        stopOpacity={0.35}
                                    />

                                    <stop
                                        offset="100%"
                                        stopColor="#F472B6"
                                        stopOpacity={0}
                                    />
                                </linearGradient>

                            </defs>

                            <CartesianGrid
                                stroke={
                                    theme.cardBorder
                                }
                                strokeDasharray="4 4"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="day"
                                tick={{
                                    fill: theme.textMuted,
                                    fontSize: 10
                                }}
                                tickLine={false}
                                axisLine={false}
                                interval="preserveStartEnd"
                            />

                            <YAxis
                                tick={{
                                    fill: theme.textMuted,
                                    fontSize: 10
                                }}
                                tickLine={false}
                                axisLine={false}
                                width={30}
                            />

                            <Tooltip
                                contentStyle={{
                                    background:
                                        theme.cardBg,
                                    border:
                                        `1px solid ${theme.cardBorder}`,
                                    borderRadius:
                                        "16px",
                                    color:
                                        theme.textPrimary
                                }}
                            />

                            <Area
                                type="monotone"
                                dataKey="views"
                                stroke="#7C5AF6"
                                strokeWidth={2}
                                fill="url(#viewsGradient)"
                                dot={false}
                                activeDot={{
                                    r: 6,
                                    fill:
                                        "#7C5AF6"
                                }}
                            />

                            <Area
                                type="monotone"
                                dataKey="growth"
                                stroke="#22C55E"
                                strokeWidth={2}
                                fill="url(#growthGradient)"
                                dot={false}
                                activeDot={{
                                    r: 6,
                                    fill:
                                        "#22C55E"
                                }}
                            />

                            <Area
                                type="monotone"
                                dataKey="engagement"
                                stroke="#F472B6"
                                strokeWidth={2}
                                fill="url(#engagementGradient)"
                                dot={false}
                                activeDot={{
                                    r: 6,
                                    fill:
                                        "#F472B6"
                                }}
                            />

                        </AreaChart>

                    </ResponsiveContainer>

                )}

            </div>

        </Card>

    );

};

export default VendorAnalytics;