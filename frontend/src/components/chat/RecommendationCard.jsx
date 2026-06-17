import React, { memo, useState } from "react";
import { MapPin, Tag, Star, Target, ChevronRight, ArrowUpRight, Bookmark } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import axiosInstance from "../../api/axiosInstance";
import Modal from "../common/Modal/Modal";
import VendorDetails from "../vendor/VendorDetails/VendorDetails";

// ── Category SVG illustrations ──
const CategoryIllustration = ({ category, isDark }) => {
    const color = isDark ? "#a78bfa" : "#7c5af6";
    const colorFaint = isDark ? "rgba(167,139,250,0.15)" : "rgba(124,90,246,0.1)";
    const colorMid = isDark ? "rgba(167,139,250,0.4)" : "rgba(124,90,246,0.35)";
    const cat = (category || "").toLowerCase();

    if (cat === "catering" || cat === "food") return (
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <ellipse cx="36" cy="38" rx="24" ry="4" fill={colorFaint} />
            <path d="M13 38 Q13 18 36 18 Q59 18 59 38Z" fill={colorFaint} stroke={color} strokeWidth="1.5" />
            <circle cx="36" cy="16" r="4" fill={colorMid} stroke={color} strokeWidth="1.5" />
            <ellipse cx="36" cy="38" rx="26" ry="4.5" fill="none" stroke={color} strokeWidth="1.5" />
            <line x1="10" y1="28" x2="10" y2="48" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1="8" y1="28" x2="8" y2="34" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
            <line x1="12" y1="28" x2="12" y2="34" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
            <line x1="62" y1="28" x2="62" y2="48" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M62 28 Q66 32 62 36" fill={colorMid} stroke={color} strokeWidth="1.2" />
            <circle cx="52" cy="20" r="1.5" fill={color} opacity="0.6" />
            <circle cx="58" cy="26" r="1" fill={color} opacity="0.5" />
            <path d="M54 14 L55 17 L58 14 L55 11Z" fill={color} opacity="0.4" />
        </svg>
    );

    if (cat === "photography") return (
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <rect x="14" y="26" width="44" height="32" rx="7" fill={colorFaint} stroke={color} strokeWidth="1.5" />
            <rect x="24" y="20" width="16" height="8" rx="4" fill={colorFaint} stroke={color} strokeWidth="1.5" />
            <circle cx="36" cy="42" r="11" fill={colorFaint} stroke={color} strokeWidth="1.5" />
            <circle cx="36" cy="42" r="7" fill={colorMid} stroke={color} strokeWidth="1" />
            <circle cx="36" cy="42" r="3.5" fill={color} opacity="0.5" />
            <rect x="46" y="28" width="6" height="4" rx="2" fill={colorMid} />
            <circle cx="33" cy="39" r="2" fill="rgba(255,255,255,0.3)" />
            <circle cx="56" cy="22" r="1.5" fill={color} opacity="0.6" />
            <path d="M60 18 L61 21 L64 18 L61 15Z" fill={color} opacity="0.4" />
        </svg>
    );

    if (cat === "decoration" || cat === "decor") return (
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="36" r="7" fill={colorMid} stroke={color} strokeWidth="1.5" />
            {[0,45,90,135,180,225,270,315].map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                const x = 36 + Math.cos(rad) * 14;
                const y = 36 + Math.sin(rad) * 14;
                return <ellipse key={i} cx={x} cy={y} rx="5" ry="3"
                    transform={`rotate(${angle} ${x} ${y})`}
                    fill={colorFaint} stroke={color} strokeWidth="1.2" />;
            })}
            <path d="M36 43 Q32 52 30 58" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M33 52 Q26 48 28 44 Q32 46 33 52Z" fill={colorFaint} stroke={color} strokeWidth="1" />
            <circle cx="55" cy="24" r="4" fill={colorMid} opacity="0.6" />
            <circle cx="55" cy="18" r="2.5" fill={colorFaint} stroke={color} strokeWidth="1" />
            <circle cx="61" cy="24" r="2.5" fill={colorFaint} stroke={color} strokeWidth="1" />
            <circle cx="49" cy="24" r="2.5" fill={colorFaint} stroke={color} strokeWidth="1" />
            <path d="M16 20 L17 23 L20 20 L17 17Z" fill={color} opacity="0.4" />
        </svg>
    );

    if (cat === "venue") return (
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <rect x="18" y="28" width="36" height="32" rx="3" fill={colorFaint} stroke={color} strokeWidth="1.5" />
            <path d="M14 28 L36 14 L58 28Z" fill={colorFaint} stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
            <rect x="22" y="38" width="4" height="22" rx="2" fill={colorMid} />
            <rect x="34" y="38" width="4" height="22" rx="2" fill={colorMid} />
            <rect x="46" y="38" width="4" height="22" rx="2" fill={colorMid} />
            <rect x="30" y="44" width="12" height="16" rx="6" fill={colorMid} stroke={color} strokeWidth="1" />
            <rect x="20" y="30" width="6" height="5" rx="1.5" fill={colorMid} />
            <rect x="46" y="30" width="6" height="5" rx="1.5" fill={colorMid} />
            <circle cx="58" cy="20" r="1.5" fill={color} opacity="0.6" />
            <path d="M62 14 L63 17 L66 14 L63 11Z" fill={color} opacity="0.4" />
        </svg>
    );

    if (cat === "music" || cat === "dj" || cat === "band") return (
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <line x1="44" y1="18" x2="44" y2="46" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="40" cy="48" rx="7" ry="5" transform="rotate(-15 40 48)" fill={colorMid} stroke={color} strokeWidth="1.5" />
            <line x1="56" y1="22" x2="56" y2="50" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="52" cy="52" rx="6" ry="4.5" transform="rotate(-15 52 52)" fill={colorMid} stroke={color} strokeWidth="1.5" />
            <path d="M44 18 L56 22" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <line x1="24" y1="32" x2="24" y2="48" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <ellipse cx="21" cy="50" rx="5" ry="3.5" transform="rotate(-15 21 50)" fill={colorFaint} stroke={color} strokeWidth="1.2" />
            <circle cx="30" cy="20" r="1.5" fill={color} opacity="0.6" />
            <circle cx="62" cy="30" r="1.5" fill={color} opacity="0.5" />
            <path d="M16 24 L17 27 L20 24 L17 21Z" fill={color} opacity="0.4" />
        </svg>
    );

    if (cat === "planner") return (
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <rect x="14" y="22" width="44" height="38" rx="7" fill={colorFaint} stroke={color} strokeWidth="1.5" />
            <rect x="14" y="22" width="44" height="14" rx="7" fill={colorMid} />
            <rect x="14" y="29" width="44" height="7" fill={colorMid} />
            <line x1="26" y1="18" x2="26" y2="26" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="46" y1="18" x2="46" y2="26" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <rect x="20" y="42" width="8" height="8" rx="2" fill={colorMid} />
            <rect x="32" y="42" width="8" height="8" rx="2" fill={colorMid} />
            <rect x="44" y="42" width="8" height="8" rx="2" fill={colorFaint} stroke={color} strokeWidth="1" />
            <rect x="20" y="54" width="8" height="3" rx="1.5" fill={colorFaint} />
            <rect x="32" y="54" width="8" height="3" rx="1.5" fill={colorMid} />
            <circle cx="58" cy="18" r="1.5" fill={color} opacity="0.6" />
            <path d="M62 12 L63 15 L66 12 L63 9Z" fill={color} opacity="0.4" />
        </svg>
    );

    if (cat === "makeup") return (
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <ellipse cx="36" cy="44" rx="10" ry="14" fill={colorFaint} stroke={color} strokeWidth="1.5" />
            <rect x="32" y="24" width="8" height="22" rx="4" fill={colorMid} stroke={color} strokeWidth="1.2" />
            <ellipse cx="36" cy="24" rx="4" ry="2.5" fill={color} opacity="0.6" />
            <path d="M20 36 Q24 28 28 36" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <circle cx="20" cy="36" r="3" fill={colorMid} stroke={color} strokeWidth="1" />
            <path d="M52 36 Q48 28 44 36" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <circle cx="52" cy="36" r="3" fill={colorMid} stroke={color} strokeWidth="1" />
            <circle cx="58" cy="20" r="1.5" fill={color} opacity="0.6" />
            <path d="M14 22 L15 25 L18 22 L15 19Z" fill={color} opacity="0.4" />
            <circle cx="14" cy="48" r="1.2" fill={color} opacity="0.5" />
        </svg>
    );

    return (
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="36" r="16" fill={colorFaint} stroke={color} strokeWidth="1.5" />
            <path d="M36 20 L38.5 30 L49 28 L41 35 L46 45 L36 39 L26 45 L31 35 L23 28 L33.5 30Z"
                fill={colorMid} stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
            <circle cx="56" cy="20" r="1.5" fill={color} opacity="0.6" />
            <circle cx="18" cy="22" r="1.2" fill={color} opacity="0.5" />
            <path d="M58 28 L59 31 L62 28 L59 25Z" fill={color} opacity="0.4" />
        </svg>
    );
};

