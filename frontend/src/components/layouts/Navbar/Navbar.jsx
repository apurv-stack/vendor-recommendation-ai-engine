import { Menu, Bell, Search, ChevronDown, Users, Eye, MessageSquare } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import useAuth from "../../../hooks/useAuth";
import { useTheme } from "../../../context/ThemeContext";

const Navbar = ({ toggleSidebar, onChatOpen }) => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [views, setViews] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  const isAdmin = user?.role === "admin" || window.location.pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) return;
    fetchNavbarData();
    fetchNotifications();
  }, [isAdmin]);

  const fetchNavbarData = async () => {
    try {
      const response = await axiosInstance.get("/vendors/profile/views");
      setViews(response.data?.views || 0);
      setFollowers(response.data?.followers || 0);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await axiosInstance.get("/vendors/notifications");
      setNotifications(response.data?.notifications || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markRead = async (notificationId) => {
    try {
      await axiosInstance.put(`/vendors/notifications/${notificationId}`);
      setNotifications(previous =>
        previous.map(item =>
          item.notification_id === notificationId
            ? { ...item, is_read: true }
            : item
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const close = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => {
      document.removeEventListener("mousedown", close);
    };
  }, []);

  const unreadCount = notifications.filter(item => !item.is_read).length;

  const acronym = (user?.full_name || user?.username || "Vendor")
    .split(" ")
    .map(word => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      className="sticky top-0 z-30 px-4 py-2 flex items-center justify-between"
      style={{
        background: theme.cardBg,
        borderBottom: `1px solid ${theme.cardBorder}`,
        backdropFilter: "blur(20px)"
      }}
    >
      {/* Left — Menu + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          style={{
            height: "37px",
            width: "37px",
            borderRadius: "9px",
            background: theme.panelBg,
            border: `1px solid ${theme.cardBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer"
          }}
        >
          <Menu size={18} color={theme.textPrimary} />
        </button>

        <div className="hidden sm:block">
          <p
            style={{
              textTransform: "uppercase",
              letterSpacing: "2px",
              fontSize: "9px",
              fontWeight: 600,
              marginBottom: "2px",
              color: "#7C5AF6"
            }}
          >
            {isAdmin ? "ADMIN PANEL" : "ENTERPRISE SUITE"}
          </p>

          <h1
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: theme.textPrimary
            }}
          >
            {isAdmin
              ? "Vendor Management System"
              : "Vendor Discovery Platform"}
          </h1>
        </div>
      </div>

      {/* Center — Search */}
      {!isAdmin && (
      <div className="hidden lg:flex flex-1 justify-center px-10">
        <div style={{ position: "relative", width: "100%", maxWidth: "520px" }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: theme.textMuted
            }}
          />
          <input
            placeholder="Search vendors, categories, services..."
            style={{
              width: "100%",
              padding: "8px 13px 8px 36px",
              borderRadius: "10px",
              background: theme.panelBg,
              border: `1px solid ${theme.cardBorder}`,
              color: theme.textPrimary,
              fontSize: "12px",
              outline: "none"
            }}
          />
        </div>
      </div>
      )}
      
      {/* Right Section */}
    <div className="flex items-center gap-4">

      {!isAdmin && (
        <>

          {/* Followers */}
          <div
            className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "rgba(124,90,246,0.12)" }}
          >
            <Users size={14} color={theme.textPrimary} />
            <div>
              <p style={{ fontWeight: 700, color: theme.textPrimary }}>{followers}</p>
              <p style={{ fontSize: "10px", color: theme.textMuted }}>Followers</p>
            </div>
          </div>

          {/* Views */}
          <div
            className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "rgba(34,197,94,0.12)" }}
          >
            <Eye size={14} color={theme.textPrimary} />
            <div>
              <p style={{ fontWeight: 700, color: theme.textPrimary }}>{views}</p>
              <p style={{ fontSize: "10px", color: theme.textMuted }}>Views</p>
            </div>
          </div>

          {/* Chat */}
          <button
              onClick={() => onChatOpen?.()}
              className="hidden sm:flex"
              style={{
                  height: "42px",
                  width: "42px",
                  borderRadius: "12px",
                  background: "rgba(124,90,246,0.12)",
                  border: "1px solid rgba(124,90,246,0.3)",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#7C5AF6"
              }}
              title="Open AI Chat"
          >
            <MessageSquare size={16} color="#7C5AF6" />
          </button>

          {/* Notifications */}
          <div ref={notificationRef} className="relative hidden sm:block">
            <button
              onClick={() => {
                setNotificationOpen(previous => !previous);
                setProfileOpen(false);
              }}
              style={{
                position: "relative",
                height: "42px",
                width: "42px",
                borderRadius: "12px",
                background: theme.panelBg,
                border: `1px solid ${theme.cardBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              <Bell size={14} color={theme.textPrimary} />
              {unreadCount > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    height: "16px",
                    width: "16px",
                    borderRadius: "50%",
                    background: "#EF4444",
                    color: "#fff",
                    fontSize: "10px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {unreadCount}
                </div>
              )}
            </button>

            {notificationOpen && (
              <div
                className="absolute right-0 top-16 rounded-3xl shadow-xl p-5 z-50"
                style={{
                  background: theme.cardBg,
                  border: `1px solid ${theme.cardBorder}`,
                  width: "min(320px, 90vw)"
                }}
              >
                <h3
                  style={{ fontWeight: 700, fontSize: "14px", marginBottom: "12px", color: theme.textPrimary }}
                >
                  Notifications
                </h3>
                {loadingNotifications ? (
                  <p style={{ color: theme.textMuted }}>Loading...</p>
                ) : notifications.length ? (
                  notifications.map(item => (
                    <div
                      key={item.notification_id}
                      onClick={() => markRead(item.notification_id)}
                      style={{
                        padding: "12px",
                        borderBottom: `1px solid ${theme.cardBorder}`,
                        cursor: "pointer",
                        borderRadius: "8px"
                      }}
                    >
                      <p style={{ color: theme.textPrimary }}>{item.title}</p>
                      <p style={{ fontSize: "12px", color: theme.textMuted }}>{item.message}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: theme.textMuted }}>No notifications</p>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => {
              setProfileOpen(previous => !previous);
              setNotificationOpen(false);
            }}
            style={{
              background: theme.panelBg,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: "12px",
              padding: "6px 8px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer"
            }}
          >
            <div
              style={{
                height: "32px",
                width: "32px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #7C5AF6, #A78BFA)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {acronym}
            </div>

            <div className="hidden md:block text-left">
              <p style={{ fontWeight: 600, fontSize: "13px", color: theme.textPrimary }}>
                {user?.full_name || "Vendor"}
              </p>
              <p style={{ fontSize: "10px", color: theme.textMuted }}>
                @{user?.username || "user"}
              </p>
            </div>

            <ChevronDown
              size={18}
              color={theme.textMuted}
              style={{
                transition: "transform 0.2s",
                transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)"
              }}
            />
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 top-14 w-44 rounded-2xl shadow-xl p-1 flex flex-col gap-0.5 z-50"
              style={{
                background: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`
              }}
            >
              <button
                onClick={() => {
                  navigate(isAdmin ? "/admin" : "/profile");
                  setProfileOpen(false);
                }}
                style={{
                  textAlign: "left",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  color: theme.textPrimary,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  fontSize: "13px",
                  fontWeight: 500
                }}
                onMouseEnter={e => e.currentTarget.style.background = theme.panelBg}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                Profile
              </button>

              <button
                onClick={() => { navigate("/settings"); setProfileOpen(false); }}
                style={{
                  textAlign: "left",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  color: theme.textPrimary,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  fontSize: "13px",
                  fontWeight: 500
                }}
                onMouseEnter={e => e.currentTarget.style.background = theme.panelBg}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                Settings
              </button>

              <button
                onClick={() => { logout(); navigate("/login"); }}
                style={{
                  textAlign: "left",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  color: "#EF4444",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  fontSize: "13px",
                  fontWeight: 500
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;