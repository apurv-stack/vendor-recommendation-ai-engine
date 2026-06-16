import {
    Star,
    MessageCircle,
    ShieldCheck
} from "lucide-react";

import Card from "../../common/Card/Card";
import { useTheme } from "../../../context/ThemeContext";

const VendorRating = ({
    rating = 0,
    totalReviews = 0,
    size = 16,
    showNumber = true
}) => {

    const theme = useTheme();

    const safeRating = Number(
        Math.min(
            5,
            Math.max(
                0,
                Number(rating) || 0
            )
        ).toFixed(1)
    );

    const safeReviews = Math.max(
        0,
        Number(totalReviews) || 0
    );

    const stars = [1, 2, 3, 4, 5];

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
                    top: "-40px",
                    right: "-40px",
                    width: "120px",
                    height: "120px",
                    borderRadius: "999px",
                    background:
                        "rgba(124,90,246,0.15)",
                    filter: "blur(40px)"
                }}
            />

            {/* Header */}

            <p
                style={{
                    position: "relative",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    fontSize: "11px",
                    fontWeight: 600,
                    marginBottom: "6px",
                    color: "#7C5AF6",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere"
                }}
            >
                Vendor Reputation
            </p>

            {/* Stars */}

            <div
                style={{
                    position: "relative",
                    display: "flex",
                    gap: "4px",
                    marginBottom: "8px"
                }}
            >
                {stars.map(star => (

                    <StarIcon
                        key={star}
                        filled={
                            star <=
                            Math.round(
                                safeRating
                            )
                        }
                        size={size}
                    />

                ))}
            </div>

            {showNumber && (

                <div
                    style={{
                        position: "relative",
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "8px"
                    }}
                >

                    <div>

                        <h2
                            style={{
                                fontSize: "22px",
                                fontWeight: 700,
                                color:
                                    theme.textPrimary,
                                margin: 0
                            }}
                        >
                            {safeRating.toFixed(1)}
                        </h2>

                        <p
                            style={{
                                marginTop: "4px",
                                fontSize: "11px",
                                whiteSpace: "nowrap",
                                color:
                                    theme.textMuted
                            }}
                        >
                            Average Rating
                        </p>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexDirection:
                                "column",
                            alignItems:
                                "flex-end",
                            gap: "8px"
                        }}
                    >

                        <div
                            style={{
                                display: "flex",
                                alignItems:
                                    "center",
                                gap: "8px",
                                fontSize:
                                    "14px",
                                color:
                                    theme.textMuted
                            }}
                        >
                            <MessageCircle
                                size={16}
                            />

                            {safeReviews} reviews
                        </div>

                        <div
                            style={{
                                display: "flex",
                                alignItems:
                                    "center",
                                gap: "6px",
                                fontSize:
                                    "12px",
                                color:
                                    "#22C55E"
                            }}
                        >
                            <ShieldCheck
                                size={14}
                            />
                            Backend verified
                        </div>

                    </div>

                </div>

            )}

        </Card>

    );
};

function StarIcon({
    filled,
    size
}) {

    return (

        <Star
            size={size}
            style={{
                color: filled
                    ? "#FACC15"
                    : "#64748B",
                fill: filled
                    ? "#FACC15"
                    : "transparent"
            }}
        />

    );
}

export default VendorRating;