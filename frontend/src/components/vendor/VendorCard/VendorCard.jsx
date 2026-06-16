import {
    Star,
    MapPin,
    Eye,
    Users,
    Heart,
    BadgeCheck,
    ArrowUpRight
} from "lucide-react";

import Card from "../../common/Card/Card";
import Button from "../../common/Button/Button";
import { useTheme } from "../../../context/ThemeContext";

const VendorCard = ({
    vendor,
    onView,
    onSave
}) => {

    const theme = useTheme();

    const verified =
        vendor?.is_verified ?? false;

    const available =
        vendor?.is_available ?? true;

     const services =
        (vendor?.managed_teams || [])
            .flatMap(team => team?.services || []);
       

    const rating = Number(
        vendor?.avg_rating || 0
    ).toFixed(1);

    const reviews =
        vendor?.review_count || 0;

    return (
        <Card
            className="relative overflow-hidden group transition-all duration-300"
        >

            {/* Top Accent Bar */}

            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background:
                        "linear-gradient(90deg,#7C5AF6,#A78BFA,#60A5FA)"
                }}
            />

            {/* Glow */}

            <div
                style={{
                    position: "absolute",
                    top: "-60px",
                    right: "-60px",
                    width: "60px",
                    height: "60px",
                    borderRadius: "999px",
                    background: "rgba(124,90,246,0.12)",
                    filter: "blur(60px)"
                }}
            />

            {/* Header */}

            <div
                style={{
                    position: "relative",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "12px"
                }}
            >

                <div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            marginBottom: "8px"
                        }}
                    >

                        <h2
                            style={{
                                fontSize: "16px",
                                fontWeight: 700,
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                                color: theme.textPrimary,
                                margin: 0,
                                lineHeight: 1.3
                            }}
                        >
                            {vendor?.name || "Vendor"}
                        </h2>

                        {verified && (
                            <BadgeCheck
                                size={18}
                                color="#7C5AF6"
                            />
                        )}

                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            color: theme.textMuted,
                            fontSize: "13px",
                            fontWeight: 500
                        }}
                    >
                        <MapPin size={13} />

                        {vendor?.city ||
                            "Location unavailable"}
                    </div>

                </div>

                <button
                    onClick={() => onSave?.(vendor)}
                    style={{
                        fontSize: "13px",
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background: theme.panelBg,
                        border: `1px solid ${theme.cardBorder}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer"
                    }}
                >
                    <Heart
                        size={16}
                        color={
                            vendor?.is_saved
                                ? "#EF4444"
                                : theme.textMuted
                            }
                        fill={
                            vendor?.is_saved
                                ? "#EF4444"
                                : "none"
                        }
                    />
                </button>

            </div>

            {/* Status */}

            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginBottom: "12px"
                }}
            >

                {verified && (
                    <span
                        style={{
                            background:
                                "rgba(124,90,246,0.12)",
                            color: "#7C5AF6",
                            padding: "4px 10px",
                            borderRadius: "10px",
                            fontWeight: 600,
                            fontSize: "11px"
                        }}
                    >
                        Verified
                    </span>
                )}

                <span
                    style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontWeight: 600,
                        fontSize: "11px",
                        background: available
                            ? "rgba(34,197,94,0.12)"
                            : "rgba(239,68,68,0.12)",
                        color: available
                            ? "#22C55E"
                            : "#EF4444"
                    }}
                >
                    {available
                        ? "Available"
                        : "Unavailable"}
                </span>

            </div>

            {/* Description */}

            <p
                style={{
                    color: theme.textMuted,
                    lineHeight: 1.7,
                    marginBottom: "12px",
                    minHeight: "40px",
                    fontSize: "12px"
                }}
            >
                {vendor?.description ||
                    "No description available"}
            </p>

            {/* Pricing */}

            <div
                style={{
                    background: theme.panelBg,
                    border: `1px solid ${theme.cardBorder}`,
                    borderRadius: "18px",
                    padding: "10px 14px",
                    marginBottom: "14px",
                    whiteSpace: "normal",
                    wordBreak: "break-word"
                }}
            >

                <p
                    style={{
                        color: theme.textMuted,
                        fontSize: "13px",
                        marginBottom: "4px"
                    }}
                >
                    Pricing Range
                </p>

                <h3
                    style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: theme.textPrimary,
                        margin: 0
                    }}
                >
                    ₹{vendor?.price_min ?? 0}
                    {" - "}
                    ₹{vendor?.price_max ?? 0}
                </h3>

            </div>

            {/* Services */}

            {services.length > 0 && (
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "6px",
                        marginBottom: "12px"
                    }}
                >

                    {services
                        .slice(0, 3)
                        .map((service, index) => (

                            <span
                                key={
                                    service.service_id ||
                                    index
                                }
                                style={{
                                    padding: "5px 10px",
                                    background:
                                        theme.panelBg,
                                    border:
                                        `1px solid ${theme.cardBorder}`,
                                    borderRadius: "14px",
                                    fontSize: "10px",
                                    fontWeight: 500,
                                    color:
                                        theme.textSecondary
                                }}
                            >
                                {service.name || service.service_name || service}
                            </span>

                        ))}

                </div>
            )}

            {/* Metrics */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(3, minmax(0, 1fr))",
                    gap: "6px",
                    marginBottom: "14px"
                }}
            >

                <Metric
                    icon={<Users size={16} />}
                    value={reviews}
                    label="Reviews"
                    theme={theme}
                    color="#7C5AF6"
                />

                <Metric
                    icon={<Eye size={16} />}
                    value={services.length}
                    label="Services"
                    theme={theme}
                    color="#60A5FA"
                />

                <Metric
                    icon={
                        <Star
                            size={14}
                            fill="#FACC15"
                            color="#FACC15"
                        />
                    }
                    value={rating}
                    label="Rating"
                    theme={theme}
                    color="#FACC15"
                />

            </div>

            <div style={{ width: "100%" }}>
                <Button
                    onClick={() => onView?.(vendor)}
                    icon={<ArrowUpRight />}
                    style={{ width: "100%" }}
                >
                    View Details
                </Button>
            </div>

        </Card>
    );
};

const Metric = ({
    icon,
    value,
    label,
    theme,
    color
}) => (
    <div
        style={{
            background: theme.panelBg,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: "12px",
            padding: "10px",
            textAlign: "center"
        }}
    >

        <div
            style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "4px",
                color
            }}
        >
            {icon}
        </div>

        <p
            style={{
                fontWeight: 700,
                fontSize: "14px",
                color: theme.textPrimary,
                marginBottom: "4px"
            }}
        >
            {value}
        </p>

        <p
            style={{
                fontSize: "11px",
                color: theme.textMuted
            }}
        >
            {label}
        </p>

    </div>
);

export default VendorCard;