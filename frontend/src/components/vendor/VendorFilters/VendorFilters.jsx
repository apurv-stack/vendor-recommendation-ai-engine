import {
    Search,
    SlidersHorizontal,
    RotateCcw,
    MapPin,
    IndianRupee,
    Star,
    ChevronDown,
    AlertCircle
} from "lucide-react";

import { useState } from "react";

import Card from "../../common/Card/Card";
import Button from "../../common/Button/Button";
import SearchBar from "../../common/SearchBar/SearchBar";

import { useTheme } from "../../../context/ThemeContext";

function InputField({
    icon,
    placeholder,
    value,
    onChange,
    type = "text",
    min,
    theme
}) {
    return (
        <div style={{ position: "relative" }}>
            <div
                style={{
                    position: "absolute",
                    left: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: theme.textMuted,
                    zIndex: 10
                }}
            >
                {icon}
            </div>

            <input
                type={type}
                min={min}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                style={{
                    width: "100%",
                    padding: "10px 14px 10px 40px",
                    background: theme.panelBg,
                    border: `1px solid ${theme.cardBorder}`,
                    borderRadius: "12px",
                    color: theme.textPrimary,
                    fontSize: "12px",
                    outline: "none",
                    MozAppearance: "textfield"
                }}
                className="no-spinner"
            />
        </div>
    );
}

