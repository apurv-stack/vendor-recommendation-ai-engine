import { useCallback, useEffect, useRef, useState } from "react";
import { Send, Sparkles, Paperclip, Sun, Moon } from "lucide-react";
import { sendMessage } from "../../api/chatApi";
import { getSessionHistory } from "../../api/sessionApi";
import RecommendationCard from "./RecommendationCard";
import { useTheme } from "../../context/ThemeContext";
import MessageBubble from "./MessageBubble";

const MAX_MESSAGE_LENGTH = 500;
const STORAGE_KEY = "vendor_chat_session";

const WELCOME_MESSAGE = {
    role: "assistant",
    text: "👋 Welcome to Vendor Discovery AI.\n\nTell me your event requirements and I'll help you find the best vendors based on budget, location and event type.",
    recommendations: [],
    timestamp: new Date().toISOString()
};

const ChatWindow = ({ selectedSessionId, onSessionCreated }) => {
    const [messages, setMessages] = useState([WELCOME_MESSAGE]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [error, setError] = useState(null);

    const t = useTheme();
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const sendingRef = useRef(false);

    const isNewChat = messages.length === 1 && messages[0].role === "assistant";

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    useEffect(() => { inputRef.current?.focus(); }, []);

    useEffect(() => {
        if (selectedSessionId === null) {
            setMessages([WELCOME_MESSAGE]);
            setSessionId(null);
            localStorage.removeItem(STORAGE_KEY);
            setInput(""); setError(null);
            return;
        }
        if (selectedSessionId === sessionId) return;

        const loadHistory = async () => {
            try {
                const history = await getSessionHistory(selectedSessionId);
                const loaded = [WELCOME_MESSAGE];
                history.forEach(item => {
                    loaded.push({ role: "user", text: item.user_message, timestamp: item.created_at || item.timestamp });
                    loaded.push({
                        role: "assistant", text: item.ai_response, timestamp: item.created_at || item.timestamp,
                        recommendations: item.recommendations || [],
                        responseType: item.recommendations?.length > 0 ? "recommendation" : "chat"
                    });
                });
                setMessages(loaded);
                setSessionId(selectedSessionId);
            } catch (e) { console.error(e); }
        };
        loadHistory();
    }, [selectedSessionId]);

    const appendMessage = useCallback((msg) => setMessages(prev => [...prev, msg]), []);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || loading || sendingRef.current) return;
        if (trimmed.length > MAX_MESSAGE_LENGTH) { setError(`Max ${MAX_MESSAGE_LENGTH} characters`); return; }

        sendingRef.current = true;
        setError(null);
        appendMessage({ role: "user", text: trimmed, timestamp: new Date().toISOString() });
        setInput("");
        setLoading(true);

        try {
            const result = await sendMessage(trimmed, sessionId);
            if (result?.success) {
                if (result.session_id && result.session_id !== sessionId) {
                    setSessionId(result.session_id);
                    localStorage.setItem(STORAGE_KEY, result.session_id);
                    onSessionCreated?.();
                }
                appendMessage({
                    role: "assistant",
                    text: result.message || "",
                    timestamp: new Date().toISOString(),
                    recommendations: result.recommendations || [],
                    responseType: result.response_type || "chat"
                });
            } else {
                appendMessage({ role: "assistant", text: result?.message || "Sorry, something went wrong.", recommendations: [] });
            }
        } catch (e) {
            appendMessage({ role: "assistant", text: "Network error. Please try again.", recommendations: [] });
        } finally {
            setLoading(false);
            sendingRef.current = false;
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const timeNow = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const formatTime = (timestamp) => {
        if (!timestamp) return "";

        return new Date(timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div style={{
            display: "flex", flexDirection: "column",
            height: "100%", minHeight: 0,
            background: t.chatBg,
            borderRadius: 16,
            border: `1px solid ${t.chatBorder}`,
            overflow: "hidden",
            transition: "background 0.3s, border-color 0.3s"
        }}>

            {/* ── HEADER ── */}
            <div style={{
                flexShrink: 0,
                background: t.headerBg,
                borderBottom: `1px solid ${t.headerBorder}`,
                padding: "10px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                transition: "background 0.3s"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: "linear-gradient(135deg,#7c5af6,#a78bfa)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 0 16px rgba(124,90,246,0.4)"
                    }}>
                        <Sparkles size={16} color="#fff" />
                    </div>
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: t.textPrimary, letterSpacing: "-0.3px" }}>
                            Vendor Discovery AI
                        </div>

                        <div style={{ fontSize: 12, color: t.textSecondary || "#CBD5E1", marginTop: 2 }}>
                            AI-powered vendor recommendations
                        </div>
                    </div>
                </div>

                {/* RIGHT: AI badge + theme toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {/* AI Powered badge */}
                    <div style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "6px 14px", borderRadius: 20,
                        background: "rgba(124,90,246,0.12)",
                        border: "1px solid rgba(124,90,246,0.2)"
                    }}>
                        <span style={{ fontSize: 13 }}>⚡</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#a78bfa" }}>AI Powered</span>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
                    </div>

                    {/* Theme toggle */}
                    <button
                        onClick={t.toggleTheme}
                        title={t.isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "5px 12px", borderRadius: 20,
                            background: t.toggleBg,
                            border: `1px solid ${t.toggleBorder}`,
                            cursor: "pointer", transition: "all 0.2s",
                            fontFamily: "inherit"
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                    >
                        <span style={{ fontSize: 14 }}>{t.toggleIcon}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: t.toggleTextColor }}>
                            {t.toggleText}
                        </span>
                    </button>
                </div>
            </div>

            {/* ── MESSAGES ── */}
            <div className="msg-scroll" style={{
                flex: 1, overflowY: "auto",
                padding: "20px 24px",
                display: "flex", flexDirection: "column", gap: 16,
                background: t.msgAreaBg,
                scrollbarWidth: "thin",
                scrollbarColor: `${t.msgScrollThumb} ${t.msgScrollTrack}`,
                transition: "background 0.3s"
            }}>
                <style>{`
                    .msg-scroll::-webkit-scrollbar { width: 4px; }
                    .msg-scroll::-webkit-scrollbar-track { background: ${t.msgScrollTrack}; }
                    .msg-scroll::-webkit-scrollbar-thumb { background: ${t.msgScrollThumb}; border-radius: 4px; }
                `}</style>

                {/* HERO — new chat only */}
                {isNewChat && (
                    <div style={{
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        flex: 1, padding: "clamp(24px, 5vh, 60px) 20px", textAlign: "center"
                    }}>
                        <div style={{
                            width: "clamp(44px, 4vw, 56px)", height: "clamp(44px, 4vw, 56px)", borderRadius: 16,
                            background: "linear-gradient(135deg,#7c5af6,#a78bfa)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 0 30px rgba(124,90,246,0.5)", marginBottom: 18
                        }}>
                            <Sparkles size={24} color="#fff" />
                        </div>
                        <h2 style={{ fontSize: "clamp(22px, 2vw, 28px)", fontWeight: 800, color: t.textPrimary, margin: "0 0 10px" }}>
                            Vendor Discovery AI
                        </h2>
                        <p style={{ fontSize: "clamp(13px, 1vw, 15px)", color: t.heroSubText, maxWidth: 360, lineHeight: 1.7, margin: "0 0 24px" }}>
                            Tell me your event requirements — budget, location, guest count — and I'll find the perfect vendors for you.
                        </p>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                            {["Wedding in Delhi under 5L", "Caterers for 200 guests", "Photographers in Mumbai"].map(s => (
                                <button key={s} onClick={() => setInput(s)}
                                    style={{
                                        padding: "8px 16px", borderRadius: 20,
                                        background: t.heroBadgeBg,
                                        border: `1px solid ${t.heroBadgeBorder}`,
                                        color: t.heroBadgeText, fontSize: 12, fontWeight: 500,
                                        cursor: "pointer", fontFamily: "inherit",
                                        transition: "all 0.2s"
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(124,90,246,0.18)"}
                                    onMouseLeave={e => e.currentTarget.style.background = t.heroBadgeBg}
                                >{s}</button>
                            ))}
                        </div>
                    </div>
                )}

                {/* MESSAGES */}
                {messages.map((msg, i) => {
                    if (i === 0 && isNewChat) return null;
                    const isUser = msg.role === "user";
                    const hasRecs = msg.recommendations?.length > 0;

                    return (
                        <div key={i} style={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: isUser ? "flex-end" : "flex-start",
                            gap: 6
                        }}>
                            {/* Bubble */}
                            <MessageBubble
                                role={msg.role}
                                text={msg.text}
                                timestamp={formatTime(msg.timestamp)}
                                theme={t}
                                isDark={t.isDark}
                            />

                            {/* Recommendation Cards */}
                            {!isUser && hasRecs && (
                                <div style={{
                                    width: "100%", maxWidth: "82%",
                                    marginTop: 8,
                                    padding: "14px 16px",
                                    borderRadius: 14,
                                    background: t.recWrapBg,
                                    border: `1px solid ${t.recWrapBorder}`,
                                    transition: "background 0.3s"
                                }}>
                                    <div style={{
                                        fontSize: 11, fontWeight: 700, color: t.recLabelText,
                                        textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12
                                    }}>
                                        Here are the best vendor recommendations for you:
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                        {msg.recommendations.map((vendor, j) => (
                                            <RecommendationCard key={j} vendor={vendor} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Loading dots */}
                {loading && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <div style={{
                            padding: "12px 18px", borderRadius: "4px 18px 18px 18px",
                            background: t.aiBubbleBg, border: `1px solid ${t.aiBubbleBorder}`,
                            display: "flex", gap: 5, alignItems: "center"
                        }}>
                            {[0, 1, 2].map(d => (
                                <div key={d} style={{
                                    width: 7, height: 7, borderRadius: "50%",
                                    background: t.loadingDotBg,
                                    animation: `bounce 1.2s ease-in-out ${d * 0.2}s infinite`
                                }} />
                            ))}
                        </div>
                        <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-8px)} }`}</style>
                    </div>
                )}

                {error && (
                    <div style={{ textAlign: "center", fontSize: 12, color: t.errorText }}>
                        {error}
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* ── INPUT AREA ── */}
            <div style={{
                flexShrink: 0,
                background: t.inputAreaBg,
                borderTop: `1px solid ${t.inputAreaBorder}`,
                padding: "14px 20px",
                transition: "background 0.3s"
            }}>
                <div style={{
                    display: "flex", alignItems: "flex-end", gap: 10,
                    background: t.inputBg,
                    border: `1.5px solid ${t.inputBorder}`,
                    borderRadius: 14, padding: "10px 14px",
                    transition: "background 0.3s, border-color 0.3s"
                }}>
                    <button style={{
                        background: "none", border: "none", cursor: "pointer",
                        padding: "2px", flexShrink: 0, opacity: 0.5
                    }}>
                        <Paperclip size={16} color={t.textMuted} />
                    </button>
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about vendors, pricing, venues, catering or event planning..."
                        rows={1}
                        style={{
                            flex: 1, background: "transparent", border: "none", outline: "none",
                            resize: "none", fontSize: 14, lineHeight: 1.5,
                            color: t.inputText, fontFamily: "inherit",
                            maxHeight: 120, overflowY: "auto"
                        }}
                        onInput={e => {
                            e.target.style.height = "auto";
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                        }}
                    />
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                        <div style={{ fontSize: 10, color: t.charCountText }}>
                            {input.length}/{MAX_MESSAGE_LENGTH}
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: input.trim() && !loading
                                    ? "linear-gradient(135deg,#7c5af6,#a78bfa)"
                                    : "rgba(124,90,246,0.2)",
                                border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.2s",
                                boxShadow: input.trim() && !loading ? "0 0 12px rgba(124,90,246,0.4)" : "none"
                            }}
                        >
                            <Send size={15} color={input.trim() && !loading ? "#fff" : "#5a5a8a"} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;