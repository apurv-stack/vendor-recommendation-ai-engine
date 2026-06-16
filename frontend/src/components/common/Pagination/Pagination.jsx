import {
    ChevronLeft,
    ChevronRight,
    MoreHorizontal
} from "lucide-react";

import { useTheme } from "../../../context/ThemeContext";

const Pagination = ({
    currentPage,
    totalPages,
    onPageChange
}) => {

    const theme = useTheme();

    if (totalPages <= 1) return null;

    const visiblePages = () => {

        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            return Array.from(
                { length: totalPages },
                (_, index) => index + 1
            );
        }

        pages.push(1);

        if (currentPage > 3) {
            pages.push("...");
        }

        const start = Math.max(
            2,
            currentPage - 1
        );

        const end = Math.min(
            totalPages - 1,
            currentPage + 1
        );

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (currentPage < totalPages - 2) {
            pages.push("...");
        }

        pages.push(totalPages);

        return pages;
    };

    const pages = visiblePages();

    const buttonStyle = {
        width: "36px",
        height: "36px",

        borderRadius: "10px",

        border: `1px solid ${theme.border}`,
        background: theme.cardBg,

        color: theme.text,

        cursor: "pointer"
    };

    return (
        <div
            style={{
                marginTop: "16px",

                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
                padding: "12px 16px",
                background: theme.cardBg,
                border: `1px solid ${theme.border}`,
                borderRadius: "16px"
            }}
        >
            <div
                style={{
                    color: theme.textMuted
                }}
            >
                Page{" "}
                <strong
                    style={{
                        color: theme.primary
                    }}
                >
                    {currentPage}
                </strong>{" "}
                of{" "}
                <strong
                    style={{
                        color: theme.text
                    }}
                >
                    {totalPages}
                </strong>
            </div>

            <div
                style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center"
                }}
            >
                <button
                    disabled={currentPage === 1}
                    onClick={() =>
                        onPageChange(currentPage - 1)
                    }
                    style={buttonStyle}
                >
                    <ChevronLeft size={18} />
                </button>

                {pages.map((page, index) => {

                    if (page === "...") {
                        return (
                            <MoreHorizontal
                                key={index}
                                size={18}
                                color={theme.textMuted}
                            />
                        );
                    }

                    return (
                        <button
                            key={page}
                            onClick={() =>
                                onPageChange(page)
                            }
                            style={{
                                ...buttonStyle,

                                background:
                                    page === currentPage
                                        ? theme.primary
                                        : theme.cardBg,

                                color:
                                    page === currentPage
                                        ? "#fff"
                                        : theme.text
                            }}
                        >
                            {page}
                        </button>
                    );
                })}

                <button
                    disabled={currentPage === totalPages}
                    onClick={() =>
                        onPageChange(currentPage + 1)
                    }
                    style={buttonStyle}
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;