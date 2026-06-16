import {
    IndianRupee,
    TrendingUp,
    TrendingDown,
    Wallet,
    BarChart3,
    BadgeDollarSign
} from "lucide-react";

import Card from "../../common/Card/Card";
import { useTheme } from "../../../context/ThemeContext";

const VendorPricing = ({
    minPrice,
    maxPrice,
    averageMarketPrice = 45000
}) => {

    const theme = useTheme();

    const vendorMin = Math.max(
        0,
        Number(minPrice) || 0
    );

    const vendorMax = Math.max(
        vendorMin,
        Number(maxPrice) || 0
    );

    const hasPricing =
        vendorMin > 0 ||
        vendorMax > 0;

    const averageVendorPrice =
        hasPricing
            ? Math.floor(
                (
                    vendorMin +
                    vendorMax
                ) / 2
            )
            : 0;

    const difference =
        averageVendorPrice -
        averageMarketPrice;

    const aboveMarket =
        difference >= 0;

    const trend =
        aboveMarket
            ? "up"
            : "down";

    return (

        <Card
            className="
                relative
                overflow-hidden
            "
        >

            {/* Glow */}

            <div
                style={{
                    position: "absolute",
                    top: "-80px",
                    right: "-80px",
                    width: "240px",
                    height: "240px",
                    borderRadius: "999px",
                    background:
                        "rgba(124,90,246,0.12)",
                    filter: "blur(70px)"
                }}
            />

            {/* Header */}

            <div
                style={{
                    position: "relative",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "16px",
                    flexWrap: "wrap",
                    marginBottom: "16px"
                }}
            >

                <div>

                    <p
                        style={{
                            textTransform: "uppercase",
                            letterSpacing: "1.5px",
                            fontSize: "10px",
                            fontWeight: 600,
                            color: "#7C5AF6",
                            marginBottom: "8px"
                        }}
                    >
                        Pricing Intelligence
                    </p>

                    <h2
                        style={{
                            fontSize: "18px",
                            fontWeight: 700,
                            color: theme.textPrimary,
                            marginBottom: "6px"
                        }}
                    >
                        Vendor Pricing Analytics
                    </h2>

                    <p
                        style={{
                            color: theme.textMuted
                        }}
                    >
                        AI powered pricing benchmarks
                        and marketplace positioning
                    </p>

                </div>

                <div
                    style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "14px",
                        background:
                            "rgba(124,90,246,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <Wallet
                        size={20}
                        color="#7C5AF6"
                    />
                </div>

            </div>

            {/* KPI Cards */}

            <div
                className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    lg:grid-cols-3
                    gap-4
                    mb-5
                "
            >

                <PriceCard
                    theme={theme}
                    title="Vendor Range"
                    value={
                        hasPricing
                            ? `₹${vendorMin} - ₹${vendorMax}`
                            : "Unavailable"
                    }
                    description="Vendor service pricing"
                    icon={<IndianRupee />}
                />

                <PriceCard
                    theme={theme}
                    title="Average Vendor Price"
                    value={
                        hasPricing
                            ? `₹${averageVendorPrice}`
                            : "Unavailable"
                    }
                    description="AI calculated average"
                    highlight
                    icon={<Wallet />}
                />

                <PriceCard
                    theme={theme}
                    title="Market Benchmark"
                    value={`₹${averageMarketPrice}`}
                    description={
                        hasPricing
                            ? (
                                aboveMarket
                                    ? `₹${Math.abs(difference)} above benchmark`
                                    : `₹${Math.abs(difference)} below benchmark`
                            )
                            : "No pricing available"
                    }
                    trend={trend}
                    icon={
                        trend === "up"
                            ? <TrendingUp />
                            : <TrendingDown />
                    }
                />

            </div>

            {/* Insight */}

            <div
                style={{
                    background: theme.panelBg,
                    border: `1px solid ${theme.cardBorder}`,
                    borderRadius: "18px",
                    padding: "16px",

                    display: "flex",
                    justifyContent: "space-between",
                    gap: "24px",
                    flexWrap: "wrap"
                }}
            >

                <div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "6px"
                        }}
                    >

                        <BarChart3
                            size={18}
                            color="#7C5AF6"
                        />

                        <h4
                            style={{
                                fontWeight: 700,
                                color: theme.textPrimary
                            }}
                        >
                            Pricing Insight
                        </h4>

                    </div>

                    <p
                        style={{
                            color: theme.textMuted,
                            lineHeight: 1.8
                        }}
                    >
                        {
                            !hasPricing
                                ? "Pricing information not available yet."
                                : aboveMarket
                                    ? "Vendor pricing indicates premium positioning."
                                    : "Vendor pricing remains competitive."
                        }
                    </p>

                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "#7C5AF6",
                        fontWeight: 600
                    }}
                >
                    <BadgeDollarSign />
                    AI Pricing Engine
                </div>

            </div>

        </Card>
    );
};

function PriceCard({
    title,
    value,
    description,
    icon,
    highlight = false,
    trend,
    theme
}) {

    return (

        <div
            style={{
                background: theme.panelBg,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: "18px",
                padding: "14px 16px"
            }}
        >

            <p
                style={{
                    color: theme.textMuted,
                    fontSize: "11px",
                    marginBottom: "8px"
                }}
            >
                {title}
            </p>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "12px"
                }}
            >

                <div
                    style={{
                        color: highlight
                            ? "#7C5AF6"
                            : theme.textSecondary
                    }}
                >
                    {icon}
                </div>

                <h3
                    style={{
                        fontSize: "clamp(13px, 2.5vw, 18px)",
                        fontWeight: 700,
                        color: highlight
                            ? "#7C5AF6"
                            : theme.textPrimary,
                        wordBreak: "break-word"
                    }}
                >
                    {value}
                </h3>

            </div>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "11px",
                    color: theme.textMuted
                }}
            >

                {trend && icon}

                {description}

            </div>

        </div>

    );
}

export default VendorPricing;