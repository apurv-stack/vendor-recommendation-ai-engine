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
                size={18}
                style={{
                    position: "absolute",
                    left: "18px",
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
                    height: "56px",
                    paddingLeft: "50px",
                    paddingRight: "48px",

                    background: theme.cardBg,
                    border: `1px solid ${theme.border}`,
                    borderRadius: "18px",

                    color: theme.text,
                    outline: "none",

                    transition: "all .25s ease"
                }}
            />

            {value && (
                <button
                    onClick={onClear}
                    style={{
                        position: "absolute",
                        right: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",

                        width: "32px",
                        height: "32px",

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