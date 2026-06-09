import {
    LayoutDashboard,
    Building2,
    User,
    Bookmark,
    Settings,
    LogOut,
    BrainCircuit,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    X
} from "lucide-react";

import {
    useNavigate,
    useLocation
} from "react-router-dom";

import useAuth from "../../../hooks/useAuth";

import {
    useTheme
} from "../../../context/ThemeContext";

const Sidebar = ({
    sidebarOpen,
    setSidebarOpen,
    collapsed,
    setCollapsed
}) => {

    const navigate = useNavigate();

    const location = useLocation();

    const {
        logout
    } = useAuth();

    useTheme();

    const menuItems = [

        {
            label: "Dashboard",
            icon: <LayoutDashboard size={22} />,
            path: "/dashboard"
        },

        {
            label: "Vendor Marketplace",
            icon: <Building2 size={22} />,
            path: "/vendors"
        },

        {
            label: "Profile",
            icon: <User size={22} />,
            path: "/profile"
        },

        {
            label: "Recommendations",
            icon: <BrainCircuit size={22} />,
            path: "/recommendations"
        },

        {
            label: "Saved Vendors",
            icon: <Bookmark size={22} />,
            path: "/saved-vendors"
        },

        {
            label: "Settings",
            icon: <Settings size={22} />,
            path: "/settings"
        }

    ];

    const handleNavigate = (path) => {

        navigate(path);

        if (
            window.innerWidth < 1024
        ) {

            setSidebarOpen(false);

        }

    };

    const handleLogout = async () => {

        await logout();

        navigate("/login");

    };

    return (

        <aside
            className={`

            fixed
            top-0
            left-0

            h-screen

            z-50

            overflow-hidden

            border-r
            border-slate-200

            bg-white/80

            backdrop-blur-2xl

            shadow-xl

            transition-all
            duration-300

            ${collapsed
                ? "w-[95px]"
                : "w-[280px]"
            }

            ${sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }

            `}
        >

            <div
                className="
                h-full
                flex
                flex-col
                "
            >

                {/* HEADER */}

                <div
                    className="
                    px-4
                    pt-6
                    pb-5

                    border-b
                    border-slate-200
                    "
                >

                    <div
                        className="
                        flex
                        items-center
                        justify-between
                        "
                    >

                        {

                            !collapsed && (

                                <div
                                    className="
                                    flex
                                    items-center
                                    gap-3
                                    "
                                >

                                    <div
                                        className="
                                        h-12
                                        w-12

                                        rounded-2xl

                                        bg-gradient-to-r
                                        from-indigo-500
                                        to-purple-500

                                        flex
                                        items-center
                                        justify-center

                                        text-white

                                        shadow-lg
                                        "
                                    >

                                        <Sparkles size={20} />

                                    </div>

                                    <div>

                                        <h1
                                            className="
                                            font-bold
                                            text-xl
                                            text-slate-900
                                            "
                                        >

                                            Vendor Hub

                                        </h1>

                                        <p
                                            className="
                                            text-xs
                                            text-slate-400
                                            "
                                        >

                                            Enterprise Suite

                                        </p>

                                    </div>

                                </div>

                            )

                        }

                        <div
                            className="
                            flex
                            gap-2
                            "
                        >

                            <button

                                onClick={() =>
                                    setCollapsed(
                                        previous =>
                                            !previous
                                    )
                                }

                                className="
                                hidden
                                lg:flex

                                h-11
                                w-11

                                items-center
                                justify-center

                                rounded-xl

                                border
                                border-slate-200

                                bg-white

                                shadow-sm

                                hover:bg-slate-50
                                "
                            >

                                {

                                    collapsed

                                        ?

                                        <ChevronRight size={18} />

                                        :

                                        <ChevronLeft size={18} />

                                }

                            </button>

                            <button

                                onClick={() =>
                                    setSidebarOpen(false)
                                }

                                className="
                                lg:hidden

                                h-11
                                w-11

                                flex
                                items-center
                                justify-center

                                rounded-xl

                                border
                                border-slate-200

                                bg-white
                                "
                            >

                                <X />

                            </button>

                        </div>

                    </div>

                </div>

                {/* MENU */}

                <div
                    className="
                    flex-1

                    overflow-y-auto
                    overflow-x-hidden

                    px-4
                    py-5

                    space-y-2
                    "
                >

                    {

                        menuItems.map((item) => {

                            const active =

                                location.pathname === item.path;

                            return (

                                <button

                                    key={item.label}

                                    onClick={() =>
                                        handleNavigate(
                                            item.path
                                        )
                                    }

                                    className={`

                                    w-full

                                    flex
                                    items-center

                                    ${collapsed
                                            ? "justify-center"
                                            : "gap-4"
                                        }

                                    px-4
                                    py-4

                                    rounded-2xl

                                    transition-all

                                    ${active

                                            ?

                                            "bg-indigo-50 text-indigo-600 shadow-sm"

                                            :

                                            "text-slate-600 hover:bg-slate-100 hover:text-indigo-600"

                                        }

                                    `}
                                >

                                    <div
                                        className={`

                                        min-w-[42px]
                                        h-[42px]

                                        flex
                                        items-center
                                        justify-center

                                        rounded-xl

                                        ${active

                                                ?

                                                "bg-indigo-100"

                                                :

                                                ""

                                            }

                                        `}
                                    >

                                        {

                                            item.icon

                                        }

                                    </div>

                                    {

                                        !collapsed && (

                                            <span>

                                                {

                                                    item.label

                                                }

                                            </span>

                                        )

                                    }

                                </button>

                            );

                        })

                    }

                </div>

                {/* FOOTER */}

                <div
                    className="
                    p-4

                    border-t
                    border-slate-200
                    "
                >

                    <button

                        onClick={handleLogout}

                        className="
                        w-full

                        flex
                        items-center
                        justify-center
                        gap-3

                        py-4

                        rounded-2xl

                        bg-red-50

                        text-red-500

                        hover:bg-red-100

                        font-semibold

                        transition-all
                        "
                    >

                        <LogOut size={18} />

                        {

                            !collapsed &&

                            "Logout"

                        }

                    </button>

                </div>

            </div>

        </aside>

    );

};

export default Sidebar;