function RecommendationCard({ vendor }) {
    const t = useTheme();

    // ✅ local modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [fullVendor, setFullVendor] = useState(null);
    const [loadingVendor, setLoadingVendor] = useState(false);

    const name = vendor?.vendor_name || vendor?.name || "Unknown Vendor";
    const city = vendor?.city || "Location unavailable";
    const category = vendor?.category || "General";
    const rating = typeof vendor?.rating === "number" ? vendor.rating.toFixed(1)
        : typeof vendor?.avg_rating === "number" ? vendor.avg_rating.toFixed(1) : "N/A";
    const reviewCount = vendor?.review_count ?? 0;
    const description = vendor?.vendor_description?.trim() || "";
    const recommendationReason = vendor?.recommendation_reason || "Recommended based on your requirements";
    const matchScore = vendor?.match_score ?? 0;
    const featuredBadge = vendor?.featured_badge || null;
    const hasPricing = vendor?.price_min != null && vendor?.price_max != null;
    const pricing = hasPricing
        ? `₹${vendor.price_min.toLocaleString()} – ₹${vendor.price_max.toLocaleString()}`
        : "Pricing unavailable";

    const rawServices = Array.isArray(vendor?.services) ? vendor.services : [];
    const categoryServices = rawServices.flatMap(item => {
        if (typeof item === "string") return [item];
        if (item?.services && Array.isArray(item.services)) return item.services;
        return [];
    });
    const services = [...new Set(categoryServices.filter(Boolean))];

    const matchBg = matchScore >= 80 ? "rgba(34,197,94,0.12)" : matchScore >= 60 ? "rgba(124,90,246,0.12)" : "rgba(100,100,150,0.1)";
    const matchBorder = matchScore >= 80 ? "rgba(34,197,94,0.3)" : matchScore >= 60 ? "rgba(124,90,246,0.3)" : "rgba(100,100,150,0.2)";
    const matchTextColor = matchScore >= 80 ? "#22c55e" : matchScore >= 60 ? "#7c5af6" : "#8080b0";

    const avatarColors = ["#7c5af6", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];
    const avatarColor = avatarColors[name.charCodeAt(0) % avatarColors.length];

    const handleSave = async () => {
        if (saved || saving) return;
        try {
            setSaving(true);
            await axiosInstance.post(`/vendors/${vendor.vendor_id}/save`);
            setSaved(true);
        } catch (error) {
            console.error("Save failed:", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div
                style={{
                    position: "relative", overflow: "hidden",
                    borderRadius: 14,
                    background: t.cardBg,
                    border: `1px solid ${t.cardBorder}`,
                    boxShadow: t.cardShadow,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "default",
                    maxWidth: "480px", // ✅ limit horizontal width
                    width: "100%"
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = t.cardHoverShadow;
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = t.cardShadow;
                }}
            >
                {/* TOP ACCENT BAR */}
                <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 3,
                    background: "linear-gradient(90deg,#7c5af6,#a78bfa,#c084fc)"
                }} />

                {/* CATEGORY ILLUSTRATION */}
                {/* <div style={{
                    position: "absolute", top: 16, right: 6,
                    width: 72, height: 72,
                    pointerEvents: "none", zIndex: 0,
                    opacity: t.isDark ? 0.7 : 0.5,
                    display: "none"
                }}
                    className="illustration-hide"
                >
                <style>{`
                    @media (min-width: 640px) { .illustration-hide { display: block !important; } }
                `}</style>
                    <div style={{
                        position: "absolute", top: "50%", left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 80, height: 80, borderRadius: "50%",
                        background: t.isDark
                            ? "radial-gradient(circle, rgba(124,90,246,0.3) 0%, transparent 70%)"
                            : "radial-gradient(circle, rgba(124,90,246,0.15) 0%, transparent 70%)",
                        filter: "blur(8px)"
                    }} />
                    <div style={{ position: "relative" }}>
                        <CategoryIllustration category={category} isDark={t.isDark} />
                    </div>
                </div> */}

                <div style={{ padding: "14px 14px 12px", paddingTop: 16 }}>

                    {/* TOP ROW */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, paddingRight: 0, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                                background: avatarColor + (t.isDark ? "22" : "18"),
                                border: `1.5px solid ${avatarColor}${t.isDark ? "44" : "33"}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 16, fontWeight: 800, color: avatarColor
                            }}>
                                {name.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                    <span style={{
                                        fontSize: 13, fontWeight: 700,
                                        color: t.isDark ? "#F8FAFC" : t.textPrimary,
                                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                                    }}>{name}</span>
                                    {featuredBadge && (
                                        <span style={{
                                            padding: "2px 7px", borderRadius: 20, fontSize: 10, fontWeight: 700,
                                            background: "rgba(245,158,11,0.12)", color: "#f59e0b",
                                            border: "1px solid rgba(245,158,11,0.3)", whiteSpace: "nowrap"
                                        }}>⭐ {featuredBadge}</span>
                                    )}
                                </div>
                                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: t.vendorCityText }}>
                                        <MapPin size={9} color="#7c5af6" />{city}
                                    </span>
                                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: t.vendorCityText }}>
                                        <Tag size={9} color="#a78bfa" />{category}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Rating */}
                        <div style={{
                            display: "flex", flexDirection: "column", alignItems: "center",
                            background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)",
                            borderRadius: 10, padding: "5px 10px", flexShrink: 0, position: "relative", zIndex: 2
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                <Star size={10} color="#f59e0b" fill="#f59e0b" />
                                <span style={{ fontSize: 13, fontWeight: 800, color: "#f59e0b" }}>{rating}</span>
                            </div>
                            <span style={{ fontSize: 9, color: t.reviewText, marginTop: 1 }}>{reviewCount} reviews</span>
                        </div>
                    </div>

                    {/* PRICE + MATCH */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginTop: 10 }}>
                        <div style={{
                            borderRadius: 10,
                            background: t.isDark ? "rgba(124,90,246,0.08)" : "rgba(124,90,246,0.05)",
                            border: `1px solid ${t.isDark ? "rgba(124,90,246,0.2)" : "rgba(124,90,246,0.12)"}`,
                            padding: "8px 10px"
                        }}>
                            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.07em", color: t.priceLabelText, fontWeight: 600, marginBottom: 3 }}>Price Range</div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: t.priceValueText }}>{pricing}</div>
                        </div>
                        <div style={{ borderRadius: 10, background: matchBg, border: `1px solid ${matchBorder}`, padding: "8px 10px" }}>
                            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.07em", color: t.priceLabelText, fontWeight: 600, marginBottom: 3 }}>Match Score</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <Target size={10} color={matchTextColor} />
                                <span style={{ fontSize: 12, fontWeight: 700, color: matchTextColor }}>{matchScore}%</span>
                            </div>
                        </div>
                    </div>

                    {/* DESCRIPTION */}
                    {description && (
                        <p style={{
                            marginTop: 8, fontSize: 11,
                            color: t.isDark ? "#CBD5E1" : "#6060a0",
                            lineHeight: 1.5,
                            display: "-webkit-box", WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical", overflow: "hidden"
                        }}>{description}</p>
                    )}

                    {/* SERVICES */}
                    {services.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                            <div style={{ fontSize: 9, fontWeight: 600, color: t.priceLabelText, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Services</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                {services.slice(0, 5).map((s, i) => (
                                    <span key={i} style={{
                                        padding: "2px 8px", borderRadius: 20,
                                        background: t.serviceTagBg, border: `1px solid ${t.serviceTagBorder}`,
                                        color: t.serviceTagText, fontSize: 9, fontWeight: 500
                                    }}>{s}</span>
                                ))}
                                {services.length > 5 && (
                                    <span style={{
                                        padding: "2px 8px", borderRadius: 20,
                                        background: "rgba(124,90,246,0.1)", border: "1px solid rgba(124,90,246,0.2)",
                                        color: "#a78bfa", fontSize: 9, fontWeight: 500
                                    }}>+{services.length - 5} more</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* RECOMMENDATION REASON */}
                    <div style={{
                        marginTop: 8, paddingTop: 8,
                        borderTop: `1px solid ${t.isDark ? "rgba(124,90,246,0.1)" : "rgba(124,90,246,0.08)"}`,
                        display: "flex", alignItems: "flex-start", gap: 6
                    }}>
                        <div style={{
                            width: 16, height: 16, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                            background: "linear-gradient(135deg,#7c5af6,#a78bfa)",
                            display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            <ChevronRight size={9} color="#fff" />
                        </div>
                        <p style={{ fontSize: 10, color: t.recReasonText, lineHeight: 1.5, fontStyle: "italic", margin: 0 }}>
                            {recommendationReason}
                        </p>
                    </div>

                    {/* ✅ BUTTONS */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginTop: 10 }}>
                        <button
                            onClick={async () => {
                                setModalOpen(true);
                                if (!fullVendor && vendor?.vendor_id) {
                                    try {
                                        setLoadingVendor(true);
                                        const res = await axiosInstance.get(`/vendors/${vendor.vendor_id}`);
                                        const raw = res.data?.vendor || res.data?.data || res.data;
                                        setFullVendor(raw);
                                    } catch (e) {
                                        console.error("Failed to fetch vendor details", e);
                                    } finally {
                                        setLoadingVendor(false);
                                    }
                                }
                            }}
                            style={{
                                padding: "8px", borderRadius: 10, fontWeight: 600, fontSize: 12,
                                cursor: "pointer", display: "flex", alignItems: "center",
                                justifyContent: "center", gap: 5,
                                background: t.isDark ? "rgba(255,255,255,0.08)" : "rgba(124,90,246,0.08)",
                                border: `1px solid ${t.isDark ? "rgba(255,255,255,0.12)" : "rgba(124,90,246,0.2)"}`,
                                color: t.isDark ? "#fff" : "#7c5af6"
                            }}
                        >
                            <ArrowUpRight size={13} /> Details
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saved || saving}
                            style={{
                                padding: "8px", borderRadius: 10, fontWeight: 600, fontSize: 12,
                                cursor: saved ? "default" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                                background: saved ? "rgba(124,90,246,0.3)" : "linear-gradient(135deg,#7c5af6,#a78bfa)",
                                border: "none", color: "#fff"
                            }}
                        >
                            <Bookmark size={13} /> {saving ? "Saving..." : saved ? "Saved" : "Save"}
                        </button>
                    </div>
                </div>
            </div>

            {/* ✅ MODAL — opens inline, no navigation */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Vendor Details"
                size="lg"
            >
                {loadingVendor
                    ? <div style={{ padding: "40px", textAlign: "center", color: "#a78bfa" }}>Loading...</div>
                    : <VendorDetails vendor={fullVendor || vendor} />
                }
            </Modal>
        </>
    );
}

export default memo(RecommendationCard);