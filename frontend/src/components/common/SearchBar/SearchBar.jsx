import { Search, X } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

const SearchBar = ({
    value,
    onChange,
    placeholder = "Search...",
    onClear,
    className = ""
}) => {

    const theme = useTheme();

    return (
        <div
            className={className}
            style={{
                position: "relative",
                width: "100%"
            }}
        >
            <Search
                size={14}
                style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: theme.textMuted,
                    zIndex: 1
                }}
            />

            <input
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={{
                    width: "100%",
                    padding: "10px 40px 10px 36px",

                    background: theme.panelBg,
                    border: `1px solid ${theme.cardBorder}`,
                    borderRadius: "12px",

                    color: theme.textPrimary,
                    fontSize: "12px",
                    outline: "none",

                    transition: "all .25s ease"
                }}
            />

            {value && (
                <button
                    onClick={onClear}
                    style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",

                        width: "22px",
                        height: "22px",

                        border: "none",
                        borderRadius: "999px",

                        background: "transparent",
                        cursor: "pointer",

                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",

                        color: theme.textMuted
                    }}
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
};

export default SearchBar;