const VendorFilters = ({
    filters,
    setFilters,
    categories = [],
    onSearch,
    onReset
}) => {

    const theme = useTheme();

    const [error, setError] = useState("");

    const updateField = (field, value) => {

        if (
            (field === "minPrice" || field === "maxPrice") &&
            value !== "" &&
            Number(value) < 0
        ) {
            setError("Price cannot be negative");
            return;
        }

        const updatedFilters = {
            ...filters,
            [field]: value
        };

        setFilters(updatedFilters);

        const updatedMin = Number(updatedFilters.minPrice);
        const updatedMax = Number(updatedFilters.maxPrice);
        const hasMin = updatedFilters.minPrice !== "";
        const hasMax = updatedFilters.maxPrice !== "";

        if (hasMin && hasMax) {

            if (updatedMin === 0 && updatedMax === 0) {
                setError("Please enter a valid price range");
                return;
            }

            if (updatedMax <= updatedMin) {
                setError("Maximum price must exceed minimum price");
                return;
            }

            if (updatedMax - updatedMin < 500) {
                setError("Price range must differ by at least ₹500");
                return;
            }

        }

        setError("");

    };

    const validateFilters = () => {

        const min = Number(filters.minPrice);
        const max = Number(filters.maxPrice);
        const hasMin = filters.minPrice !== "";
        const hasMax = filters.maxPrice !== "";

        if (hasMin && hasMax) {

            if (min === 0 && max === 0) {
                setError(
                    "Please enter a valid price range"
                );
                return false;
            }

            if (max <= min) {
                setError(
                    "Maximum price must exceed minimum price"
                );
                return false;
            }

            if (max - min < 500) {
                setError(
                    "Price range must differ by at least ₹500"
                );
                return false;
            }

        }

        if (
            filters.rating &&
            (
                Number(filters.rating) < 0 ||
                Number(filters.rating) > 5
            )
        ) {
            setError(
                "Rating must be between 0 and 5"
            );
            return false;
        }

        setError("");
        return true;
    };

    const handleSearch = () => {

        if (!validateFilters()) {
            return;
        }

        onSearch();
    };

    const handleReset = () => {

        setError("");
        onReset();
    };

    return (
        <Card>

            {/* Header */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                    marginBottom: "20px"
                }}
            >

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px"
                    }}
                >

                    <div
                        style={{
                            height: "40px",
                            width: "40px",
                            borderRadius: "12px",
                            background:
                                "linear-gradient(135deg,#7C5AF6,#A78BFA)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <SlidersHorizontal
                            size={16}
                            color="#fff"
                        />
                    </div>

                    <div>

                        <p
                            style={{
                                textTransform: "uppercase",
                                letterSpacing: "1.5px",
                                fontSize: "10px",
                                fontWeight: 600,
                                color: "#7C5AF6",
                                marginBottom: "2px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "200px"
                            }}
                        >
                            Marketplace Intelligence
                        </p>

                        <h2
                            style={{
                                fontSize: "16px",
                                fontWeight: 700,
                                color: theme.textPrimary
                            }}
                        >
                            Vendor Filters
                        </h2>

                    </div>

                </div>

                <p
                    style={{
                        color: theme.textMuted,
                        fontSize: "12px"
                    }}
                >
                    Refine vendors intelligently
                </p>

            </div>

            {/* Filters */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit,minmax(160px,1fr))",
                    gap: "10px"
                }}
            >

                <SearchBar
                    value={filters.query}
                    onChange={(e) =>
                        updateField(
                            "query",
                            e.target.value
                        )
                    }
                    placeholder="Search Vendor"
                    onClear={() =>
                        updateField(
                            "query",
                            ""
                        )
                    }
                />

                <InputField
                    icon={<MapPin size={14} />}
                    placeholder="City"
                    value={filters.city}
                    onChange={(e) =>
                        updateField(
                            "city",
                            e.target.value
                        )
                    }
                    theme={theme}
                />

                <div style={{ position: "relative" }}>
                    <select
                        value={filters.category}
                        onChange={(e) =>
                            updateField(
                                "category",
                                e.target.value
                            )
                        }
                        style={{
                            width: "100%",
                            padding: "10px 14px",
                            background: theme.panelBg,
                            border: `1px solid ${theme.cardBorder}`,
                            borderRadius: "12px",
                            color: theme.textPrimary,
                            fontSize: "12px",
                            appearance: "none"
                        }}
                    >
                        <option value="">
                            Category
                        </option>

                        {categories.map(category => (
                            <option
                                key={category.category_id}
                                value={category.name}
                            >
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <ChevronDown
                        size={14}
                        style={{
                            position: "absolute",
                            right: "16px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: theme.textMuted,
                            pointerEvents: "none"
                        }}
                    />
                </div>

                <InputField
                    icon={<IndianRupee size={14} />}
                    placeholder="Minimum Price"
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) =>
                        updateField(
                            "minPrice",
                            e.target.value
                        )
                    }
                    theme={theme}
                />

                <InputField
                    icon={<IndianRupee size={14} />}
                    placeholder="Maximum Price"
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) =>
                        updateField(
                            "maxPrice",
                            e.target.value
                        )
                    }
                    theme={theme}
                />

                <div style={{ position: "relative" }}>

                    <Star
                        size={14}
                        style={{
                            position: "absolute",
                            left: "16px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#FACC15",
                            zIndex: 10
                        }}
                    />

                    <select
                        value={filters.rating}
                        onChange={(e) =>
                            updateField(
                                "rating",
                                e.target.value
                            )
                        }
                        style={{
                            width: "100%",
                            padding:
                                "10px 14px 10px 40px",
                            background: theme.panelBg,
                            border: `1px solid ${theme.cardBorder}`,
                            borderRadius: "12px",
                            color: theme.textPrimary,
                            fontSize: "12px",
                            appearance: "none"
                        }}
                    >
                        <option value="">
                            Rating
                        </option>
                        <option value="4">
                            4+
                        </option>
                        <option value="3">
                            3+
                        </option>
                        <option value="2">
                            2+
                        </option>
                    </select>

                </div>

            </div>

            {error && (

                <div
                    style={{
                        marginTop: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#EF4444",
                        fontWeight: 500,
                        fontSize: "12px"
                    }}
                >
                    <AlertCircle size={18} />
                    {error}
                </div>

            )}

            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop: "16px"
                }}
            >
                <div style={{ flex: "1 1 140px" }}>
                <Button
                    onClick={handleSearch}
                    icon={<Search size={14} />}
                    size="sm"
                    style={{ width: "100%" }}
                >
                    Search Vendors
                </Button>
            </div>

            <div style={{ flex: "1 1 100px" }}>
                <Button
                    variant="outline"
                    onClick={handleReset}
                    icon={<RotateCcw size={14} />}
                    size="sm"
                    style={{ width: "100%" }}
                >
                    Reset
                </Button>
            </div>
        </div>

        </Card>
    );
};

export default VendorFilters;