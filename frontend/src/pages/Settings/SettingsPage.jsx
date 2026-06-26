import {
    useState,
    useEffect
} from "react";

import MainLayout from "../../components/layouts/MainLayout/MainLayout";
import axiosInstance from "../../api/axiosInstance";

import Loader from "../../components/common/Loader/Loader";
import PageHeader from "../../components/common/PageHeader/PageHeader";
import Card from "../../components/common/Card/Card";

import {
    Bell,
    Shield,
    Moon,
    UserCog,
    Save
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import useAuth from "../../hooks/useAuth";

const STORAGE_KEY = "vendor_settings";
const SettingsPage = () => {

    const theme = useTheme();
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        saving,
        setSaving
    ] = useState(false);

    const[
        apiError,
        setApiError
    ]=useState("");

    const[
        successMessage,
        setSuccessMessage
    ]=useState("");

    const [
        settings,
        setSettings
    ] = useState({
        displayName: "",
        email: "",
        notifications: true,
        darkMode: false,
        securityAlerts: true
    });

    useEffect(() => {
        if (isAdmin) {
            setLoading(false);
            return;
        }
        fetchSettings();
    }, [isAdmin]);

    const fetchSettings = async () => {

        try {
            setApiError("");

            setLoading(true);

            const response =
                await axiosInstance.get(
                    "/vendors/profile"
                );

            const vendor =
                response.data?.data?.vendor ||
                response.data?.vendor ||
                {};

            const saved =
                JSON.parse(
                    localStorage.getItem(
                        STORAGE_KEY
                    ) || "{}"
                );

            setSettings({
                displayName:
                    vendor.name || "",

                email:
                    vendor.business_email || "",

                notifications:
                    saved.notifications ?? true,

                darkMode:
                    saved.darkMode ?? false,

                securityAlerts:
                    saved.securityAlerts ?? true
            });

        } catch(error){

            setApiError(

                error?.response?.data?.detail ||

                "Failed to load settings"

            );

        } finally {

            setLoading(false);

        }

    };

    const updateField = (
        field,
        value
    ) => {

        setSettings(previous => ({
            ...previous,
            [field]: value
        }));

    };

    const saveSettings = async () => {

        try {
            setApiError("");
            setSuccessMessage("");

            setSaving(true);

            if (!isAdmin) {

                await axiosInstance.put(
                    "/vendors/profile",
                    {
                        name: settings.displayName
                    }
                );

            }

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    notifications:
                        settings.notifications,

                    darkMode:
                        settings.darkMode,

                    securityAlerts:
                        settings.securityAlerts
                })
            );

        setSuccessMessage("Settings saved successfully");

            setTimeout(() => setSuccessMessage(""), 3000);

        } catch (error) {

            setApiError(
                error?.response?.data?.detail ||
                error?.response?.data?.message ||
                "Failed to save settings"
            );

        } finally {

            setSaving(false);

        }

    };

    const options = [
        {
            title: "Notifications",
            icon: <Bell size={20} />,
            field: "notifications"
        },
        {
            title: theme.isDark
                ? "Dark Theme"
                : "Light Theme",
            icon: <Moon size={20} />,
            field: "theme"
        },
        {
            title: "Security Alerts",
            icon: <Shield size={20} />,
            field: "securityAlerts"
        }
    ];

    if (loading) {

        return (
            <MainLayout>
                <Loader text="Loading Settings" />
            </MainLayout>
        );

    }

    return (

        <MainLayout>

            <div className="space-y-4 px-4 sm:px-6 lg:px-8">

                <PageHeader
                    title="Settings"
                    subtitle={isAdmin ? "Manage platform controls and preferences" : "Manage vendor preferences and platform controls"}
                />

                {apiError && (
                    <div
                        style={{
                            padding: "10px 14px",
                            borderRadius: "12px",
                            background: "rgba(239,68,68,0.10)",
                            border: "1px solid rgba(239,68,68,0.25)",
                            color: "#EF4444",
                            fontSize: "13px",
                            fontWeight: 500
                        }}
                    >
                        {apiError}
                    </div>
                )}

                {successMessage && (
                    <div
                        style={{
                            padding: "10px 14px",
                            borderRadius: "12px",
                            background: "rgba(34,197,94,0.10)",
                            border: "1px solid rgba(34,197,94,0.25)",
                            color: "#22C55E",
                            fontSize: "13px",
                            fontWeight: 500
                        }}
                    >
                        {successMessage}
                    </div>
                )}

                {/* Profile Settings — hidden for admin */}

                {!isAdmin && (
                <Card>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "14px"
                        }}
                    >

                        <UserCog
                            color="#7C5AF6"
                        />

                        <h2
                            style={{
                                fontSize: "16px",
                                fontWeight: 700,
                                color:
                                    theme.textPrimary
                            }}
                        >
                            Profile Preferences
                        </h2>

                    </div>

                    <div
                        className="
                            grid
                            md:grid-cols-2
                            gap-3
                            md:gap-5
                        "
                    >

                        <input
                            value={
                                settings.displayName
                            }
                            onChange={(event) =>
                                updateField(
                                    "displayName",
                                    event.target.value
                                )
                            }
                            placeholder="Display Name"
                            style={{
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "10px 14px",
                                borderRadius: "12px",
                                border: `1px solid ${theme.inputBorder}`,
                                background: theme.inputBg,
                                color: theme.inputText,
                                fontSize: "13px",
                                outline: "none"
                            }}
                        />

                        <input
                            value={
                                settings.email
                            }
                            readOnly
                            style={{
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "10px 14px",
                                borderRadius: "12px",
                                border: `1px solid ${theme.inputBorder}`,
                                background: theme.inputBg,
                                color: theme.inputText,
                                fontSize: "13px",
                                opacity: 0.8,
                                outline: "none"
                            }}
                        />

                    </div>

                </Card>
                )}

                {/* Platform Controls */}

                <Card>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "14px"
                        }}
                    >

                        <Shield
                            color="#7C5AF6"
                        />

                        <h2
                            style={{
                                fontSize: "16px",
                                fontWeight: 700,
                                color:
                                    theme.textPrimary
                            }}
                        >
                            Platform Controls
                        </h2>

                    </div>

                    <div
                        className="
                            space-y-2
                        "
                    >

                        {options.map(item => (

                            <div
                                key={item.title}
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems:
                                        "center",
                                    padding: "12px 14px",
                                    borderRadius:
                                        "14px",
                                    background:
                                        theme.panelBg,
                                    border:
                                        `1px solid ${theme.cardBorder}`
                                }}
                            >

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems:
                                            "center",
                                        gap: "10px"
                                    }}
                                >

                                    <div
                                        style={{
                                            width: "34px",
                                            height: "34px",
                                            borderRadius:
                                                "10px",
                                            background:
                                                "rgba(124,90,246,0.12)",
                                            color:
                                                "#7C5AF6",
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center"
                                        }}
                                    >
                                        {item.icon}
                                    </div>

                                    <h3
                                        style={{
                                            fontWeight: 600,
                                            fontSize: "14px",
                                            color: theme.textPrimary,
                                            margin: 0
                                        }}
                                    >
                                        {item.title}
                                    </h3>

                                </div>

                                <button
                                    onClick={() => {

                                        if (item.field === "theme") {
                                            theme.toggleTheme();
                                            return;
                                        }

                                        updateField(
                                            item.field,
                                            !settings[item.field]
                                        );

                                    }}
                                    style={{
                                        width: "44px",
                                        height: "24px",
                                        borderRadius:
                                            "999px",
                                        border: "none",
                                        cursor:
                                            "pointer",
                                        position:
                                            "relative",
                                        flexShrink: 0,
                                        background:
                                            item.field === "theme"
                                                ? (
                                                    theme.isDark
                                                        ? "#7C5AF6"
                                                        : "#94A3B8"
                                                )
                                                : (
                                                    settings[item.field]
                                                        ? "#7C5AF6"
                                                        : "#94A3B8"
                                                )
                                    }}
                                >

                                    <div
                                        style={{
                                            position:
                                                "absolute",
                                            top: "3px",
                                            left:
                                                (
                                                    item.field === "theme"
                                                        ? theme.isDark
                                                        : settings[item.field]
                                                )
                                                    ? "22px"
                                                    : "3px",
                                            width:
                                                "18px",
                                            height:
                                                "18px",
                                            borderRadius:
                                                "999px",
                                            background:
                                                "#fff",
                                            transition:
                                                "all .25s ease"
                                        }}
                                    />

                                </button>

                            </div>

                        ))}

                    </div>

                </Card>

                <button
                    onClick={
                        saveSettings
                    }
                    disabled={
                        saving
                    }
                    style={{
                        background:
                            "linear-gradient(135deg,#7C5AF6,#A78BFA)",
                        color: "#fff",
                        border: "none",
                        borderRadius:
                            "12px",
                        padding:
                            "10px 18px",
                        fontWeight: 600,
                        fontSize: "13px",
                        display: "flex",
                        alignItems:
                            "center",
                        justifyContent: "center",
                        gap: "8px",
                        cursor: "pointer",
                        width: "100%",
                        maxWidth: "200px",
                        minHeight: "42px"
                    }}
                >

                    {saving
                        ? "Saving..."
                        : (
                            <>
                                <Save size={18} />
                                Save Settings
                            </>
                        )}

                </button>

            </div>

        </MainLayout>

    );

};

export default SettingsPage;