import { useState, useEffect } from "react";

import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";

const DashboardLayout = ({
    children
}) => {

    const [

        sidebarOpen,

        setSidebarOpen

    ] = useState(false);

    const [

        collapsed,

        setCollapsed

    ] = useState(false);

    const [

        mobile,

        setMobile

    ] = useState(

        window.innerWidth < 1024

    );

    useEffect(()=>{

        const handleResize=()=>{

            const mobileScreen=

                window.innerWidth<1024;

            setMobile(

                mobileScreen

            );

            if(

                !mobileScreen

            ){

                setSidebarOpen(

                    false

                );

            }

        };

        window.addEventListener(

            "resize",

            handleResize

        );

        return()=>{

            window.removeEventListener(

                "resize",

                handleResize

            );

        };

    },[]);


    const toggleSidebar=()=>{

        if(

            mobile

        ){

            setSidebarOpen(

                previous=>

                !previous

            );

        }

        else{

            setCollapsed(

                previous=>

                !previous

            );

        }

    };

    return(

        <div

            className="

            min-h-screen

            flex

            bg-gradient-to-br

            from-[#F8FAFF]

            via-[#F4F7FC]

            to-[#EEF3FF]

            overflow-hidden

            "

        >

            {/* MOBILE OVERLAY */}

            {

                sidebarOpen &&

                mobile && (

                    <div

                        onClick={()=>

                            setSidebarOpen(

                                false

                            )

                        }

                        className="

                        fixed

                        inset-0

                        bg-black/30

                        backdrop-blur-sm

                        z-40

                        lg:hidden

                        "

                    />

                )

            }

            {/* SIDEBAR */}

            <Sidebar

                sidebarOpen={

                    sidebarOpen

                }

                setSidebarOpen={

                    setSidebarOpen

                }

                collapsed={

                    collapsed

                }

                setCollapsed={

                    setCollapsed

                }

            />

            {/* CONTENT */}

            <div

                className={`

                flex-1

                flex

                flex-col

                min-w-0

                transition-all

                duration-300

                ease-in-out

                ${

                    mobile

                    ?

                    ""

                    :

                    collapsed

                    ?

                    "lg:ml-[95px]"

                    :

                    "lg:ml-[280px]"

                }

                `}

            >

                {/* NAVBAR */}

                <Navbar

                    toggleSidebar={

                        toggleSidebar

                    }

                    setSidebarOpen={

                        setSidebarOpen

                    }

                />

                {/* MAIN */}

                <main

                    className="

                    flex-1

                    overflow-y-auto

                    p-6

                    md:p-8

                    lg:p-10

                    "

                >

                    <div

                        className="

                        max-w-[1650px]

                        mx-auto

                        "

                    >

                        {children}

                    </div>

                </main>

            </div>

        </div>

    );

};

export default DashboardLayout;