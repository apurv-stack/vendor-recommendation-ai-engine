import {
    Shield,
    Sparkles,
    BrainCircuit,
    TrendingUp
} from "lucide-react";

import { useTheme } from "../../../context/ThemeContext";

const AuthLayout = ({
    subtitle,
    children
}) => {

    const theme = useTheme();

    return (

        <div
            style={{
                minHeight: "100vh",
                position: "relative",
                overflow: "hidden",

                background: theme.pageBg,

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                padding: "40px 24px"
            }}
        >

            {/* Background Glow */}

            <div
                style={{
                    position: "absolute",
                    top: "-120px",
                    right: "-120px",
                    width: "380px",
                    height: "380px",
                    borderRadius: "999px",
                    background: "rgba(124,90,246,0.15)",
                    filter: "blur(80px)"
                }}
            />

            <div
                style={{
                    position: "absolute",
                    bottom: "-120px",
                    left: "-120px",
                    width: "320px",
                    height: "320px",
                    borderRadius: "999px",
                    background: "rgba(96,165,250,0.12)",
                    filter: "blur(80px)"
                }}
            />

            <div
                style={{
                    position: "absolute",
                    top: "40%",
                    left: "45%",
                    width: "250px",
                    height: "250px",
                    borderRadius: "999px",
                    background: "rgba(167,139,250,0.10)",
                    filter: "blur(80px)"
                }}
            />

            <div
                className="
                    relative
                    z-10
                    grid
                    lg:grid-cols-2
                    gap-12
                    items-center
                    max-w-7xl
                    w-full
                "
            >

                {/* Left Section */}

                <div
                    className="hidden lg:block"
                >

                    <p
                        style={{
                            textTransform: "uppercase",
                            letterSpacing: "4px",
                            fontWeight: 600,
                            color: "#7C5AF6",
                            marginBottom: "20px"
                        }}
                    >
                        Enterprise Intelligence
                    </p>

                    <h1
                        style={{
                            fontSize: "60px",
                            fontWeight: 700,
                            lineHeight: 1.1,
                            color: theme.textPrimary,
                            marginBottom: "24px"
                        }}
                    >
                        AI Vendor
                        <span
                            style={{
                                color: "#7C5AF6"
                            }}
                        >
                            {" "}Discovery
                        </span>
                        <br />
                        Platform
                    </h1>

                    <p
                        style={{
                            color: theme.textMuted,
                            fontSize: "18px",
                            lineHeight: 1.8,
                            maxWidth: "600px",
                            marginBottom: "40px"
                        }}
                    >
                        Discover vendors,
                        analyze capabilities,
                        benchmark pricing
                        and drive procurement
                        decisions through
                        AI-powered intelligence.
                    </p>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "20px"
                        }}
                    >

                        <FeatureCard
                            icon={<BrainCircuit />}
                            title="AI Recommendations"
                            description="Smart vendor suggestions powered by analytics."
                            theme={theme}
                            iconColor="#7C5AF6"
                            iconBg="rgba(124,90,246,0.12)"
                        />

                        <FeatureCard
                            icon={<TrendingUp />}
                            title="Vendor Benchmarking"
                            description="Compare pricing, performance and engagement metrics."
                            theme={theme}
                            iconColor="#22C55E"
                            iconBg="rgba(34,197,94,0.12)"
                        />

                    </div>

                </div>

                {/* Right Section */}

                <div
                    style={{
                        background: theme.cardBg,
                        border: `1px solid ${theme.cardBorder}`,
                        borderRadius: "40px",
                        padding: "40px",
                        maxWidth: "520px",
                        width: "100%",
                        margin: "0 auto",

                        boxShadow: theme.isDark
                            ? "0 20px 50px rgba(0,0,0,0.35)"
                            : "0 20px 50px rgba(15,23,42,0.08)"
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            marginBottom: "24px"
                        }}
                    >

                        <div
                            style={{
                                width: "64px",
                                height: "64px",
                                borderRadius: "24px",
                                background:
                                    "rgba(124,90,246,0.12)",

                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <Shield
                                size={28}
                                color="#7C5AF6"
                            />
                        </div>

                    </div>

                    <h2
                        style={{
                            fontSize: "40px",
                            fontWeight: 700,
                            textAlign: "center",
                            color: theme.textPrimary,
                            marginBottom: "12px"
                        }}
                    >
                        Welcome
                    </h2>

                    <p
                        style={{
                            color: theme.textMuted,
                            textAlign: "center",
                            marginBottom: "32px"
                        }}
                    >
                        {subtitle}
                    </p>

                    {children}

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            marginTop: "32px",
                            color: theme.textMuted,
                            fontSize: "14px"
                        }}
                    >
                        <Sparkles size={14} />
                        Enterprise AI Platform
                    </div>

                </div>

            </div>

        </div>

    );
};

const FeatureCard = ({
    icon,
    title,
    description,
    theme,
    iconColor,
    iconBg
}) => {

    return (
        <div
            style={{
                background: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: "28px",
                padding: "20px",

                display: "flex",
                gap: "16px",
                alignItems: "flex-start"
            }}
        >

            <div
                style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "16px",

                    background: iconBg,

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    color: iconColor
                }}
            >
                {icon}
            </div>

            <div>

                <h3
                    style={{
                        fontWeight: 700,
                        fontSize: "18px",
                        color: theme.textPrimary,
                        marginBottom: "4px"
                    }}
                >
                    {title}
                </h3>

                <p
                    style={{
                        color: theme.textMuted
                    }}
                >
                    {description}
                </p>

            </div>

        </div>
    );
};

export default AuthLayout;