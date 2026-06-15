import React from "react";

const ComparisonTable = ({ text, theme, isDark }) => {
    const lines = text.split("\n").filter(Boolean);

    // Extract header line (Attribute | V1 | V2)
    const headerLine = lines.find(l => l.startsWith("Attribute"));
    if (!headerLine) return <pre style={{ whiteSpace: "pre-wrap" }}>{text}</pre>;

    const headers = headerLine.split(/\s{2,}/).map(h => h.trim()).filter(Boolean);

    // Extract data rows (lines with 2+ spaced columns, skip separator)
    const dataLines = lines.filter(l =>
        !l.startsWith("Attribute") &&
        !l.startsWith("---") &&
        !l.startsWith("🏆") &&
        !l.startsWith("Why?") &&
        !l.startsWith("•") &&
        l.includes("  ")
    );

    const rows = dataLines.map(l =>
        l.split(/\s{2,}/).map(c => c.trim()).filter(Boolean)
    ).filter(r => r.length >= 2);

    // Extract verdict + explanation (everything after the table)
    const verdictStart = lines.findIndex(l => l.startsWith("🏆"));
    const afterTable = verdictStart >= 0
        ? lines.slice(verdictStart).join("\n")
        : "";

    const tdStyle = (i) => ({
        padding: "10px 12px",
        fontSize: 13,
        color: theme.aiBubbleText,
        fontWeight: i === 0 ? 600 : 500,
        borderBottom: `1px solid ${isDark ? "rgba(124,90,246,0.18)" : "rgba(124,90,246,0.10)"}`,
        background: isDark
            ? (i === 0
                ? "rgba(124,90,246,0.10)"
                : "rgba(124,90,246,0.04)")
            : (i === 0
                ? "rgba(124,90,246,0.05)"
                : "rgba(124,90,246,0.02)"),
        whiteSpace: "nowrap"
    });

    return (
        <div>
            {/* TABLE */}
            <div style={{
                overflowX: "auto",
                borderRadius: 10,
                border: `1px solid ${isDark ? "rgba(124,90,246,0.30)" : "rgba(124,90,246,0.18)"}`,
                background: isDark ? "#13112B" : "#FFFFFF",
                marginBottom: 12
            }}>
                <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 12
                }}>
                    <thead>
                        <tr style={{
                            background: isDark
                                ? "linear-gradient(90deg,rgba(124,90,246,0.25),rgba(167,139,250,0.12))"
                                : "linear-gradient(90deg,rgba(124,90,246,0.12),rgba(167,139,250,0.06))"
                        }}>
                            {headers.map((h, i) => (
                                <th key={i} style={{
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: isDark ? "#C4B5FD" : "#8B5CF6",
                                    letterSpacing: "0.05em",
                                    textTransform: "uppercase",
                                    borderBottom: "1px solid rgba(124,90,246,0.3)"
                                }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, ri) => (
                            <tr key={ri}>
                                {row.map((cell, ci) => (
                                    <td key={ci} style={tdStyle(ci)}>{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* VERDICT + EXPLANATION */}
            {afterTable && (
                <div style={{
                    fontSize: 13,
                    color: theme.aiBubbleText,
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap"
                }}>
                    {afterTable}
                </div>
            )}
        </div>
    );
};

const MessageBubble = ({ role, text, timestamp, isDark, theme }) => {
    const isUser = role === "user";
    const isComparison = !isUser && text?.includes("Here's a comparison of both vendors:");

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: isUser ? "flex-end" : "flex-start",
            gap: 6
        }}>
            <div style={{
                maxWidth: isUser ? "72%" : "88%",
                minWidth: isUser ? "220px" : "320px",
                padding: "12px 16px",
                borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                background: isUser ? theme.userBubbleBg : theme.aiBubbleBg,
                border: isUser ? "none" : `1px solid ${theme.aiBubbleBorder}`,
                boxShadow: isUser ? theme.userBubbleShadow : theme.aiBubbleShadow,
                color: isUser ? theme.userBubbleText : theme.aiBubbleText,
                fontSize: 13,
                lineHeight: 1.65,
                whiteSpace: isComparison ? "normal" : "pre-wrap",
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                transition: "all 0.25s ease"
            }}>
                {isComparison
                    ? <ComparisonTable text={text} theme={theme} isDark={isDark} />
                    : text
                }
            </div>

            <div style={{ fontSize: 11, color: theme.timeText }}>
                {timestamp}
            </div>
        </div>
    );
};

export default MessageBubble;